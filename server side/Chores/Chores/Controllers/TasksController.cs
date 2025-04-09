//using Chores.Data;
//using Microsoft.AspNetCore.Mvc;

//// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

//namespace Chores.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class TasksController : ControllerBase
//    {
//        private readonly AppDbContext _context;

//        public TasksController(AppDbContext context)
//        {
//            _context = context;
//        }

//        // GET: api/tasks
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<Task>>> GetTasks()
//        {
//            return await _context.Tasks
//                .Include(t => t.Participants)
//                .ToListAsync();
//        }

//        // GET: api/tasks/{id}
//        [HttpGet("{id}")]
//        public async Task<ActionResult<Task>> GetTask(string id)
//        {
//            var task = await _context.Tasks
//                .Include(t => t.Participants)
//                .FirstOrDefaultAsync(t => t.Id == id);

//            if (task == null)
//                return NotFound();

//            return task;
//        }

//        // POST: api/tasks
//        [HttpPost]
//        public async Task<ActionResult<Task>> PostTask(Task task)
//        {
//            // Attach existing users as participants
//            if (task.Participants != null)
//            {
//                for (int i = 0; i < task.Participants.Count; i++)
//                {
//                    var userId = task.Participants[i].Id;
//                    var user = await _context.Users.FindAsync(userId);
//                    if (user != null)
//                        task.Participants[i] = user;
//                }
//            }

//            _context.Tasks.Add(task);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
//        }

//        // PUT: api/tasks/{id}
//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutTask(string id, Task updatedTask)
//        {
//            if (id != updatedTask.Id)
//                return BadRequest();

//            var existingTask = await _context.Tasks
//                .Include(t => t.Participants)
//                .FirstOrDefaultAsync(t => t.Id == id);

//            if (existingTask == null)
//                return NotFound();

//            // Update fields
//            existingTask.Title = updatedTask.Title;
//            existingTask.Description = updatedTask.Description;
//            existingTask.Category = updatedTask.Category;
//            existingTask.Color = updatedTask.Color;
//            existingTask.StartDate = updatedTask.StartDate;
//            existingTask.EndDate = updatedTask.EndDate;
//            existingTask.StartTime = updatedTask.StartTime;
//            existingTask.EndTime = updatedTask.EndTime;
//            existingTask.MaxParticipants = updatedTask.MaxParticipants;
//            existingTask.HomeId = updatedTask.HomeId;

//            // Update participants
//            existingTask.Participants.Clear();
//            if (updatedTask.Participants != null)
//            {
//                foreach (var user in updatedTask.Participants)
//                {
//                    var existingUser = await _context.Users.FindAsync(user.Id);
//                    if (existingUser != null)
//                        existingTask.Participants.Add(existingUser);
//                }
//            }

//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//        // DELETE: api/tasks/{id}
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteTask(string id)
//        {
//            var task = await _context.Tasks.FindAsync(id);
//            if (task == null)
//                return NotFound();

//            _context.Tasks.Remove(task);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }
//    }
