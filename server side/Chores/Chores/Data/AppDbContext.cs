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
        public DbSet<MediaItem> MediaItems { get; set; }

        public DbSet<Chores.Models.Task> Tasks { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Chores.Models.Task>()
                .HasMany(t => t.Participants)
                .WithMany(u => u.Participants)
                .UsingEntity<Dictionary<string, object>>(
                    "TaskParticipants", // <-- name of your join table
                    j => j.HasOne<User>().WithMany().HasForeignKey("UserId"),
                    j => j.HasOne<Chores.Models.Task>().WithMany().HasForeignKey("TaskId"));


        }
     

    }



}
