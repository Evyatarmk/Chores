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
    public class MediaItemDto
    {
        public string MediaId { get; set; }
        public string Type { get; set; }
        public string Uri { get; set; }
        public string UploadDate { get; set; }
        public string UploadTime { get; set; }
    }

    public class UserMediaDto
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public string ProfileImage { get; set; }
        public List<MediaItemDto> Media { get; set; }
    }
    public class CreateMediaItemDto
    {
        public IFormFile MediaFile { get; set; }  // שדה קובץ
        public string Type { get; set; }
        public string UploadDate { get; set; }
        public string UploadTime { get; set; }
    }


    public class TaskDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string HomeId { get; set; }
        public string Category { get; set; }
        public string Color { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int? MaxParticipants { get; set; }

        public List<ParticipantDto> Participants { get; set; }
    }


    public class ParticipantDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}
