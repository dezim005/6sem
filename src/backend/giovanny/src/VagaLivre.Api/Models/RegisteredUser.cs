using VagaLivre.Api.Enums;

namespace VagaLivre.Api.Models;

public class RegisteredUser
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public string? CondominiumId { get; set; }
    public Condominium? Condominium { get; set; }

    public ICollection<ParkingSpot> OwnedSpots { get; set; } = new List<ParkingSpot>();
}
