namespace VagaLivre.Api.Models;

// Leitura das reservas existentes para preservar integridade dos dados.
// A criação/cancelamento continua sob responsabilidade do serviço Gustavo.
public class Reservation
{
    public string Id { get; set; } = string.Empty;
    public string SpotId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? VehiclePlate { get; set; }
}
