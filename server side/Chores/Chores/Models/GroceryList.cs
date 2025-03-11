namespace Chores.Models
{
    public class GroceryList
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string HomeId { get; set; }
        public List<GroceryItem> Items { get; set; } = new List<GroceryItem>();
    }
}
