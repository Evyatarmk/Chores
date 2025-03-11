namespace Chores.Models
{
    public class User
    {
        public User(string id, string name, string email, string password, string homeId, string role, string profilePicture)
        {
            Id = id;
            Name = name;
            Email = email;
            Password = password;
            HomeId = homeId;
            Role = role;
            ProfilePicture = profilePicture;
        }

            public string Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string HomeId { get; set; }
            public string Role { get; set; } = string.Empty;
            public string ProfilePicture { get; set; } = string.Empty;
        
    }
}
