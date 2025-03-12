using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Chores.Data;
using Chores.Models;

namespace Chores.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroceryListsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroceryListsController(AppDbContext context)
        {
            _context = context;
        }

        // 📌 קבלת כל רשימות הקניות לבית ספציפי עם הפריטים שלהן
        [HttpGet("home/{homeId}")]
        public async Task<ActionResult<IEnumerable<GroceryList>>> GetGroceryListsByHome(string homeId)
        {
            var groceryLists = await _context.GroceryLists
                .Where(g => g.HomeId == homeId)
                .Include(g => g.Items)
                .ToListAsync();

            if (!groceryLists.Any())
                return NotFound("No grocery lists found for this home.");

            return groceryLists;
        }

        // 📌 קבלת רשימה מסוימת לפי ID לבית ספציפי
        [HttpGet("home/{homeId}/{id}")]
        public async Task<ActionResult<GroceryList>> GetGroceryListByHome(string homeId, string id)
        {
            var groceryList = await _context.GroceryLists
                .Where(g => g.HomeId == homeId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (groceryList == null)
                return NotFound("Grocery list not found.");

            return groceryList;
        }

        // 📌 יצירת רשימה חדשה לבית ספציפי
        [HttpPost("home/{homeId}")]
        public async Task<ActionResult<GroceryList>> CreateGroceryList(string homeId,[FromBody] string name)
        {
            var groceryList = new GroceryList();
            groceryList.Id = Guid.NewGuid().ToString();
            groceryList.Name = name;
            groceryList.HomeId = homeId;
            _context.GroceryLists.Add(groceryList);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGroceryListByHome), new { homeId = homeId, id = groceryList.Id }, groceryList);
        }
       
        // 📌 הוספת פריט לרשימה מסוימת בבית ספציפי
        [HttpPost("home/{homeId}/lists/{listId}/items")]
        public async Task<ActionResult<GroceryItem>> AddItemToList(string homeId, string listId, GroceryItem item)
        {
            var groceryList = await _context.GroceryLists
                .Where(g => g.HomeId == homeId)
                .FirstOrDefaultAsync(g => g.Id == listId);

            if (groceryList == null)
                return NotFound("Grocery list not found.");

            item.GroceryListId = listId;
            _context.GroceryItems.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGroceryListByHome), new { homeId = homeId, id = listId }, item);
        }
        // 📌 שינוי שם לרשימה קיימת
        [HttpPut("home/{homeId}/list/{listId}")]
        public async Task<IActionResult> UpdateGroceryList(string homeId, string listId, [FromBody] string name)
        {
            var groceryList = await _context.GroceryLists
                .Where(g => g.HomeId == homeId)
                .FirstOrDefaultAsync(g => g.Id == listId);

            if (groceryList == null)
                return NotFound("Grocery list not found.");

            groceryList.Name = name;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // 📌 עדכון פריט (למשל שינוי סטטוס ל- isTaken) בבית ספציפי
        [HttpPut("home/{homeId}/list/{listId}/item/{itemId}/status/{newStatus}")]
        public async Task<IActionResult> UpdateItemStatus(string homeId, string listId, string itemId, bool newStatus)
        {

            // חיפוש הרשימה על פי homeId ו-listId
            var groceryList = await _context.GroceryLists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (groceryList == null)
                return NotFound("Grocery list not found.");

            // חיפוש פריט מתוך הרשימה על פי itemId
            var item = groceryList.Items.FirstOrDefault(i => i.Id == itemId);

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
        public async Task<IActionResult> UpdateItem(string homeId, string listId, string itemId, GroceryItem updatedItem)
        {
            if (itemId != updatedItem.Id)
                return BadRequest("Item ID mismatch.");

            // חיפוש הרשימה על פי homeId ו-listId
            var groceryList = await _context.GroceryLists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (groceryList == null)
                return NotFound("Grocery list not found.");

            // חיפוש פריט מתוך הרשימה על פי itemId
            var item = groceryList.Items.FirstOrDefault(i => i.Id == itemId);

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
        public async Task<IActionResult> DeleteGroceryList(string homeId, string id)
        {
            var groceryList = await _context.GroceryLists
                .Include(g => g.Items)
                .Where(g => g.HomeId == homeId)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (groceryList == null)
                return NotFound("Grocery list not found.");

            _context.GroceryItems.RemoveRange(groceryList.Items);

            _context.GroceryLists.Remove(groceryList);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 📌 מחיקת פריט מסוים מתוך רשימה בבית ספציפי
        [HttpDelete("home/{homeId}/lists/{listId}/items/{itemId}")]
        public async Task<IActionResult> DeleteItem(string homeId, string listId, string itemId)
        {
            // חיפוש רשימה על פי homeId ו-listId
            var groceryList = await _context.GroceryLists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (groceryList == null)
                return NotFound("Grocery list not found.");

            // חיפוש פריט מתוך הרשימה על פי itemId
            var item = groceryList.Items.FirstOrDefault(i => i.Id == itemId);

            // אם הפריט לא נמצא
            if (item == null)
                return NotFound("Item not found.");

            // מחיקת הפריט
            _context.GroceryItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
