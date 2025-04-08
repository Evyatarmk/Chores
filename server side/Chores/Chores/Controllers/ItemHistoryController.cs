using Chores.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Chores.Models;
namespace Chores.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemHistoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ItemHistoryController(AppDbContext context)
        {
            _context = context;
        }

        // 📌 קבלת כל היסטוריית הפריטים לבית ספציפי וקטגוריה מסוימת
        [HttpGet("home/{homeId}/category/{category}")]
        [Authorize]
        public async Task<IActionResult> GetItemHistoryByHomeAndCategory(string homeId, string category)
        {
            var history = await _context.ItemHistory
                .Where(h => h.HomeId == homeId && h.Category == category)
                .ToListAsync();

            // מחזיר רשימה ריקה אם אין תוצאות
            return Ok(history);
        }
    }
}
