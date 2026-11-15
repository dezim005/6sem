using VagaLivre.Api.Enums;

namespace VagaLivre.Api.Models;

public class ParkingSpot
{
    public string Id { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public ParkingSpotType Type { get; set; }
    public string Location { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public string? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? CurrentReservationId { get; set; }
    public string? Description { get; set; }

    // O Prisma persiste um array JSON em coluna jsonb.
    public string AvailabilityJson { get; set; } = "[]";
    public RegisteredUser? Owner { get; set; }
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
