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
        public async Task<ActionResult<List>> CreateList(string homeId,[FromBody]List newList)
        {
            newList.Id = Guid.NewGuid().ToString();
            newList.HomeId = homeId;
            _context.Lists.Add(newList);
            await _context.SaveChangesAsync();

            return Ok(newList);
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
        // 📌 העתקת כל הפריטים ברשימה
        [HttpPost("home/{homeId}/list/{listId}/copyAllItems")]
        public async Task<IActionResult> CopyAllItems(string homeId, string listId)
        {
            // חיפוש הרשימה על פי homeId ו-listId
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            if (List == null)
                return NotFound("Grocery list not found.");

            // יצירת רשימה חדשה עם פריטים מועתקים
            var newList = new List
            {
                Id = Guid.NewGuid().ToString(), // יצירת ID חדש
                Name = List.Name + "-העתק",
                Category = List.Category,
                Date = List.Date,
                HomeId=List.HomeId,
                Items = List.Items.Select(item => new Item
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = item.Name,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    IsTaken = false // שינוי כל הפריטים ל-isTaken: false
                }).ToList()
            };

            _context.Lists.Add(newList);
            await _context.SaveChangesAsync();

            // מחזירים את הרשימה החדשה עם ה-ID שלה
            return Ok(newList);
        }
        [HttpPost("home/{homeId}/list/{listId}/copyPurchasedItems")]
        public async Task<IActionResult> CopyPurchasedItems(string homeId, string listId)
        {
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            if (List == null)
                return NotFound("Grocery list not found.");

            var newList = new List
            {
                Id = Guid.NewGuid().ToString(),
                Name = List.Name + "-העתק",
                HomeId=List.HomeId,
                Category = List.Category,
                Date = List.Date,
                Items = List.Items.Where(item => item.IsTaken)
                    .Select(item => new Item
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = item.Name,
                        Description = item.Description,
                        Quantity = item.Quantity,
                        IsTaken = false
                    }).ToList()
            };

            _context.Lists.Add(newList);
            await _context.SaveChangesAsync();

            return Ok(newList);
        }
        // 📌 העתקת פריטים שלא נרכשו
        [HttpPost("home/{homeId}/list/{listId}/copyUnpurchasedItems")]
        public async Task<IActionResult> CopyUnpurchasedItems(string homeId, string listId)
        {
            // חיפוש הרשימה על פי homeId ו-listId
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            if (List == null)
                return NotFound("Grocery list not found.");

            // יצירת רשימה חדשה עם פריטים שלא נרכשו
            var newList = new List
            {
                Id = Guid.NewGuid().ToString(),
                Name = List.Name + "-העתק",
                Category = List.Category,
                HomeId = List.HomeId,
                Date = List.Date,
                Items = List.Items.Where(item => !item.IsTaken)
                    .Select(item => new Item
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = item.Name,
                        Description = item.Description,
                        Quantity = item.Quantity,
                        IsTaken = false
                    }).ToList()
            };

            _context.Lists.Add(newList);
            await _context.SaveChangesAsync();

            // מחזירים את הרשימה החדשה עם ה-ID שלה
            return Ok( newList);
        }

        // 📌 שינוי רשימה קיימת
        [HttpPut("home/{homeId}/list/{listId}")]
        public async Task<IActionResult> UpdateList(string homeId, string listId, [FromBody] List updatedList)
        {
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId)
                .FirstOrDefaultAsync(g => g.Id == listId);

            if (List == null)
                return NotFound("Grocery list not found.");

            List.Name = updatedList.Name;
            List.Date = updatedList.Date;
            List.Category = updatedList.Category;
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
        // 📌 עדכון  פריט 
        [HttpPut("home/{homeId}/list/{listId}/item/{itemId}")]
        public async Task<IActionResult> UpdateItem(string homeId, string listId, string itemId, [FromBody]Item updatedItem )
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


            item.Name = updatedItem.Name;
            item.Description = updatedItem.Description; 
            item.Quantity = updatedItem.Quantity;


            // שמירה על השינויים
            await _context.SaveChangesAsync();

            return NoContent();
        }
        // 📌 הסרת סימון כל הפריטים ברשימה
        [HttpPut("home/{homeId}/list/{listId}/uncheckAllItems")]
        public async Task<IActionResult> UncheckAllItems(string homeId, string listId)
        {
            // חיפוש הרשימה על פי homeId ו-listId
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (List == null)
                return NotFound("Grocery list not found.");

            // עדכון מצב כל הפריטים כך ש-isTaken יהיה false
            foreach (var item in List.Items)
            {
                item.IsTaken = false;
            }

            // שמירה על השינויים
            await _context.SaveChangesAsync();

            return NoContent(); // מחזיר 204 אם השינויים התבצעו בהצלחה
        }
        // 📌 הסרת פריטים שנלקחו מהרשימה
        [HttpPut("home/{homeId}/list/{listId}/clearCheckedItems")]
        public async Task<IActionResult> ClearCheckedItems(string homeId, string listId)
        {
            // חיפוש הרשימה על פי homeId ו-listId
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (List == null)
                return NotFound("Grocery list not found.");

            // סינון והסרת הפריטים שנלקחו
            var itemsToRemove = List.Items.Where(i => i.IsTaken).ToList();

            foreach (var item in itemsToRemove)
            {
                List.Items.Remove(item);
            }

            // שמירה על השינויים
            await _context.SaveChangesAsync();

            return NoContent(); // מחזיר 204 אם השינויים התבצעו בהצלחה
        }

        // 📌 עדכון או הוספת פריטים ברשימה
        [HttpPut("home/{homeId}/list/{listId}/items")]
        public async Task<IActionResult> UpdateOrAddItems(string homeId, string listId, [FromBody] List<Item> newItems)
        {
            // חיפוש הרשימה על פי homeId ו-listId
            var List = await _context.Lists
                .Where(g => g.HomeId == homeId && g.Id == listId)
                .Include(g => g.Items)
                .FirstOrDefaultAsync();

            // אם הרשימה לא נמצאה
            if (List == null)
                return NotFound("Grocery list not found.");

            foreach (var newItem in newItems)
            {
                // חיפוש פריט מתוך הרשימה על פי itemId
                var item = List.Items.FirstOrDefault(i => i.Id == newItem.Id);

                if (item != null)
                {
                    // אם הכמות היא 0, נמחק את הפריט
                    if (newItem.Quantity == 0)
                    {
                        List.Items.Remove(item);
                    }
                    else
                    {
                        // אם הפריט קיים, נעדכן אותו
                        item.Name = newItem.Name;
                        item.Description = newItem.Description;
                        item.Quantity = newItem.Quantity;
                    }
                }
                else if (newItem.Quantity > 0)
                {
                    newItem.Id = Guid.NewGuid().ToString();
                    List.Items.Add(newItem);
                }
            }

            // שמירה על השינויים
            await _context.SaveChangesAsync();

            // החזרת הרשימה המעודכנת
            return Ok(new { items = List.Items });
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
        [HttpDelete("home/{homeId}/list/{listId}/item/{itemId}")]
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
