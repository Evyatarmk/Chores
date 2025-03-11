using famliy_flow.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace famliy_flow.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}
