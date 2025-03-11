using Chores.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace Chores.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Home> Homes { get; set; }
        public DbSet<GroceryItem> GroceryItems { get; set; }
        public DbSet<GroceryList> GroceryLists { get; set; }
    }
}
