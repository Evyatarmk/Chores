﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Chores.Data;
using Chores.Models;
using Chores.Utils; 
using System.Text;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;
using System.Security.Claims;


namespace Chores.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService; // הוספנו את ה-TokenService

        public UsersController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService; // איניציאליזציה של ה-TokenService
        }

        // 📌 הרשמה עם הצטרפות לבית קיים
        [HttpPost("register/existinghome")]
        public async Task<ActionResult<object>> RegisterWithExistingHome([FromBody] RegisterWithExistingHomeRequest request)
        {
            if (!IsValidEmail(request.RegisterUser.Email))
                return BadRequest("Invalid email format.");

            if (request.RegisterUser.Password.Length < 8)
                return BadRequest("Password must be at least 8 characters long.");

            // בדיקה אם המייל קיים
            if (await _context.Users.AnyAsync(u => u.Email == request.RegisterUser.Email))
            {
                return BadRequest("Email already exists.");
            }

            // חיפוש בית קיים לפי קוד
            var home = await _context.Homes
                .Include(h => h.Users) // כל המשתמשים בבית
                .FirstOrDefaultAsync(h => h.Code == request.HomeCode);

            if (home == null)
            {
                return BadRequest("Invalid home code.");
            }

            User user = new()
            {
                Id = Guid.NewGuid().ToString(), // מזהה ייחודי
                Name = request.RegisterUser.Name,
                Email = request.RegisterUser.Email,
                Password = HashPassword(request.RegisterUser.Password),
                HomeId = home.Id,
                Role = "user",
            };

            home.Users.Add(user);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // יצירת טוקן גישה ו-refresh token
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // עדכון המשתמש עם ה-refresh token במסד הנתונים
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddYears(1); // תוקף לשנה
            await _context.SaveChangesAsync();
            // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
            var isLocal = Request.Host.Host.Contains("localhost");
            var baseUrl = isLocal
                ? $"{Request.Scheme}://{Request.Host}"
                : "https://proj.ruppin.ac.il/cgroup83/test2/tar1";

            string fullUri = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                fullUri = $"{baseUrl}/uploads/{user.ProfilePicture}";
            }
            // המרת המידע ל-DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = fullUri // אם יש תמונת פרופיל
            };

            // המרת רשימת החברים לבית ל-MemberDto
            var homeDto = new HomeDto
            {
                Id = home.Id,
                Name = home.Name,
                Code = home.Code,
                Members = home.Users.Select(u => new MemberDto
                {
                    Name = u.Name,
                    Role = u.Role,
                    PublicId = u.Id // Assuming PublicId is the User's Id
                }).ToList()
            };

            return Ok(new
            {
                accessToken,
                refreshToken,
                user = userDto,
                home = homeDto
            });
        }


        // 📌 הרשמה עם יצירת בית חדש
        [HttpPost("register/newhome")]
        public async Task<ActionResult<object>> RegisterWithNewHome([FromBody] RegisterWithNewHomeRequest request)
        {
            if (!IsValidEmail(request.RegisterUser.Email))
                return BadRequest("Invalid email format.");

            if (request.RegisterUser.Password.Length < 8)
                return BadRequest("Password must be at least 8 characters long.");

            // בדיקה אם המייל קיים
            if (await _context.Users.AnyAsync(u => u.Email == request.RegisterUser.Email))
            {
                return BadRequest("Email already exists.");
            }

            // יצירת בית חדש
            var newHome = new Home
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.HomeName,
                Users = new List<User>(),
                Code = await GenerateUniqueHomeCodeAsync(),

            };

            User user = new()
            {
                Id = Guid.NewGuid().ToString(), // מזהה ייחודי
                Name = request.RegisterUser.Name,
                Email = request.RegisterUser.Email,
                Password = HashPassword(request.RegisterUser.Password),
                HomeId = newHome.Id,
                Role = "admin",
                PublicId = Guid.NewGuid().ToString(), // מזהה ציבורי ייחודי
            };
            newHome.Users.Add(user);

            _context.Homes.Add(newHome);
            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            // יצירת טוקן גישה ו-refresh token
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // עדכון המשתמש עם ה-refresh token במסד הנתונים
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddYears(1); // תוקף לשנה
            await _context.SaveChangesAsync();
            // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
            var isLocal = Request.Host.Host.Contains("localhost");
            var baseUrl = isLocal
                ? $"{Request.Scheme}://{Request.Host}"
                : "https://proj.ruppin.ac.il/cgroup83/test2/tar1";

            string fullUri = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                fullUri = $"{baseUrl}/uploads/{user.ProfilePicture}";
            }
            // המרת המידע ל-DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = fullUri // אם יש תמונת פרופיל
            };

            // המרת רשימת החברים לבית ל-MemberDto
            var homeDto = new HomeDto
            {
                Id = newHome.Id,
                Name = newHome.Name,
                Code = newHome.Code,
                Members = newHome.Users.Select(u => new MemberDto
                {
                    Name = u.Name,
                    Role = u.Role,
                    PublicId = u.PublicId // כאן מציינים את ה-PublicId של המשתמש
                }).ToList()
            };

            return Ok(new
            {
                accessToken,
                refreshToken,
                user = userDto,
                home = homeDto
            });
        }
        // 📌  מעבר לבית חדש
        [Authorize]
        [HttpPost("changeHome/new/{userId}")]
        public async Task<ActionResult<object>> ChangeToNewHome([FromRoute] string userId, [FromBody] NewHomeRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized("User not found.");

            // יצירת בית חדש
            var newHome = new Home
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.HomeName,
                Users = new List<User>(),
                Code = await GenerateUniqueHomeCodeAsync(),
            };

            user.HomeId = newHome.Id;
            user.Role = "admin";
            newHome.Users.Add(user);

            _context.Homes.Add(newHome);
            await _context.SaveChangesAsync();

            // יצירת טוקנים חדשים
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddYears(1);
            await _context.SaveChangesAsync();
            // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
            var isLocal = Request.Host.Host.Contains("localhost");
            var baseUrl = isLocal
                ? $"{Request.Scheme}://{Request.Host}"
                : "https://proj.ruppin.ac.il/cgroup83/test2/tar1";

            string fullUri = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                fullUri = $"{baseUrl}/uploads/{user.ProfilePicture}";
            }
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = fullUri
            };

            var homeDto = new HomeDto
            {
                Id = newHome.Id,
                Name = newHome.Name,
                Code = newHome.Code,
                Members = newHome.Users.Select(u => new MemberDto
                {
                    Name = u.Name,
                    Role = u.Role,
                    PublicId = u.PublicId
                }).ToList()
            };

            return Ok(new
            {
                accessToken,
                refreshToken,
                user = userDto,
                home = homeDto
            });
        }


        // 📌  מעבר לבית קיים
        [Authorize]
        [HttpPost("changeHome/existing/{userId}")]
        public async Task<ActionResult<object>> ChangeToExistingHome([FromRoute] string userId, [FromBody] ExistingHomeRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized("User not found.");

            var home = await _context.Homes
                .Include(h => h.Users)
                .FirstOrDefaultAsync(h => h.Code == request.HomeCode);

            if (home == null)
                return BadRequest("Invalid home code.");

            user.HomeId = home.Id;
            user.Role = "user";

            home.Users.Add(user);
            await _context.SaveChangesAsync();

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddYears(1);
            await _context.SaveChangesAsync();
            // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
            var isLocal = Request.Host.Host.Contains("localhost");
            var baseUrl = isLocal
                ? $"{Request.Scheme}://{Request.Host}"
                : "https://proj.ruppin.ac.il/cgroup83/test2/tar1";

            string fullUri = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                fullUri = $"{baseUrl}/uploads/{user.ProfilePicture}";
            }
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = fullUri
            };

            var homeDto = new HomeDto
            {
                Id = home.Id,
                Name = home.Name,
                Code = home.Code,
                Members = home.Users.Select(u => new MemberDto
                {
                    Name = u.Name,
                    Role = u.Role,
                    PublicId = u.PublicId
                }).ToList()
            };

            return Ok(new
            {
                accessToken,
                refreshToken,
                user = userDto,
                home = homeDto
            });
        }


        // 📌 התחברות - יצירת טוקן ו-Refresh Token
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);
            if (user == null || !VerifyPassword(loginRequest.Password, user.Password))
            {
                return Unauthorized("Invalid email or password.");
            }

            // Create access and refresh tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddYears(1);
            await _context.SaveChangesAsync();

            await _context.Entry(user).ReloadAsync();
            // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
            var isLocal = Request.Host.Host.Contains("localhost");
            var baseUrl = isLocal
                ? $"{Request.Scheme}://{Request.Host}"
                : "https://proj.ruppin.ac.il/cgroup83/test2/tar1";

            string fullUri = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                fullUri = $"{baseUrl}/uploads/{user.ProfilePicture}";
            }
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = fullUri
            };

            HomeDto homeDto = null;

            if (user.HomeId != null)
            {
                var home = await _context.Homes
                    .Include(h => h.Users)
                    .FirstOrDefaultAsync(h => h.Id == user.HomeId);

                if (home != null)
                {
                    homeDto = new HomeDto
                    {
                        Id = home.Id,
                        Name = home.Name,
                        Code = home.Code,
                        Members = home.Users.Select(u => new MemberDto
                        {
                            Name = u.Name,
                            Role = u.Role,
                            PublicId = u.PublicId
                        }).ToList()
                    };
                }
            }

            return Ok(new
            {
                accessToken,
                refreshToken,
                user = userDto,
                home = homeDto
            });
        }


        // 📌 חידוש טוקן באמצעות Refresh Token
        [HttpPost("refresh")]
        public async Task<ActionResult<object>> RefreshToken([FromBody] RefreshRequest refreshRequest)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshRequest.RefreshToken);

            if (user == null)
            {
                return Unauthorized("Invalid or expired refresh token.");
            }

            // יצירת טוקן גישה חדש ו-refresh token חדש
            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // עדכון ה-refresh token במסד הנתונים
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddYears(1);
            await _context.SaveChangesAsync();

            return Ok(new { accessToken = newAccessToken, refreshToken = newRefreshToken });
        }

        // 📌 הצפנת סיסמה
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
        [NonAction]
        public async Task<string> GenerateUniqueHomeCodeAsync()
        {
            var random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            string homeCode;

            do
            {
                // יצירת קוד רנדומלי בגודל 8
                homeCode = new string(Enumerable.Range(0, 8)
                    .Select(_ => chars[random.Next(chars.Length)])
                    .ToArray());

                // בדיקה אם הקוד כבר קיים במערכת
            } while (await _context.Homes.AnyAsync(h => h.Code == homeCode));

            return homeCode;
        }
        private bool IsValidEmail(string email)
        {
            var emailRegex = new Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
            return emailRegex.IsMatch(email);
        }
        // 📌 אימות סיסמה
        private static bool VerifyPassword(string inputPassword, string storedPassword)
        {
            return HashPassword(inputPassword) == storedPassword;
        }

        // 📌 שליפת משתמש לפי ID יחד עם פרטי הבית
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<object>> GetUserWithHome(string id)
        {
            var user = await _context.Users
                .Include(u => u.Home)
                .ThenInclude(h => h.Users)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound("User not found.");

            if (user.Home == null)
                return NotFound("Home not found for this user.");
            // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
            var isLocal = Request.Host.Host.Contains("localhost");
            var baseUrl = isLocal
                ? $"{Request.Scheme}://{Request.Host}"
                : "https://proj.ruppin.ac.il/cgroup83/test2/tar1";

            string fullUri = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                fullUri = $"{baseUrl}/uploads/{user.ProfilePicture}";
            }

            // המרת הנתונים ל-DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = fullUri
            };

            var homeDto = new HomeDto
            {
                Id = user.Home.Id,
                Name = user.Home.Name,
                Code = user.Home.Code,
                Members = user.Home.Users.Select(u => new MemberDto
                {
                    Name = u.Name,
                    Role = u.Role,
                    PublicId = u.Id // Assuming PublicId is the User's Id
                }).ToList()
            };

            return Ok(new
            {
                user = userDto,
                home = homeDto
            });
        }

        [HttpPost("editUserProfilePicAndName")]
        public async Task<IActionResult> EditUserProfile([FromForm] UserUpdateDto userUpdate)
        {
            if (userUpdate == null)
                return BadRequest("Invalid user update data.");

            var user = await _context.Users.FindAsync(userUpdate.Id);
            if (user == null)
                return NotFound("User not found.");

            // שינוי שם רק אם התקבל
            if (!string.IsNullOrEmpty(userUpdate.Name))
                user.Name = userUpdate.Name;

            string fileName = null;

            // שינוי תמונת פרופיל אם התקבלה
            if (userUpdate.ProfilePicture != null && userUpdate.ProfilePicture.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                // מחיקת קובץ קודם אם קיים
                if (!string.IsNullOrEmpty(user.ProfilePicture))
                {
                    var oldFilePath = Path.Combine(uploadsFolder, user.ProfilePicture); // לא מוסיף שוב "uploads"
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                        catch (Exception ex)
                        {
                            return StatusCode(500, $"Error deleting old profile picture: {ex.Message}");
                        }
                    }
                }

                var extension = Path.GetExtension(userUpdate.ProfilePicture.FileName);
                if (string.IsNullOrEmpty(extension))
                {
                    extension = userUpdate.ProfilePicture.ContentType switch
                    {
                        "image/jpeg" => ".jpg",
                        "image/png" => ".png",
                        _ => ".jpg"
                    };
                }

                fileName = Guid.NewGuid().ToString() + extension;
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await userUpdate.ProfilePicture.CopyToAsync(stream);
                }

                // שמירה של שם הקובץ בלבד במסד הנתונים
                user.ProfilePicture = fileName;
            }

            try
            {
                await _context.SaveChangesAsync();

                // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
                var isLocal = Request.Host.Host.Contains("localhost");
                var baseUrl = isLocal
                    ? $"{Request.Scheme}://{Request.Host}"
                    : "https://proj.ruppin.ac.il/cgroup83/test2/tar1";

                string fullUri = null;
                if (!string.IsNullOrEmpty(user.ProfilePicture))
                {
                    fullUri = $"{baseUrl}/uploads/{user.ProfilePicture}";
                }
                return Ok(new
                {
                    user.Id,
                    user.Name,
                    profilePicture = fullUri
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }





        [HttpPut("updateHomeId")]
        public async Task<IActionResult> UpdateHomeId([FromBody] UpdateHomeRequest updateHomeRequest)
        {
            if (updateHomeRequest == null || string.IsNullOrWhiteSpace(updateHomeRequest.UserId))
            {
                return BadRequest("UserId is required.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == updateHomeRequest.UserId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (updateHomeRequest.HomeCode != null)
            {
                // If the HomeCode is provided, try to find the corresponding home
                var home = await _context.Homes.FirstOrDefaultAsync(h => h.Code == updateHomeRequest.HomeCode);

                if (home == null)
                {
                    return NotFound("Home not found.");
                }

                // Update the user's HomeId to the found home's ID
                user.HomeId = home.Id;
            }
            else
            {
                // If HomeCode is null, update the user's HomeId to null
                user.HomeId = null;
            }

            await _context.SaveChangesAsync(); // Save changes to the database
                                               // קביעת base URL לפי סביבת העבודה (לוקאלית או פרודקשן)
            var isLocal = Request.Host.Host.Contains("localhost");
            var baseUrl = isLocal
                ? $"{Request.Scheme}://{Request.Host}"
                : "https://proj.ruppin.ac.il/cgroup83/test2/tar1";

            string fullUri = null;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
            {
                fullUri = $"{baseUrl}/uploads/{user.ProfilePicture}";
            }
            // Return success with the updated user data
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId, // Return updated HomeId (could be null)
                ProfilePicture = fullUri
            };

            return Ok(new { success = true, message = "Home updated successfully.", user = userDto });
        }

        [HttpDelete("leaveHome")]
        public async Task<IActionResult> LeaveHome([FromBody] LeaveHomeDto dto)
        {
            if (string.IsNullOrEmpty(dto.UserId))
                return BadRequest("User ID is required.");

            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return NotFound("User not found.");

            if (string.IsNullOrEmpty(user.HomeId))
                return BadRequest("User is not associated with a home.");

            user.HomeId = null;
            await _context.SaveChangesAsync();

            return Ok("התנתקת מהבית בהצלחה.");
        }



        public class RefreshRequest
        {
            public string RefreshToken { get; set; }
        }
        public class RegisterWithExistingHomeRequest
        {
            public RegisterRequest RegisterUser { get; set; }
            public string HomeCode { get; set; }
        }
        public class RegisterWithNewHomeRequest
        {
            public RegisterRequest RegisterUser { get; set; }
            public string HomeName { get; set; }
        }
        public class NewHomeRequest
        {
            public string HomeName { get; set; }
        }

        public class ExistingHomeRequest
        {
            public string HomeCode { get; set; }
        }
    }
}
