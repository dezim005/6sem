using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VagaLivre.Api.Data;
using VagaLivre.Api.Enums;
using VagaLivre.Api.Models;

namespace VagaLivre.Api.Services;

// O serviço Pedro emite tokens HMAC-SHA256 no formato body.signature (não JWT RFC 7519).
// A API .NET valida a mesma assinatura e consulta o usuário ATUAL no banco compartilhado.
public sealed class SpotAuthService
{
    private readonly AppDbContext _context;
    private readonly string? _secret;

    public SpotAuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _secret = configuration["JWT_SECRET"];
    }

    public async Task<RegisteredUser?> AuthenticateAsync(string? authorizationHeader)
    {
        var userId = ReadUserId(authorizationHeader, _secret);
        if (string.IsNullOrEmpty(userId)) return null;

        return await _context.RegisteredUsers
            .AsNoTracking()
            .SingleOrDefaultAsync(user => user.Id == userId && user.Status == UserStatus.Approved);
    }

    public static string? ReadUserId(string? authorizationHeader, string? secret)
    {
        if (string.IsNullOrWhiteSpace(secret) ||
            string.IsNullOrWhiteSpace(authorizationHeader) ||
            !authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return null;

        var token = authorizationHeader[7..].Trim();
        var sections = token.Split('.');
        if (sections.Length != 2 || sections[0].Length is < 1 or > 4096 || sections[1].Length == 0)
            return null;

        try
        {
            var expected = HMACSHA256.HashData(
                Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(sections[0]));
            var supplied = DecodeBase64Url(sections[1]);
            if (!CryptographicOperations.FixedTimeEquals(expected, supplied)) return null;

            using var doc = JsonDocument.Parse(DecodeBase64Url(sections[0]));
            var root = doc.RootElement;
            if (!root.TryGetProperty("id", out var id) || id.ValueKind != JsonValueKind.String ||
                !root.TryGetProperty("exp", out var expires) ||
                expires.ValueKind != JsonValueKind.Number || !expires.TryGetInt64(out var exp))
                return null;
            if (exp <= DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()) return null;
            return id.GetString();
        }
        catch (Exception ex) when (ex is FormatException or JsonException or ArgumentException)
        {
            return null;
        }
    }

    private static byte[] DecodeBase64Url(string value)
    {
        var base64 = value.Replace('-', '+').Replace('_', '/');
        base64 = base64.PadRight((base64.Length + 3) / 4 * 4, '=');
        return Convert.FromBase64String(base64);
    }
}
