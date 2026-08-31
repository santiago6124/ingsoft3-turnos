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
//
// Comprueba la dependencia, no sólo que el proceso esté vivo. Un health check que
// contesta "ok" sin verificar nada miente: el contenedor puede estar corriendo y la
// API igual no poder atender un solo pedido porque perdió la base. Devolver 200 en
// ese estado es peor que no tener health check — un orquestador lo lee como "sano" y
// le sigue mandando tráfico.
app.MapGet("/health", async (AppointmentsDbContext db) =>
{
    var baseAlcanzable = await db.Database.CanConnectAsync();

    return baseAlcanzable
        ? Results.Ok(new { status = "ok", database = "ok" })
        : Results.Json(
            new { status = "degraded", database = "unreachable" },
            statusCode: StatusCodes.Status503ServiceUnavailable);
});

// Applies pending migrations at startup. Needed in Docker, where there's no
// interactive terminal to run "dotnet ef database update" by hand. Safe to
// always run: if there are no pending migrations, it does nothing.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppointmentsDbContext>();
    db.Database.Migrate();
}

app.Run();
