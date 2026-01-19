using Microsoft.EntityFrameworkCore;
using MiniOps.API.Models;

namespace MiniOps.API.Data
{
    public sealed class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products => Set<Product>();
    }
}