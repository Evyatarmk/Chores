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
        public DbSet<Item> Items { get; set; }
        public DbSet<List> Lists { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ItemHistory> ItemHistory { get; set; }

    }
}
