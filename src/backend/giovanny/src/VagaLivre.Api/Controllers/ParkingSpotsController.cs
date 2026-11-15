using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using VagaLivre.Api.Contracts;
using VagaLivre.Api.Data;
using VagaLivre.Api.Enums;
using VagaLivre.Api.Models;
using VagaLivre.Api.Services;

namespace VagaLivre.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public sealed class ParkingSpotsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly SpotAuthService _auth;
    private readonly ILogger<ParkingSpotsController> _logger;

    public ParkingSpotsController(
        AppDbContext context, SpotAuthService auth, ILogger<ParkingSpotsController> logger)
    {
        _context = context;
        _auth = auth;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var spots = await _context.ParkingSpots
            .AsNoTracking()
            .Include(spot => spot.Reservations)
            .OrderBy(spot => spot.Number)
            .ToListAsync();

        return Ok(new { data = spots.Select(ToResponse).ToList() });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(string id)
    {
        var spot = await LoadSpotAsync(id);
        return spot is null
            ? NotFound(new { message = "Vaga não encontrada." })
            : Ok(new { data = ToResponse(spot) });
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] SaveParkingSpotRequest request)
    {
        var actor = await _auth.AuthenticateAsync(Request.Headers.Authorization.ToString());
        if (actor is null) return Unauthorized(new { message = "Sessão inválida ou expirada." });

        var validation = ValidateSpotFields(request, out var type);
        if (validation is not null) return validation;

        var ownerId = string.IsNullOrWhiteSpace(request.OwnerId) ? actor.Id : request.OwnerId.Trim();
        var (owner, error) = await ResolveOwnerAsync(actor, ownerId);
        if (error is not null) return error;

        var number = request.Number!.Trim();
        await using var transaction = await _context.Database.BeginTransactionAsync();
        await LockSpotNumberAsync(owner!.CondominiumId!, number);

        if (await HasDuplicateAsync(owner.CondominiumId!, number))
            return Conflict(new { message = "Já existe uma vaga com esse número neste condomínio." });

        var spot = new ParkingSpot
        {
            Id = $"spot-{Guid.NewGuid():N}",
            Number = number,
            Type = type,
            Location = request.Location!.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            OwnerId = owner.Id,
            OwnerName = owner.Name, // jamais confiar no ownerName recebido do cliente
            IsAvailable = request.IsAvailable ?? true,
            AvailabilityJson = "[]",
            CurrentReservationId = null
        };

        _context.ParkingSpots.Add(spot);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return CreatedAtAction(nameof(GetById), new { id = spot.Id }, new
        {
            message = "Vaga cadastrada com sucesso.",
            data = ToResponse(spot)
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(string id, [FromBody] SaveParkingSpotRequest request)
    {
        var actor = await _auth.AuthenticateAsync(Request.Headers.Authorization.ToString());
        if (actor is null) return Unauthorized(new { message = "Sessão inválida ou expirada." });

        var spot = await _context.ParkingSpots
            .Include(x => x.Owner)
            .Include(x => x.Reservations)
            .SingleOrDefaultAsync(x => x.Id == id);
        if (spot is null) return NotFound(new { message = "Vaga não encontrada." });
        if (!CanManage(actor, spot)) return StatusCode(403, new { message = "Acesso negado para esta vaga." });
        if (request.Id is not null && request.Id != id)
            return BadRequest(new { message = "O ID informado não corresponde à URL." });
        if (request.OwnerId is not null && request.OwnerId != spot.OwnerId)
            return BadRequest(new { message = "A transferência de propriedade não é suportada nesta operação." });

        var validation = ValidateSpotFields(request, out var type);
        if (validation is not null) return validation;

        var number = request.Number!.Trim();
        var condominiumId = spot.Owner!.CondominiumId!;
        await using var transaction = await _context.Database.BeginTransactionAsync();
        await LockSpotNumberAsync(condominiumId, number);

        if (await HasDuplicateAsync(condominiumId, number, id))
            return Conflict(new { message = "Já existe uma vaga com esse número neste condomínio." });

        if (request.IsAvailable == false && spot.Reservations.Count > 0)
            return Conflict(new { message = "A vaga possui reservas e não pode ser desativada sem tratá-las." });

        spot.Number = number;
        spot.Type = type;
        spot.Location = request.Location!.Trim();
        spot.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        if (request.IsAvailable.HasValue) spot.IsAvailable = request.IsAvailable.Value;
        // Não sobregravar currentReservationId, availability nem o proprietário.
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return Ok(new { message = "Vaga atualizada com sucesso.", data = ToResponse(spot) });
    }

    [HttpPatch("{id}/availability")]
    public async Task<ActionResult> UpdateAvailability(
        string id, [FromBody] UpdateAvailabilityRequest request)
    {
        var actor = await _auth.AuthenticateAsync(Request.Headers.Authorization.ToString());
        if (actor is null) return Unauthorized(new { message = "Sessão inválida ou expirada." });

        var spot = await _context.ParkingSpots
            .Include(x => x.Owner)
            .Include(x => x.Reservations)
            .SingleOrDefaultAsync(x => x.Id == id);
        if (spot is null) return NotFound(new { message = "Vaga não encontrada." });
        if (!CanManage(actor, spot)) return StatusCode(403, new { message = "Acesso negado para esta vaga." });

        if (request.Availability is null)
            return BadRequest(new { message = "Informe o array availability." });
        if (request.Availability.Count > 366)
            return BadRequest(new { message = "Quantidade máxima de intervalos excedida." });

        var normalized = new List<AvailabilitySlotRequest>();
        foreach (var slot in request.Availability)
        {
            if (slot.StartTime == default || slot.EndTime == default ||
                slot.EndTime < slot.StartTime ||
                (!string.IsNullOrWhiteSpace(slot.SpotId) && slot.SpotId != id))
                return BadRequest(new { message = "Intervalo de disponibilidade inválido." });

            if (slot.IsRecurring && slot.RecurrencePattern is not ("daily" or "weekly" or "monthly"))
                return BadRequest(new { message = "Padrão de recorrência inválido." });

            normalized.Add(new AvailabilitySlotRequest
            {
                Id = string.IsNullOrWhiteSpace(slot.Id) ? $"slot-{Guid.NewGuid():N}" : slot.Id,
                SpotId = id,
                StartTime = slot.StartTime.ToUniversalTime(),
                EndTime = slot.EndTime.ToUniversalTime(),
                IsRecurring = slot.IsRecurring,
                RecurrencePattern = slot.IsRecurring ? slot.RecurrencePattern : null
            });
        }

        // Não permitir remoção de uma janela que tenha reservas confirmadas.
        foreach (var reservation in spot.Reservations)
        {
            var covered = normalized.Any(slot =>
                slot.StartTime.UtcDateTime.Date <= reservation.StartTime.Date &&
                slot.EndTime.UtcDateTime.Date >= reservation.EndTime.Date);
            if (!covered)
                return Conflict(new { message = "Há reservas fora dos novos intervalos de disponibilidade." });
        }

        spot.AvailabilityJson = JsonSerializer.Serialize(normalized.Select(slot => new
        {
            id = slot.Id,
            spotId = slot.SpotId,
            startTime = slot.StartTime,
            endTime = slot.EndTime,
            isRecurring = slot.IsRecurring,
            recurrencePattern = slot.RecurrencePattern
        }));
        await _context.SaveChangesAsync();
        return Ok(new { message = "Disponibilidade atualizada com sucesso.", data = ToResponse(spot) });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var actor = await _auth.AuthenticateAsync(Request.Headers.Authorization.ToString());
        if (actor is null) return Unauthorized(new { message = "Sessão inválida ou expirada." });

        var spot = await _context.ParkingSpots
            .Include(x => x.Owner)
            .SingleOrDefaultAsync(x => x.Id == id);
        if (spot is null) return NotFound(new { message = "Vaga não encontrada." });
        if (!CanManage(actor, spot)) return StatusCode(403, new { message = "Acesso negado para esta vaga." });

        if (spot.CurrentReservationId is not null ||
            await _context.Reservations.AnyAsync(x => x.SpotId == id))
            return Conflict(new { message = "Não é possível excluir uma vaga com reservas vinculadas." });

        _context.ParkingSpots.Remove(spot);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException
            { SqlState: PostgresErrorCodes.ForeignKeyViolation })
        {
            return Conflict(new { message = "A vaga possui vínculos e não pode ser excluída." });
        }
        return NoContent();
    }

    private static ActionResult? ValidateSpotFields(SaveParkingSpotRequest request, out ParkingSpotType type)
    {
        type = ParkingSpotType.Standard;
        if (string.IsNullOrWhiteSpace(request.Number) || request.Number.Trim().Length > 30)
            return new BadRequestObjectResult(new { message = "O número é obrigatório e deve ter até 30 caracteres." });
        if (string.IsNullOrWhiteSpace(request.Location) || request.Location.Trim().Length is < 5 or > 100)
            return new BadRequestObjectResult(new { message = "A localização deve ter entre 5 e 100 caracteres." });
        if (request.Description?.Trim().Length > 500)
            return new BadRequestObjectResult(new { message = "A descrição deve ter até 500 caracteres." });
        if (request.Type is null ||
            !new[] { "compact", "standard", "suv", "motorcycle" }.Contains(
                request.Type.Trim(), StringComparer.OrdinalIgnoreCase) ||
            !Enum.TryParse(request.Type, ignoreCase: true, out type))
            return new BadRequestObjectResult(new { message = "Tipo inválido: compact, standard, suv ou motorcycle." });
        return null;
    }

    private async Task<(RegisteredUser? owner, ActionResult? error)> ResolveOwnerAsync(
        RegisteredUser actor, string ownerId)
    {
        if (ownerId != actor.Id && actor.Role != UserRole.Manager)
            return (null, new ObjectResult(new { message = "Não é permitido cadastrar vagas para outro morador." })
            { StatusCode = StatusCodes.Status403Forbidden });

        var owner = await _context.RegisteredUsers.AsNoTracking().SingleOrDefaultAsync(x => x.Id == ownerId);
        if (owner is null || owner.Status != UserStatus.Approved)
            return (null, new BadRequestObjectResult(new { message = "Proprietário inexistente ou não aprovado." }));
        if (string.IsNullOrWhiteSpace(owner.CondominiumId))
            return (null, new BadRequestObjectResult(new { message = "Proprietário sem condomínio associado." }));
        if (actor.Id != owner.Id && actor.CondominiumId != owner.CondominiumId)
            return (null, new ObjectResult(new { message = "O proprietário deve pertencer ao condomínio do síndico." })
            { StatusCode = StatusCodes.Status403Forbidden });
        return (owner, null);
    }

    private static bool CanManage(RegisteredUser actor, ParkingSpot spot)
    {
        if (spot.Owner is null || string.IsNullOrWhiteSpace(spot.Owner.CondominiumId)) return false;
        if (actor.Id == spot.OwnerId) return true;
        return actor.Role == UserRole.Manager && actor.CondominiumId == spot.Owner.CondominiumId;
    }

    private Task<bool> HasDuplicateAsync(string condominiumId, string number, string? exceptId = null)
    {
        var upperNumber = number.ToUpperInvariant();
        return _context.ParkingSpots.AnyAsync(x => x.Id != exceptId &&
            x.Owner != null && x.Owner.CondominiumId == condominiumId &&
            x.Number.ToUpper() == upperNumber);
    }

    private async Task LockSpotNumberAsync(string condominiumId, string number)
    {
        // Evita duplicidade sob requisições concorrentes DA API .NET.
        // O banco atual não possui UNIQUE por condomínio; autores externos devem respeitar o lock.
        var lockKey = $"vagaLivreParkingSpots:{condominiumId}:{number.ToUpperInvariant()}";
        await _context.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock(hashtext({lockKey}))");
    }

    private Task<ParkingSpot?> LoadSpotAsync(string id) => _context.ParkingSpots
        .AsNoTracking()
        .Include(x => x.Reservations)
        .SingleOrDefaultAsync(x => x.Id == id);

    private ParkingSpotResponse ToResponse(ParkingSpot spot)
    {
        JsonElement availability;
        try
        {
            using var document = JsonDocument.Parse(spot.AvailabilityJson);
            availability = document.RootElement.ValueKind == JsonValueKind.Array
                ? document.RootElement.Clone()
                : JsonSerializer.SerializeToElement(Array.Empty<object>());
        }
        catch (JsonException exception)
        {
            _logger.LogWarning(exception, "JSON de disponibilidade inválido na vaga {SpotId}", spot.Id);
            availability = JsonSerializer.SerializeToElement(Array.Empty<object>());
        }

        var response = new ParkingSpotResponse
        {
            Id = spot.Id,
            Number = spot.Number,
            Type = spot.Type.ToString().ToLowerInvariant(),
            Location = spot.Location,
            IsAvailable = spot.IsAvailable,
            OwnerId = spot.OwnerId,
            OwnerName = spot.OwnerName,
            CurrentReservationId = spot.CurrentReservationId,
            Description = spot.Description,
            Availability = availability,
            Reservations = spot.Reservations.Select(r => new ReservationResponse
            {
                Id = r.Id,
                SpotId = r.SpotId,
                UserId = r.UserId,
                StartTime = r.StartTime,
                EndTime = r.EndTime,
                VehiclePlate = r.VehiclePlate
            }).ToList()
        };
        response.Links.Add(new LinkDto(spot.Id,
            Url.ActionLink(nameof(GetById), values: new { id = spot.Id }), "self", "GET"));
        response.Links.Add(new LinkDto(spot.Id,
            Url.ActionLink(nameof(Update), values: new { id = spot.Id }), "update", "PUT"));
        response.Links.Add(new LinkDto(spot.Id,
            Url.ActionLink(nameof(UpdateAvailability), values: new { id = spot.Id }),
            "availability", "PATCH"));
        response.Links.Add(new LinkDto(spot.Id,
            Url.ActionLink(nameof(Delete), values: new { id = spot.Id }), "delete", "DELETE"));
        return response;
    }
}
