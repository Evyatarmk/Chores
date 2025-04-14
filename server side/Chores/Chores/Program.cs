using Chores.Data;
using Chores.Utils;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ?? ����� Authentication �� JWT
var key = Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false, // ��� ���� ���� �� �-issuer
            ValidateAudience = false, // ��� ���� ���� �� �-audience
            ValidateLifetime = true // ����� ���� �����
        };
    });

builder.Services.AddAuthorization(); // ����� Authorization
builder.Services.AddScoped<TokenService>();

// ����� DbContext �� ����� ����� ������
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ����� ������� �����
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

// ����� ����� ���� ������ wwwroot
app.UseStaticFiles();

// ����� ����� ����� ���� ������ uploads
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), @"uploads");

// ��� �������� �����, ��� �� - ��� ����
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

// ����� �-Authentication �-Authorization
app.UseAuthentication(); // ����� �����
app.UseAuthorization(); // ����� ������

app.MapControllers();

app.Run();
