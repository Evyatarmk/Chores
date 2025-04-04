namespace Chores.Models
{
    public class UserDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string HomeId { get; set; }
        public string ProfilePicture { get; set; } = string.Empty;

    }
    public class MemberDto
    {
        public string Name { get; set; }
        public string Role { get; set; }
        public string PublicId { get; set; }
    }
    public class HomeDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public List<MemberDto> Members { get; set; } // כל חברי הבית
    }
}
