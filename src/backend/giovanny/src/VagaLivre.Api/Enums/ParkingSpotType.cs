using NpgsqlTypes;

namespace VagaLivre.Api.Enums;

public enum ParkingSpotType
{
    [PgName("compact")]
    Compact,
    [PgName("standard")]
    Standard,
    [PgName("suv")]
    Suv,
    [PgName("motorcycle")]
    Motorcycle
}
