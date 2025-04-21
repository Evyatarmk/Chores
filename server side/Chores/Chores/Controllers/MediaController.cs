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
            var home = await _context.Homes
                .Include(h => h.Users)
                .ThenInclude(u => u.MediaItems)
                .FirstOrDefaultAsync(h => h.Id == homeId);

            if (home == null)
                return NotFound("Home not found");

                // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
                var isLocal = Request.Host.Host.Contains("localhost");
                var baseUrl = isLocal
                    ? $"{Request.Scheme}://{Request.Host}/uploads"
                    : "https://proj.ruppin.ac.il/cgroup83/test2/tar1/uploads";


            var userMediaDtos = home.Users.Select(user => new UserMediaDto
            {
                UserId = user.Id,
                Username = user.Name,
                ProfileImage = string.IsNullOrWhiteSpace(user.ProfilePicture)? null: $"{baseUrl}/{user.ProfilePicture}",
                Media = user.MediaItems.Select(media => new MediaItemDto
                {
                    MediaId = media.Id,
                    Type = media.Type,
                    Uri = $"{baseUrl}/{media.Uri}",
                    UploadDate = media.UploadDate,
                    UploadTime = media.UploadTime
                }).ToList()
            }).ToList();

            return Ok(userMediaDtos);
        }


        [HttpPost("home/{homeId}/users/{userId}/media")]
        public async Task<IActionResult> AddMediaItem(string homeId, string userId, [FromForm] CreateMediaItemDto dto)
        {
            // בדיקת בית
            var home = await _context.Homes
                .Include(h => h.Users)
                .FirstOrDefaultAsync(h => h.Id == homeId);
            if (home == null)
                return NotFound("Home not found");

            // בדיקת משתמש
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.HomeId == homeId);
            if (user == null)
                return NotFound("User not found in this home");

            // בדיקת קובץ
            if (dto.MediaFile == null || dto.MediaFile.Length == 0)
                return BadRequest("Media file is required.");

            // יצירת אובייקט מדיה
            var media = new MediaItem
            {
                Id = Guid.NewGuid().ToString(),
                Type = dto.Type,
                UploadDate = DateTime.Now.ToString("yyyy-MM-dd"),
                UploadTime = DateTime.Now.ToString("HH:mm:ss"),
                UserId = userId
            };

            try
            {
                // שמירת הקובץ בתיקיית wwwroot/uploads
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var extension = Path.GetExtension(dto.MediaFile.FileName);
                if (string.IsNullOrEmpty(extension))
                {
                    extension = dto.MediaFile.ContentType switch
                    {
                        "image/jpeg" => ".jpg",
                        "image/png" => ".png",
                        "video/mp4" => ".mp4",
                        "video/quicktime" => ".mov",
                        _ => ".dat"
                    };
                }

                var fileName = Guid.NewGuid().ToString() + extension;
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.MediaFile.CopyToAsync(fileStream);
                }

                media.Uri = fileName;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error saving media file: {ex.Message}");
            }

            _context.MediaItems.Add(media);
            await _context.SaveChangesAsync();

            // ⚠️ עדכון הנתיב הציבורי שכולל את מיקומך תחת cgroup83/test2/tar1
            var result = new
            {
                MediaId = media.Id,
                Type = media.Type,
                Uri = $"https://proj.ruppin.ac.il/cgroup83/test2/tar1/uploads/{media.Uri}",
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
