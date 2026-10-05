namespace VagaLivre.Api.Models;

public class Condominium
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public ICollection<RegisteredUser> Users { get; set; } = new List<RegisteredUser>();
    public ICollection<ParkingSpot> ParkingSpots { get; set; } = new List<ParkingSpot>();
}
