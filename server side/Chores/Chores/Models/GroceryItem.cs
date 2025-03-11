namespace Chores.Models
{
    public class GroceryItem
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public bool IsTaken { get; set; }
        public string Description { get; set; }
        public string GroceryListId { get; set; }
    }
}
