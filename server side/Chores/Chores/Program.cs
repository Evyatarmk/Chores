using Chores.Data;
using Chores.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ?? הוספת Authentication עם JWT
var key = Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false, // אין צורך לאמת את ה-issuer
            ValidateAudience = false, // אין צורך לאמת את ה-audience
            ValidateLifetime = true // אימות תוקף הטוקן
        };
    });

builder.Services.AddAuthorization(); // הוספת Authorization
builder.Services.AddScoped<TokenService>();

// הוספת DbContext עם חיבור לבסיס נתונים
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// הוספת שירותים אחרים
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (true)
{
    app.UseDeveloperExceptionPage(); 
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// שירות קבצים מתוך תיקיית wwwroot
app.UseStaticFiles();

// הגדרת שירות קבצים מתוך תיקיית uploads
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), @"uploads");

// ודא שהתיקייה קיימת, ואם לא - צור אותה
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions()
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = new PathString("/uploads")
});
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

// שימוש ב-Authentication ו-Authorization
app.UseAuthentication(); // הוספת אימות
app.UseAuthorization(); // הוספת הרשאות

app.MapControllers();

app.Run();
