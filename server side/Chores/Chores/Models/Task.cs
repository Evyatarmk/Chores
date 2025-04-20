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

        public TimeSpan StartTime { get; set; }  // You can also use TimeSpan or combine with DateTime
        public TimeSpan EndTime { get; set; }

        public int? MaxParticipants { get; set; }

        public bool Status { get; set; }

        public string? CompletedByUserId { get; set; } // NEW
        public DateTime? CompletedDate { get; set; }  // NEW

        public List<User> Participants { get; set; } = new();

    }
}
