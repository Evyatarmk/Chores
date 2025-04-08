namespace Chores.Models
{
    public class Task
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        public string HomeId { get; set; }
        public string Category { get; set; }
        public string Color { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string StartTime { get; set; }  // You can also use TimeSpan or combine with DateTime
        public string EndTime { get; set; }

        public int? MaxParticipants { get; set; }

        public List<User> Participants { get; set; } = new();
    }
}
