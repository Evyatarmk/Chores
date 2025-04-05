using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Chores.Data;
using Chores.Models;
using Microsoft.AspNetCore.Authorization;

namespace Chores.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ListsController(AppDbContext context)
        {
            _context = context;
        }

        // 📌 קבלת כל רשימות הקניות לבית ספציפי עם הפריטים שלהן
        [HttpGet("home/{homeId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<List>>> GetListsByHome(string homeId)
        {
            var lists = await _context.Lists
                .Where(g => g.HomeId == homeId)
                .Include(g => g.Items)
                .ToListAsync();

            if (!lists.Any())
            {
                // אם אין רשימות, מחזירים רשימה ריקה
                return Ok(new List<List>());
            }

            return Ok(lists);
        }


        // 📌 קבלת רשימה מסוימת לפי ID לבית ספציפי
        [HttpGet("home/{homeId}/{id}")]
        public async Task<ActionResult<List>> GetListByHome(string homeId, string id)
        {
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (List == null)
                return NotFound("Grocery list not found.");

            return List;
        }

        // 📌 יצירת רשימה חדשה לבית ספציפי
        [HttpPost("home/{homeId}")]
        public async Task<ActionResult<List>> CreateList(string homeId,[FromBody] string name)
        {
            var List = new List();
            List.Id = Guid.NewGuid().ToString();
            List.Name = name;
            List.HomeId = homeId;
            _context.Lists.Add(List);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetListByHome), new { homeId = homeId, id = List.Id }, List);
        }
       
        // 📌 הוספת פריט לרשימה מסוימת בבית ספציפי
        [HttpPost("home/{homeId}/lists/{listId}/items")]
        public async Task<ActionResult<Item>> AddItemToList(string homeId, string listId, Item item)
        {
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId)
                .FirstOrDefaultAsync(g => g.Id == listId);

            if (List == null)
                return NotFound("Grocery list not found.");

            item.ListId = listId;
            _context.Items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetListByHome), new { homeId = homeId, id = listId }, item);
        }
        // 📌 שינוי שם לרשימה קיימת
        [HttpPut("home/{homeId}/list/{listId}")]
        public async Task<IActionResult> UpdateList(string homeId, string listId, [FromBody] string name)
        {
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId)
                .FirstOrDefaultAsync(g => g.Id == listId);

            if (List == null)
                return NotFound("Grocery list not found.");

            List.Name = name;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // 📌 עדכון סטוטוס פריט 
        [HttpPut("home/{homeId}/list/{listId}/item/{itemId}/status/{newStatus}")]
        public async Task<IActionResult> UpdateItemStatus(string homeId, string listId, string itemId, bool newStatus)
        {

            // חיפוש הרשימה על פי homeId ו-listId
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (List == null)
                return NotFound("Grocery list not found.");

            // חיפוש פריט מתוך הרשימה על פי itemId
            var item = List.Items.FirstOrDefault(i => i.Id == itemId);

            // אם הפריט לא נמצא
            if (item == null)
                return NotFound("Item not found.");

           
            item.IsTaken = newStatus;
           

            // שמירה על השינויים
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 📌 עדכון פריט (למשל שינוי סטטוס ל- isTaken) בבית ספציפי
        [HttpPut("home/{homeId}/lists/{listId}/items/{itemId}")]
        public async Task<IActionResult> UpdateItem(string homeId, string listId, string itemId, Item updatedItem)
        {
            if (itemId != updatedItem.Id)
                return BadRequest("Item ID mismatch.");

            // חיפוש הרשימה על פי homeId ו-listId
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (List == null)
                return NotFound("Grocery list not found.");

            // חיפוש פריט מתוך הרשימה על פי itemId
            var item = List.Items.FirstOrDefault(i => i.Id == itemId);

            // אם הפריט לא נמצא
            if (item == null)
                return NotFound("Item not found.");

            // עדכון הפריט עם הנתונים החדשים
            item.Name = updatedItem.Name;
            item.Quantity = updatedItem.Quantity;
            item.IsTaken = updatedItem.IsTaken;
            item.Description = updatedItem.Description;

            // שמירה על השינויים
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 📌 מחיקת רשימה לבית ספציפי
        [HttpDelete("home/{homeId}/List/{id}")]
        public async Task<IActionResult> DeleteList(string homeId, string id)
        {
            var List = await _context.Lists
                .Include(g => g.Items)
                .Where(g => g.HomeId == homeId)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (List == null)
                return NotFound("Grocery list not found.");

            _context.Items.RemoveRange(List.Items);

            _context.Lists.Remove(List);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 📌 מחיקת פריט מסוים מתוך רשימה בבית ספציפי
        [HttpDelete("home/{homeId}/lists/{listId}/items/{itemId}")]
        public async Task<IActionResult> DeleteItem(string homeId, string listId, string itemId)
        {
            // חיפוש רשימה על פי homeId ו-listId
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (List == null)
                return NotFound("Grocery list not found.");

            // חיפוש פריט מתוך הרשימה על פי itemId
            var item = List.Items.FirstOrDefault(i => i.Id == itemId);

            // אם הפריט לא נמצא
            if (item == null)
                return NotFound("Item not found.");

            // מחיקת הפריט
            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
