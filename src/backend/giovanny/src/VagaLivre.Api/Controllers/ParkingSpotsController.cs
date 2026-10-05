using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VagaLivre.Api.Data;
using VagaLivre.Api.Models;

namespace VagaLivre.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ParkingSpotsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ParkingSpotsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var model = await _context.ParkingSpots
            .Include(x => x.Condominium)
            .Include(x => x.Owner)
            .OrderBy(x => x.Number)
            .ToListAsync();

        return Ok(model);
    }

    [HttpPost]
    public async Task<ActionResult> Create(ParkingSpot model)
    {
        if (string.IsNullOrWhiteSpace(model.Number) || string.IsNullOrWhiteSpace(model.Location))
        {
            return BadRequest(new { message = "Numero e localizacao da vaga sao obrigatorios." });
        }

        if (!await _context.Condominiums.AnyAsync(x => x.Id == model.CondominiumId))
        {
            return BadRequest(new { message = "Condominio informado nao existe." });
        }

        if (model.OwnerId.HasValue)
        {
            var owner = await _context.RegisteredUsers.FindAsync(model.OwnerId.Value);
            if (owner == null)
                return BadRequest(new { message = "Proprietario informado nao existe." });

            if (owner.CondominiumId != model.CondominiumId)
                return BadRequest(new { message = "O proprietario precisa pertencer ao mesmo condominio da vaga." });
        }

        var duplicate = await _context.ParkingSpots.AnyAsync(x =>
            x.CondominiumId == model.CondominiumId && x.Number == model.Number);

        if (duplicate)
            return Conflict(new { message = "Ja existe uma vaga com esse numero neste condominio." });

        model.Id = model.Id == Guid.Empty ? Guid.NewGuid() : model.Id;
        model.Number = model.Number.Trim();
        model.Location = model.Location.Trim();
        model.Description = model.Description?.Trim();
        model.Condominium = null;
        model.Owner = null;
        model.Links.Clear();

        _context.ParkingSpots.Add(model);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetById", new { id = model.Id }, model);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(Guid id)
    {
        var model = await _context.ParkingSpots
            .Include(x => x.Condominium)
            .Include(x => x.Owner)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (model == null) return NotFound();

        GerarLinks(model);
        return Ok(model);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, ParkingSpot model)
    {
        if (id != model.Id) return BadRequest();

        var modeloDb = await _context.ParkingSpots
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (modeloDb == null) return NotFound();

        if (!await _context.Condominiums.AnyAsync(x => x.Id == model.CondominiumId))
            return BadRequest(new { message = "Condominio informado nao existe." });

        if (model.OwnerId.HasValue)
        {
            var owner = await _context.RegisteredUsers.FindAsync(model.OwnerId.Value);
            if (owner == null)
                return BadRequest(new { message = "Proprietario informado nao existe." });

            if (owner.CondominiumId != model.CondominiumId)
                return BadRequest(new { message = "O proprietario precisa pertencer ao mesmo condominio da vaga." });
        }

        var duplicate = await _context.ParkingSpots.AnyAsync(x =>
            x.Id != id &&
            x.CondominiumId == model.CondominiumId &&
            x.Number == model.Number);

        if (duplicate)
            return Conflict(new { message = "Ja existe uma vaga com esse numero neste condominio." });

        model.Number = model.Number.Trim();
        model.Location = model.Location.Trim();
        model.Description = model.Description?.Trim();
        model.Condominium = null;
        model.Owner = null;
        model.Links.Clear();

        _context.ParkingSpots.Update(model);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var model = await _context.ParkingSpots.FindAsync(id);

        if (model == null) return NotFound();

        _context.ParkingSpots.Remove(model);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private void GerarLinks(ParkingSpot model)
    {
        model.Links.Clear();

        model.Links.Add(new LinkDto(
            model.Id,
            Url.ActionLink(nameof(GetById), values: new { id = model.Id }),
            rel: "self",
            method: "GET"));

        model.Links.Add(new LinkDto(
            model.Id,
            Url.ActionLink(nameof(Update), values: new { id = model.Id }),
            rel: "update",
            method: "PUT"));

        model.Links.Add(new LinkDto(
            model.Id,
            Url.ActionLink(nameof(Delete), values: new { id = model.Id }),
            rel: "delete",
            method: "DELETE"));
    }
}
