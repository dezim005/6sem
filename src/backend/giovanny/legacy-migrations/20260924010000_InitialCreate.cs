using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VagaLivre.Api.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "condominiums",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                Address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_condominiums", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "registered_users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Role = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false),
                Apartment = table.Column<string>(type: "text", nullable: true),
                CondominiumId = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_registered_users", x => x.Id);
                table.ForeignKey(
                    name: "FK_registered_users_condominiums_CondominiumId",
                    column: x => x.CondominiumId,
                    principalTable: "condominiums",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateTable(
            name: "parking_spots",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                Type = table.Column<string>(type: "text", nullable: false),
                Location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                IsAvailable = table.Column<bool>(type: "boolean", nullable: false),
                Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                CondominiumId = table.Column<Guid>(type: "uuid", nullable: false),
                OwnerId = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_parking_spots", x => x.Id);
                table.ForeignKey(
                    name: "FK_parking_spots_condominiums_CondominiumId",
                    column: x => x.CondominiumId,
                    principalTable: "condominiums",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_parking_spots_registered_users_OwnerId",
                    column: x => x.OwnerId,
                    principalTable: "registered_users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.InsertData(
            table: "condominiums",
            columns: new[] { "Id", "Address", "Name" },
            values: new object[]
            {
                new Guid("11111111-1111-1111-1111-111111111111"),
                "Rua Exemplo, 100",
                "Condominio Faculdade"
            });

        migrationBuilder.InsertData(
            table: "registered_users",
            columns: new[] { "Id", "Apartment", "CondominiumId", "Email", "Name", "Role", "Status" },
            values: new object[]
            {
                new Guid("22222222-2222-2222-2222-222222222222"),
                "101",
                new Guid("11111111-1111-1111-1111-111111111111"),
                "morador@vagalivre.local",
                "Morador Teste",
                "Resident",
                "Approved"
            });

        migrationBuilder.InsertData(
            table: "parking_spots",
            columns: new[] { "Id", "CondominiumId", "Description", "IsAvailable", "Location", "Number", "OwnerId", "Type" },
            values: new object[]
            {
                new Guid("33333333-3333-3333-3333-333333333333"),
                new Guid("11111111-1111-1111-1111-111111111111"),
                "Vaga criada automaticamente para demonstracao",
                true,
                "Subsolo 1",
                "A-01",
                new Guid("22222222-2222-2222-2222-222222222222"),
                "Standard"
            });

        migrationBuilder.CreateIndex(
            name: "IX_parking_spots_CondominiumId_Number",
            table: "parking_spots",
            columns: new[] { "CondominiumId", "Number" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_parking_spots_OwnerId",
            table: "parking_spots",
            column: "OwnerId");

        migrationBuilder.CreateIndex(
            name: "IX_registered_users_CondominiumId",
            table: "registered_users",
            column: "CondominiumId");

        migrationBuilder.CreateIndex(
            name: "IX_registered_users_Email",
            table: "registered_users",
            column: "Email",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "parking_spots");
        migrationBuilder.DropTable(name: "registered_users");
        migrationBuilder.DropTable(name: "condominiums");
    }
}
