using NpgsqlTypes;

namespace VagaLivre.Api.Enums;

public enum UserRole
{
    [PgName("resident")]
    Resident,
    [PgName("manager")]
    Manager
}
