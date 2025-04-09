﻿using Chores.Data;
using Chores.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chores.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("home/{homeId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks(string homeId)
        {
            // Check if the home exists and include tasks and participants
            var home = await _context.Homes
                .Include(h => h.Tasks)              // Ensure tasks are loaded alongside the home
                .ThenInclude(t => t.Participants)   // Include participants (users) for each task
                .FirstOrDefaultAsync(h => h.Id == homeId);

            if (home == null)
            {
                return NotFound($"Home with ID '{homeId}' was not found.");
            }

            // Fetch tasks related to this home
            var tasks = home.Tasks; // We already loaded the tasks with the home

            // Convert tasks to DTOs
            var taskDtos = tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                HomeId = t.HomeId,
                Category = t.Category,
                Color = t.Color,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                StartTime = t.StartTime,
                EndTime = t.EndTime,
                MaxParticipants = t.MaxParticipants,
                Participants = t.Participants.Select(p => new ParticipantDto
                {
                    Id = p.PublicId,           // Access the user through the participant
                    Name = p.Name        // Access the user details through the participant
                }).ToList()
            }).ToList();

            return Ok(taskDtos); // Return the list of tasks as a response
        }

        // GET: api/tasks/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Chores.Models.Task>> GetTask(string id)
        {
            var task = await _context.Tasks
                .Include(t => t.Participants)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
                return NotFound();

            return task;
        }

        // POST: api/tasks
        [HttpPost]
        public async Task<ActionResult<Chores.Models.Task>> PostTask(Chores.Models.Task task)
        {
            // Attach existing users as participants
            if (task.Participants != null)
            {
                var attachedUsers = new List<User>();
                foreach (var user in task.Participants)
                {
                    var existingUser = await _context.Users.FindAsync(user.Id);
                    if (existingUser != null)
                        attachedUsers.Add(existingUser);
                }
                task.Participants = attachedUsers;
            }

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(string id, Chores.Models.Task updatedTask)
        {
            if (id != updatedTask.Id)
                return BadRequest();

            var existingTask = await _context.Tasks
                .Include(t => t.Participants)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (existingTask == null)
                return NotFound();

            // Update fields
            existingTask.Title = updatedTask.Title;
            existingTask.Description = updatedTask.Description;
            existingTask.Category = updatedTask.Category;
            existingTask.Color = updatedTask.Color;
            existingTask.StartDate = updatedTask.StartDate;
            existingTask.EndDate = updatedTask.EndDate;
            existingTask.StartTime = updatedTask.StartTime;
            existingTask.EndTime = updatedTask.EndTime;
            existingTask.MaxParticipants = updatedTask.MaxParticipants;
            existingTask.HomeId = updatedTask.HomeId;

            // Update participants
            existingTask.Participants.Clear();
            if (updatedTask.Participants != null)
            {
                foreach (var user in updatedTask.Participants)
                {
                    var existingUser = await _context.Users.FindAsync(user.Id);
                    if (existingUser != null)
                        existingTask.Participants.Add(existingUser);
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(string id)
        {
            var task = await _context.Tasks
                .Include(t => t.Participants)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
                return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
