using NpgsqlTypes;

namespace VagaLivre.Api.Enums;

public enum UserStatus
{
    [PgName("pending")]
    Pending,
    [PgName("approved")]
    Approved,
    [PgName("denied")]
    Denied
}
