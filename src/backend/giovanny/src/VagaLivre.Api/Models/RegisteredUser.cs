using VagaLivre.Api.Enums;

namespace VagaLivre.Api.Models;

public class RegisteredUser
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public string? Apartment { get; set; }

    public Guid? CondominiumId { get; set; }
    public Condominium? Condominium { get; set; }

    public ICollection<ParkingSpot> OwnedSpots { get; set; } = new List<ParkingSpot>();
}
