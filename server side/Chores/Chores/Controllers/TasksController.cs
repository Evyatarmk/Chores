using Chores.Data;
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
                Status = t.Status,
                Participants = t.Participants.Select(p => new ParticipantDto
                {
                    Id = p.Id,           // Access the user through the participant
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

        [HttpGet("home/{homeId}/tasks/month/available")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetAvailableTasksForNextMonth(string homeId)
        {
            var today = DateTime.UtcNow.Date;
            var oneMonthFromNow = today.AddDays(30);

            // בדיקה אם הבית קיים כולל משימות ומשתתפים
            var home = await _context.Homes
                .Include(h => h.Tasks)
                .ThenInclude(t => t.Participants)
                .FirstOrDefaultAsync(h => h.Id == homeId);

            if (home == null)
            {
                return NotFound($"Home with ID '{homeId}' was not found.");
            }

            // סינון משימות בטווח של החודש הקרוב וללא משתתפים כלל
            var tasks = home.Tasks
                .Where(t =>
                    t.StartDate.Date >= today &&
                    t.StartDate.Date <= oneMonthFromNow &&
                    t.Participants.Count == 0)
                .Select(t => new TaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    StartTime = t.StartTime,
                    EndTime = t.EndTime,
                    Category = t.Category,
                    Color = t.Color,
                    MaxParticipants = t.MaxParticipants,
                    Participants = t.Participants.Select(p => new ParticipantDto
                    {
                        Id = p.Id,           // Access the user through the participant
                        Name = p.Name        // Access the user details through the participant
                    }).ToList()
                })
                .ToList();

            return Ok(tasks);
        }


        //Get

        [HttpGet("completedTasksPerMonth/{userId}/{homeId}")]
        public async Task<IActionResult> GetCompletedTasksPerMonth(string userId, string homeId)
        {
            // Get the Home of the user, include Tasks and their Participants, and ensure the user is part of the home
            var userHome = await _context.Homes
                .Include(h => h.Users)              // Include users related to this home
                .Include(h => h.Tasks)              // Include tasks related to this home
                    .ThenInclude(t => t.Participants)   // Include participants (users) for each task
                .FirstOrDefaultAsync(h => h.Id == homeId && h.Users.Any(u => u.Id == userId));

            if (userHome == null)
            {
                return NotFound("User's home not found.");
            }

            // Get the completed tasks directly through Home, filtering by completed tasks
            var completedTasks = userHome.Tasks
                .Where(t => t.Status == true && t.CompletedDate.HasValue)
                .ToList();

            // Group the completed tasks by Year and Month
            var grouped = completedTasks
                .GroupBy(t => new { t.CompletedDate.Value.Year, t.CompletedDate.Value.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    CompletedTasks = g.Count()
                })
                .OrderBy(g => g.Year)
                .ThenBy(g => g.Month)
                .ToList();

            return Ok(grouped);
        }


        // POST: api/tasks
        [HttpPost]
      
        public async Task<IActionResult> PostTask([FromBody] CreateTaskDto taskDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var task = new Models.Task
            {
                Id = Guid.NewGuid().ToString(),
                Title = taskDto.Title,
                Description = taskDto.Description,
                HomeId = taskDto.HomeId,
                Category = taskDto.Category,
                StartDate = taskDto.StartDate,
                EndDate = taskDto.EndDate,
                MaxParticipants = taskDto.MaxParticipants,

                Color = taskDto.Color,
             
                StartTime = TimeSpan.Zero,   // Default start time
                EndTime = TimeSpan.Zero      // Default end time
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(task);
        }


        [HttpPost("{taskId}/participants/{userId}")]
        public async Task<IActionResult> SignUpForTask(string taskId, string userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Participants)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            var user = await _context.Users.FindAsync(userId);

            if (task == null || user == null)
                return NotFound();

            if (!task.Participants.Contains(user))
            {
                task.Participants.Add(user);
                await _context.SaveChangesAsync();
            }

            return Ok("User signed up for task.");
        }




        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(string id, [FromBody] UpdateTaskDto updatedTask)
        {
         

            var existingTask = await _context.Tasks
                .Include(t => t.Participants)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (existingTask == null)
                return NotFound();

            // Update fields
            existingTask.Title = updatedTask.Title;
            existingTask.Description = updatedTask.Description;
            existingTask.Category = updatedTask.Category;
      
            existingTask.StartDate = updatedTask.StartDate;
            existingTask.EndDate = updatedTask.EndDate;
           
           
            existingTask.MaxParticipants = updatedTask.MaxParticipants;
          


            await _context.SaveChangesAsync();

            return NoContent();
        }

        //Put

        [HttpPut("markAsCompleted/{taskId}")]
        public async Task<IActionResult> MarkTaskAsCompleted([FromBody] MarkTaskCompletedDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.TaskId) || string.IsNullOrEmpty(dto.UserId))
            {
                return BadRequest("Task ID and User ID must be provided.");
            }

            var task = await _context.Tasks.FindAsync(dto.TaskId);

            if (task == null)
            {
                return NotFound($"Task with ID {dto.TaskId} not found.");
            }

            task.Status = true;
            task.CompletedDate = DateTime.UtcNow;

            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task marked as completed successfully.", taskId = task.Id });
        }

        // Put - סימון משימה כלא בוצעה
        [HttpPut("markAsNotCompleted/{taskId}")]
        public async Task<IActionResult> MarkTaskAsNotCompleted([FromBody] MarkTaskCompletedDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.TaskId) || string.IsNullOrEmpty(dto.UserId))
            {
                return BadRequest("Task ID and User ID must be provided.");
            }

            var task = await _context.Tasks.FindAsync(dto.TaskId);

            if (task == null)
            {
                return NotFound($"Task with ID {dto.TaskId} not found.");
            }

            task.Status = false;
            task.CompletedDate = null; // אפשר גם למחוק פה תאריך אם תרצה

            _context.Tasks.Update(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task marked as NOT completed successfully.", taskId = task.Id });
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


        [HttpDelete("{taskId}/participants/{userId}")]
        public async Task<IActionResult> SignOutFromTask(string taskId, string userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Participants)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            var user = await _context.Users.FindAsync(userId);

            if (task == null || user == null)
                return NotFound("Task or user not found.");

            if (task.Participants.Contains(user))
            {
                task.Participants.Remove(user);
                await _context.SaveChangesAsync();
                return Ok("User signed out from task.");
            }

            return BadRequest("User was not signed up for the task.");
        }


    }
}
