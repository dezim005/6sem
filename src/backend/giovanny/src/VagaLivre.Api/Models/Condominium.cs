namespace VagaLivre.Api.Models;

// Tabela compartilhada com os serviços Prisma; IDs são strings, não GUIDs.
public class Condominium
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public ICollection<RegisteredUser> Users { get; set; } = new List<RegisteredUser>();
}
