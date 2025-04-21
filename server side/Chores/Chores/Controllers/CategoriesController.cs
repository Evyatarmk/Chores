using Chores.Data;
using Chores.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Chores.Controllers
{
    [ApiController]
    [Route("api/home/{homeId}/categories/")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/home/{homeId}/categories
        [HttpGet]
        public async Task<IActionResult> GetCategoriesByHome(string homeId)
        {
            var categories = await _context.Categories
                .Where(c => c.HomeId == homeId)
                .ToListAsync(); 

            return Ok(categories);
        }

        // POST: api/home/{homeId}/categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory(string homeId, [FromBody] Category category)
        {
            category.Id = Guid.NewGuid().ToString();
            category.HomeId = homeId;

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        // PUT: api/home/{homeId}/categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(string homeId, string id, [FromBody] string newName)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.HomeId == homeId);

            if (category == null)
                return NotFound("Category not found");

            var oldName = category.Name;
            category.Name = newName;

            // עדכון כל הרשימות שהיו שייכות לקטגוריה הישנה
            var listsToUpdate = await _context.Lists
                .Where(l => l.Category == oldName && l.HomeId == homeId)
                .ToListAsync();

            foreach (var list in listsToUpdate)
            {
                list.Category = newName;
            }

            await _context.SaveChangesAsync();

            return Ok(category);
        }


        // DELETE: api/homes/{homeId}/categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(string homeId, string id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.HomeId == homeId);

            if (category == null)
                return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
