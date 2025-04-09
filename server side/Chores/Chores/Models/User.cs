namespace Chores.Models
{
    public class User
    {
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string HomeId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string ProfilePicture { get; set; } = string.Empty;
        public string? PublicId { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public Home? Home { get; set; }
        public List<MediaItem> MediaItems { get; set; }

    }
}
