namespace VagaLivre.Api.Models;

public class LinkDto
{
    public LinkDto(Guid id, string? href, string rel, string method)
    {
        Id = id;
        Href = href ?? string.Empty;
        Rel = rel;
        Method = method;
    }

    public Guid Id { get; set; }
    public string Href { get; set; }
    public string Rel { get; set; }
    public string Method { get; set; }
}
