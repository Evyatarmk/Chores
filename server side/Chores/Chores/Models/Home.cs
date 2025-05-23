﻿using System.ComponentModel.DataAnnotations;

namespace Chores.Models
{
    public class Home
    {
        public string Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public List<List> Lists { get; set; } = new List<List>();
        public List<User> Users { get; set; } = new List<User>();
        public List<ItemHistory> ItemHistory { get; set; } = new List<ItemHistory>();
        public List<Category> Categories { get; set; } = new List<Category>();

        public List<Models.Task> Tasks { get; set; } = new List<Models.Task>();
    }
}
