using System.ComponentModel.DataAnnotations;

namespace Chores.Models
{
    public class Home
    {
        public Home(string id, string name, string code)
        {
            Id = id;
            Name = name;
            Code = code;
        }

        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
}
