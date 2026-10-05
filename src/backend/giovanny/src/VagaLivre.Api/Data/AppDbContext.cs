using Microsoft.EntityFrameworkCore;
using VagaLivre.Api.Enums;
using VagaLivre.Api.Models;

namespace VagaLivre.Api.Data;

public class AppDbContext : DbContext
{
    public static readonly Guid DemoCondominiumId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid DemoResidentId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid DemoParkingSpotId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Condominium> Condominiums => Set<Condominium>();
    public DbSet<RegisteredUser> RegisteredUsers => Set<RegisteredUser>();
    public DbSet<ParkingSpot> ParkingSpots => Set<ParkingSpot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Condominium>(entity =>
        {
            entity.ToTable("condominiums");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Address).HasMaxLength(250).IsRequired();
        });

        modelBuilder.Entity<RegisteredUser>(entity =>
        {
            entity.ToTable("registered_users");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(200).IsRequired();
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Role).HasConversion<string>();
            entity.Property(x => x.Status).HasConversion<string>();

            entity.HasOne(x => x.Condominium)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.CondominiumId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ParkingSpot>(entity =>
        {
            entity.ToTable("parking_spots");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Number).HasMaxLength(30).IsRequired();
            entity.Property(x => x.Location).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500);
            entity.Property(x => x.Type).HasConversion<string>();

            // O numero da vaga precisa ser unico somente dentro do mesmo condominio.
            entity.HasIndex(x => new { x.CondominiumId, x.Number }).IsUnique();

            entity.HasOne(x => x.Condominium)
                .WithMany(x => x.ParkingSpots)
                .HasForeignKey(x => x.CondominiumId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Owner)
                .WithMany(x => x.OwnedSpots)
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Condominium>().HasData(new Condominium
        {
            Id = DemoCondominiumId,
            Name = "Condominio Faculdade",
            Address = "Rua Exemplo, 100"
        });

        modelBuilder.Entity<RegisteredUser>().HasData(new RegisteredUser
        {
            Id = DemoResidentId,
            Name = "Morador Teste",
            Email = "morador@vagalivre.local",
            Role = UserRole.Resident,
            Status = UserStatus.Approved,
            Apartment = "101",
            CondominiumId = DemoCondominiumId
        });

        modelBuilder.Entity<ParkingSpot>().HasData(new ParkingSpot
        {
            Id = DemoParkingSpotId,
            Number = "A-01",
            Type = ParkingSpotType.Standard,
            Location = "Subsolo 1",
            IsAvailable = true,
            Description = "Vaga criada automaticamente para demonstracao",
            CondominiumId = DemoCondominiumId,
            OwnerId = DemoResidentId
        });
    }
}
