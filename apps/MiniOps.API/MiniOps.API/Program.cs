using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using MiniOps.API.Data;
using MiniOps.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("MiniOpsDb");
    opt.UseNpgsql(cs);
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        var key = builder.Configuration["Jwt:Key"];
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("web", p => p
        .SetIsOriginAllowed(origin =>
        {
            return origin is not null &&
                   (origin.StartsWith("http://localhost:5173") ||
                    origin.StartsWith("http://localhost:5174") || // if needed
                    origin.StartsWith("http://localhost") ||      // for nginx/port differences
                    origin.StartsWith("http://127.0.0.1"));
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

app.UseCors("web");

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () => Results.Ok(new { ok = true }));

app.MapPost("/api/auth/login", (LoginRequest req, IConfiguration cfg) =>
{
    if (req.Email != "admin@miniops.local" || req.Password != "123456")
        return Results.Unauthorized();

    var key = cfg["Jwt:Key"];
    var issuer = cfg["Jwt:Issuer"]; 
    var audience = cfg["Jwt:Audience"];

    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, req.Email),
        new Claim(ClaimTypes.Name, req.Email),
        new Claim(ClaimTypes.Role, "Admin")
    };

    var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
    var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(1),
        signingCredentials: creds
    );

    var jwt = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new { accessToken = jwt });
});

app.MapGet("/api/products", async (AppDbContext db) =>
{
    var items = await db.Products
        .OrderByDescending(x => x.CreatedAt)
        .ToListAsync();

    return Results.Ok(items);
}).RequireAuthorization();

app.MapPost("/api/products", async (AppDbContext db, ProductCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name))
        return Results.BadRequest(new { error = "Name is required." });

    var p = new Product
    {
        Name = dto.Name.Trim(),
        Price = dto.Price,
        Stock = dto.Stock
    };

    db.Products.Add(p);
    await db.SaveChangesAsync();

    return Results.Created($"/api/products/{p.Id}", p);
}).RequireAuthorization();

app.MapDelete("/api/products/{id:guid}", async (AppDbContext db, Guid id) =>
{
    var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id);
    if (p is null) return Results.NotFound();

    db.Products.Remove(p);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).RequireAuthorization();

app.Run();

public sealed record ProductCreateDto(string Name, decimal Price, int Stock);
public sealed record LoginRequest(string Email, string Password);
