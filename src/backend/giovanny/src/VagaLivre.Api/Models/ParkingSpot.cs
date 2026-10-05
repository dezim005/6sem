using System.ComponentModel.DataAnnotations;
using VagaLivre.Api.Enums;

namespace VagaLivre.Api.Models;

public class ParkingSpot : LinksHateoas
{
    public Guid Id { get; set; }

    [Required, MaxLength(30)]
    public string Number { get; set; } = string.Empty;

    public ParkingSpotType Type { get; set; }

    [Required, MaxLength(100)]
    public string Location { get; set; } = string.Empty;

    public bool IsAvailable { get; set; } = true;

    [MaxLength(500)]
    public string? Description { get; set; }

    public Guid CondominiumId { get; set; }
    public Condominium? Condominium { get; set; }

    public Guid? OwnerId { get; set; }
    public RegisteredUser? Owner { get; set; }
}
