using System.ComponentModel.DataAnnotations;

namespace Chores.Models
{
    public class Home
    {
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public List<List> Lists { get; set; } = new List<List>();
        public List<User> Users { get; set; } = new List<User>();


    }
}
