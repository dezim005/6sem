using System.ComponentModel.DataAnnotations.Schema;

namespace VagaLivre.Api.Models;

public class LinksHateoas
{
    [NotMapped]
    public List<LinkDto> Links { get; set; } = new();
}
