// using API.Data;
// using Microsoft.EntityFrameworkCore;

// var builder = WebApplication.CreateBuilder(args);

// // Add services to the container.

// builder.Services.AddControllers();

// builder.Services.AddDbContext<AppDbContext>(options =>
// {
//     options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
// });

// builder.Services.AddCors();

// //TODO: Enable OpenAPI later
// // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// builder.Services.AddOpenApi();
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// var app = builder.Build();

// //TODO: Enable OpenAPI later
// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.MapOpenApi();
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

// //TODO: Not in use
// // app.UseHttpsRedirection();

// //TODO: Enable Authorization later
// // app.UseAuthorization();
// app.UseCors(policy =>
// {
//     policy.AllowAnyHeader();
//     policy.AllowAnyMethod();
//     policy.WithOrigins("http://localhost:4200", "https://localhost:4200");
// });

// app.MapControllers();

// app.Run();

using API.Hubs;
using API.Services;

var builder = WebApplication.CreateBuilder(args);

// If a platform (like Render) provides a PORT env var, bind Kestrel to it.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    // Listen on the platform's assigned port for HTTP
    builder.WebHost.UseUrls($"http://*:{port}");
}
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddSingleton<MatchSimulator>(); // background simulator service

var app = builder.Build();
app.UseCors();
app.MapHub<MatchHub>("/matchHub");

// Auto-start the match simulator on app startup for convenience in dev
try
{
    var sim = app.Services.GetService<MatchSimulator>();
    sim?.Start();
}
catch (Exception ex)
{
    Console.WriteLine($"Failed to auto-start MatchSimulator: {ex.Message}");
}

app.MapGet("/", () => "FootballLive API");
app.MapPost("/simulate/start", (MatchSimulator sim) =>
{
    sim.Start();
    return Results.Ok(new { status = "started" });
});
app.MapPost("/simulate/stop", (MatchSimulator sim) =>
{
    sim.Stop();
    return Results.Ok(new { status = "stopped" });
});
app.MapGet("/simulate/status", (MatchSimulator sim) => Results.Ok(new { running = sim.IsRunning }));

app.Run();

