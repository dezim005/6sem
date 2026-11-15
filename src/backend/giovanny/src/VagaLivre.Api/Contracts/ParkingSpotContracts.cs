using System.Text.Json;
using VagaLivre.Api.Models;

namespace VagaLivre.Api.Contracts;

public sealed class SaveParkingSpotRequest
{
    public string? Id { get; set; }
    public string? Number { get; set; }
    public string? Type { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public string? OwnerId { get; set; }
    public string? OwnerName { get; set; } // ignorado: nome sempre vem do banco
    public bool? IsAvailable { get; set; }
}

public sealed class UpdateAvailabilityRequest
{
    public List<AvailabilitySlotRequest>? Availability { get; set; }
}

public sealed class AvailabilitySlotRequest
{
    public string? Id { get; set; }
    public string? SpotId { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrencePattern { get; set; }
}

public sealed class ParkingSpotResponse
{
    public string Id { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string? OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? CurrentReservationId { get; set; }
    public string? Description { get; set; }
    public JsonElement Availability { get; set; }
    public List<ReservationResponse> Reservations { get; set; } = new();
    public List<LinkDto> Links { get; set; } = new();
}

public sealed class ReservationResponse
{
    public string Id { get; set; } = string.Empty;
    public string SpotId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? VehiclePlate { get; set; }
}
