using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Chores.Data;
using Chores.Models;
using Chores.Utils; 
using System.Text;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;


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

            // המרת המידע ל-DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = user.ProfilePicture // אם יש תמונת פרופיל
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
                Name =  request.HomeName,
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

            // המרת המידע ל-DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = user.ProfilePicture // אם יש תמונת פרופיל
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




        // 📌 התחברות - יצירת טוקן ו-Refresh Token
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);
            if (user == null || !VerifyPassword(loginRequest.Password, user.Password))
            {
                return Unauthorized("Invalid email or password.");
            }

            // יצירת טוקן גישה ו-refresh token
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            // עדכון המשתמש עם ה-refresh token במסד הנתונים
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddYears(1); // תוקף לשנה
            await _context.SaveChangesAsync();

            // המרת המידע ל-DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = user.ProfilePicture // אם יש תמונת פרופיל
            };

            // שליפת הבית של המשתמש
            var home = await _context.Homes.Include(h => h.Users)
                                           .FirstOrDefaultAsync(h => h.Id == user.HomeId);

            if (home == null)
            {
                return NotFound("Home not found.");
            }

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
                    PublicId = u.PublicId
                }).ToList()
            };

            // החזרת המידע
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

            if (user == null )
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

            // המרת הנתונים ל-DTO
            var userDto = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                HomeId = user.HomeId,
                ProfilePicture = user.ProfilePicture
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
}
