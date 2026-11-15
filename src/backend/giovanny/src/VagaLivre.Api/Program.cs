using Npgsql;
using VagaLivre.Api.Data;
using VagaLivre.Api.Enums;
using VagaLivre.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Configure ConnectionStrings__DefaultConnection com a conexao da branch de desenvolvimento do Neon.");
}

// EF Core 8 exige o mapeamento de enums PostgreSQL também no NpgsqlDataSource.
var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.MapEnum<UserRole>("UserRole");
dataSourceBuilder.MapEnum<UserStatus>("UserStatus");
dataSourceBuilder.MapEnum<ParkingSpotType>("ParkingSpotType");
var dataSource = dataSourceBuilder.Build();
builder.Services.AddSingleton(dataSource);
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(dataSource));
builder.Services.AddScoped<SpotAuthService>();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { ok = true, service = "dotnet-parking-spots" }));
app.MapControllers();

// Intencional: NUNCA executar migracoes ou criacao de schema automaticamente no Neon.
// O schema existente é administrado pelo Prisma dos outros microsserviços.
app.Run();
