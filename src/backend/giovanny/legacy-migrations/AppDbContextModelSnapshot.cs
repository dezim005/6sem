using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using VagaLivre.Api.Data;

#nullable disable

namespace VagaLivre.Api.Migrations;

[DbContext(typeof(AppDbContext))]
partial class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "8.0.11")
            .HasAnnotation("Relational:MaxIdentifierLength", 63);

        NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

        modelBuilder.Entity("VagaLivre.Api.Models.Condominium", b =>
        {
            b.Property<Guid>("Id").HasColumnType("uuid");
            b.Property<string>("Address").IsRequired().HasMaxLength(250).HasColumnType("character varying(250)");
            b.Property<string>("Name").IsRequired().HasMaxLength(150).HasColumnType("character varying(150)");
            b.HasKey("Id");
            b.ToTable("condominiums");
            b.HasData(new
            {
                Id = new Guid("11111111-1111-1111-1111-111111111111"),
                Address = "Rua Exemplo, 100",
                Name = "Condominio Faculdade"
            });
        });

        modelBuilder.Entity("VagaLivre.Api.Models.RegisteredUser", b =>
        {
            b.Property<Guid>("Id").HasColumnType("uuid");
            b.Property<string>("Apartment").HasColumnType("text");
            b.Property<Guid?>("CondominiumId").HasColumnType("uuid");
            b.Property<string>("Email").IsRequired().HasMaxLength(200).HasColumnType("character varying(200)");
            b.Property<string>("Name").IsRequired().HasMaxLength(150).HasColumnType("character varying(150)");
            b.Property<string>("Role").IsRequired().HasColumnType("text");
            b.Property<string>("Status").IsRequired().HasColumnType("text");
            b.HasKey("Id");
            b.HasIndex("CondominiumId");
            b.HasIndex("Email").IsUnique();
            b.ToTable("registered_users");
            b.HasData(new
            {
                Id = new Guid("22222222-2222-2222-2222-222222222222"),
                Apartment = "101",
                CondominiumId = new Guid("11111111-1111-1111-1111-111111111111"),
                Email = "morador@vagalivre.local",
                Name = "Morador Teste",
                Role = "Resident",
                Status = "Approved"
            });
        });

        modelBuilder.Entity("VagaLivre.Api.Models.ParkingSpot", b =>
        {
            b.Property<Guid>("Id").HasColumnType("uuid");
            b.Property<Guid>("CondominiumId").HasColumnType("uuid");
            b.Property<string>("Description").HasMaxLength(500).HasColumnType("character varying(500)");
            b.Property<bool>("IsAvailable").HasColumnType("boolean");
            b.Property<string>("Location").IsRequired().HasMaxLength(100).HasColumnType("character varying(100)");
            b.Property<string>("Number").IsRequired().HasMaxLength(30).HasColumnType("character varying(30)");
            b.Property<Guid?>("OwnerId").HasColumnType("uuid");
            b.Property<string>("Type").IsRequired().HasColumnType("text");
            b.HasKey("Id");
            b.HasIndex("OwnerId");
            b.HasIndex("CondominiumId", "Number").IsUnique();
            b.ToTable("parking_spots");
            b.HasData(new
            {
                Id = new Guid("33333333-3333-3333-3333-333333333333"),
                CondominiumId = new Guid("11111111-1111-1111-1111-111111111111"),
                Description = "Vaga criada automaticamente para demonstracao",
                IsAvailable = true,
                Location = "Subsolo 1",
                Number = "A-01",
                OwnerId = new Guid("22222222-2222-2222-2222-222222222222"),
                Type = "Standard"
            });
        });

        modelBuilder.Entity("VagaLivre.Api.Models.ParkingSpot", b =>
        {
            b.HasOne("VagaLivre.Api.Models.Condominium", "Condominium")
                .WithMany("ParkingSpots")
                .HasForeignKey("CondominiumId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.HasOne("VagaLivre.Api.Models.RegisteredUser", "Owner")
                .WithMany("OwnedSpots")
                .HasForeignKey("OwnerId")
                .OnDelete(DeleteBehavior.SetNull);

            b.Navigation("Condominium");
            b.Navigation("Owner");
        });

        modelBuilder.Entity("VagaLivre.Api.Models.RegisteredUser", b =>
        {
            b.HasOne("VagaLivre.Api.Models.Condominium", "Condominium")
                .WithMany("Users")
                .HasForeignKey("CondominiumId")
                .OnDelete(DeleteBehavior.SetNull);

            b.Navigation("Condominium");
        });

        modelBuilder.Entity("VagaLivre.Api.Models.Condominium", b =>
        {
            b.Navigation("ParkingSpots");
            b.Navigation("Users");
        });

        modelBuilder.Entity("VagaLivre.Api.Models.RegisteredUser", b =>
        {
            b.Navigation("OwnedSpots");
        });
#pragma warning restore 612, 618
    }
}
