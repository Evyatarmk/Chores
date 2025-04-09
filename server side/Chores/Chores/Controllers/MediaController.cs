using Chores.Data;
using Chores.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chores.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaController : Controller
    {
        private readonly AppDbContext _context;

        public MediaController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("home/{homeId}/media")]
        public async Task<IActionResult> GetMediaForHome(string homeId)
        {
            // חיפוש הבית לפי ID
            var home = await _context.Homes
                .Include(h => h.Users) // כולל את כל המשתמשים של הבית
                .ThenInclude(u => u.MediaItems) // כולל את כל המדיה של המשתמשים
                .FirstOrDefaultAsync(h => h.Id == homeId);

            // אם לא נמצא הבית
            if (home == null)
                return NotFound("Home not found");

            // יצירת רשימה של משתמשים ומדיה עבורם
            var userMediaDtos = home.Users.Select(user => new UserMediaDto
            {
                UserId = user.Id,
                Username = user.Name,
                ProfileImage = user.ProfilePicture,
                Media = user.MediaItems.Select(media => new MediaItemDto
                {
                    MediaId = media.Id,
                    Type = media.Type,
                    // יצירת ה-URI עם הכתובת המלאה
                    Uri = $"https://{Request.Host}/uploads/{media.Uri}",
                    UploadDate = media.UploadDate,
                    UploadTime = media.UploadTime
                }).ToList()
            }).ToList();

            // החזרת התוצאה
            return Ok(userMediaDtos);
        }


        [HttpPost("home/{homeId}/users/{userId}/media")]
        public async Task<IActionResult> AddMediaItem(string homeId, string userId, [FromForm] CreateMediaItemDto dto)
        {
            // חיפוש הבית לפי ID
            var home = await _context.Homes
                .Include(h => h.Users)
                .FirstOrDefaultAsync(h => h.Id == homeId);

            if (home == null)
                return NotFound("Home not found");

            // חיפוש המשתמש לפי ID
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.HomeId == homeId);

            if (user == null)
                return NotFound("User not found in this home");

            // יצירת אובייקט מדיה חדש
            var media = new MediaItem
            {
                Id = Guid.NewGuid().ToString(),
                Type = dto.Type,
                UploadDate = dto.UploadDate,
                UploadTime = dto.UploadTime,
                UserId = userId
            };

            // בדיקת אם יש קובץ בתנאי הבקשה
            if (dto.MediaFile != null && dto.MediaFile.Length > 0)
            {
                try
                {
                    // יצירת תיקיית uploads אם אין כבר כזאת
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    // יצירת שם קובץ ייחודי
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.MediaFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    // שמירת הקובץ בדיסק
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.MediaFile.CopyToAsync(fileStream);
                    }

                    // עדכון ה-URI עם המיקום החדש של הקובץ
                    var fileUri = $"https://{Request.Host}/uploads/{fileName}";
                    media.Uri = fileName; // שמירה רק בשם הקובץ
                }
                catch (Exception ex)
                {
                    // במקרה של שגיאה בשמירת הקובץ, מחזירים שגיאה
                    return StatusCode(500, $"Error saving media file: {ex.Message}");
                }
            }

            // הוספת המדיה למסד הנתונים
            _context.MediaItems.Add(media);
            await _context.SaveChangesAsync();

            // החזרת התוצאה עם ה-URI הכולל את שם הקובץ
            var result = new
            {
                MediaId = media.Id,
                Type = media.Type,
                Uri = $"https://{Request.Host}/uploads/{media.Uri}",
                UploadDate = media.UploadDate,
                UploadTime = media.UploadTime
            };

            return CreatedAtAction(nameof(GetMediaForHome), new { homeId = home.Id }, result);
        }

        [HttpDelete("home/{homeId}/users/{userId}/media/{mediaId}")]
        public async Task<IActionResult> DeleteMediaItem(string homeId, string userId, string mediaId)
        {
            // חיפוש הבית לפי ID
            var home = await _context.Homes
                .Include(h => h.Users)
                .FirstOrDefaultAsync(h => h.Id == homeId);

            if (home == null)
                return NotFound("Home not found");

            // חיפוש המשתמש לפי ID
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.HomeId == homeId);

            if (user == null)
                return NotFound("User not found in this home");

            // חיפוש המדיה לפי ID
            var mediaItem = await _context.MediaItems
                .FirstOrDefaultAsync(m => m.Id == mediaId && m.UserId == userId);

            if (mediaItem == null)
                return NotFound("Media item not found");

            // מחיקת הקובץ מהשרת
            try
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", Path.GetFileName(mediaItem.Uri));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath); // מחיקת הקובץ
                }
            }
            catch (Exception ex)
            {
                // במקרה של שגיאה במחיקת הקובץ
                return StatusCode(500, $"Error deleting media file from server: {ex.Message}");
            }

            // מחיקת המדיה מהמסד נתונים
            _context.MediaItems.Remove(mediaItem);
            await _context.SaveChangesAsync();

            return NoContent(); // מחזיר מצב 204 - No Content לאחר מחיקה מוצלחת
        }

    }
}
