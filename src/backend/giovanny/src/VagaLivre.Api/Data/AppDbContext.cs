using Microsoft.EntityFrameworkCore;
using VagaLivre.Api.Enums;
using VagaLivre.Api.Models;

namespace VagaLivre.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Condominium> Condominiums => Set<Condominium>();
    public DbSet<RegisteredUser> RegisteredUsers => Set<RegisteredUser>();
    public DbSet<ParkingSpot> ParkingSpots => Set<ParkingSpot>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // O PostgreSQL preserva case em nomes entre aspas, criados pelo Prisma.
        modelBuilder.HasPostgresEnum<UserRole>(name: "UserRole");
        modelBuilder.HasPostgresEnum<UserStatus>(name: "UserStatus");
        modelBuilder.HasPostgresEnum<ParkingSpotType>(name: "ParkingSpotType");

        modelBuilder.Entity<Condominium>(entity =>
        {
            entity.ToTable("vagaLivreCondominiums");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            entity.Property(x => x.Name).HasColumnName("name").IsRequired();
            entity.Property(x => x.Address).HasColumnName("address").IsRequired();
        });

        modelBuilder.Entity<RegisteredUser>(entity =>
        {
            entity.ToTable("vagaLivreRegisteredUsers");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            entity.Property(x => x.Name).HasColumnName("name").IsRequired();
            entity.Property(x => x.Email).HasColumnName("email").IsRequired();
            entity.Property(x => x.Role).HasColumnName("role").HasColumnType("\"UserRole\"");
            entity.Property(x => x.Status).HasColumnName("status").HasColumnType("\"UserStatus\"");
            entity.Property(x => x.CondominiumId).HasColumnName("condominiumId");
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasOne(x => x.Condominium)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.CondominiumId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<ParkingSpot>(entity =>
        {
            entity.ToTable("vagaLivreParkingSpots");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            entity.Property(x => x.Number).HasColumnName("number").IsRequired();
            entity.Property(x => x.Type).HasColumnName("type").HasColumnType("\"ParkingSpotType\"");
            entity.Property(x => x.Location).HasColumnName("location").IsRequired();
            entity.Property(x => x.IsAvailable).HasColumnName("isAvailable").HasDefaultValue(true);
            entity.Property(x => x.OwnerId).HasColumnName("ownerId");
            entity.Property(x => x.OwnerName).HasColumnName("ownerName");
            entity.Property(x => x.CurrentReservationId).HasColumnName("currentReservationId");
            entity.Property(x => x.Description).HasColumnName("description");
            entity.Property(x => x.AvailabilityJson)
                .HasColumnName("availability")
                .HasColumnType("jsonb")
                .HasDefaultValueSql("'[]'::jsonb")
                .IsRequired();
            entity.HasIndex(x => x.CurrentReservationId).IsUnique();
            entity.HasOne(x => x.Owner)
                .WithMany(x => x.OwnedSpots)
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasMany(x => x.Reservations)
                .WithOne()
                .HasForeignKey(x => x.SpotId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.ToTable("vagaLivreReservations");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
            entity.Property(x => x.SpotId).HasColumnName("spotId");
            entity.Property(x => x.UserId).HasColumnName("userId");
            entity.Property(x => x.StartTime).HasColumnName("startTime").HasColumnType("timestamp with time zone");
            entity.Property(x => x.EndTime).HasColumnName("endTime").HasColumnType("timestamp with time zone");
            entity.Property(x => x.VehiclePlate).HasColumnName("vehiclePlate");
        });
        // Não executar migrations: apenas mapear o banco administrado pelo Prisma.
    }
}
