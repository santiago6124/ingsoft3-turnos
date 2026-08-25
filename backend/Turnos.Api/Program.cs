// Demostración del gate (TP4 §3.4): este using no existe y rompe la compilación.
using NoExiste;
using Microsoft.EntityFrameworkCore;
using Turnos.Api.Data;
using Turnos.Api.Options;
using Turnos.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger (interactive docs at /swagger)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core + PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("AppointmentsDb")
    ?? throw new InvalidOperationException("Missing 'AppointmentsDb' connection string in appsettings.json.");

builder.Services.AddDbContext<AppointmentsDbContext>(options =>
    options.UseNpgsql(connectionString));

// Business hours configuration (see Options/BusinessHoursOptions.cs)
builder.Services.Configure<BusinessHoursOptions>(
    builder.Configuration.GetSection(BusinessHoursOptions.SectionName));

builder.Services.AddSingleton<IScheduleService, ScheduleService>();

// CORS: allow the frontend's origin (Vite on localhost:5173 by default)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger siempre disponible (también en el contenedor): es la forma de mostrar
// la API funcionando en la defensa sin depender de ASPNETCORE_ENVIRONMENT.
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("FrontendPolicy");
app.UseAuthorization();
app.MapControllers();

// Health check: lo usan el docker-compose (TP2), el pipeline (TP4) y el monitoreo (TP9).
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Applies pending migrations at startup. Needed in Docker, where there's no
// interactive terminal to run "dotnet ef database update" by hand. Safe to
// always run: if there are no pending migrations, it does nothing.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppointmentsDbContext>();
    db.Database.Migrate();
}

app.Run();
