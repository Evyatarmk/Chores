namespace Chores.Models
{
    public class List
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string HomeId { get; set; }
        public string Category { get; set; } 
        public DateTime? Date { get; set; } 
        public List<Item> Items { get; set; } = new List<Item>();
    }
}