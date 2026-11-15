# Vaga Livre — API .NET alinhada ao banco compartilhado

A API de vagas continua em **ASP.NET Core 8 + Entity Framework Core + HATEOAS**. Ela agora trabalha diretamente com as tabelas já utilizadas pelos serviços Node/Prisma no **PostgreSQL Neon**.

## Mudanças em relação à implementação anterior

- IDs do tipo `string`, como `user-...` e `spot-...`, sem GUID obrigatório.
- Tabelas reais: `vagaLivreRegisteredUsers`, `vagaLivreCondominiums`, `vagaLivreParkingSpots` e `vagaLivreReservations`.
- Tipos nativos PostgreSQL `UserRole`, `UserStatus` e `ParkingSpotType`, incluindo nomes em minúsculas nos valores.
- Condominio da vaga inferido pelo `condominiumId` do **proprietário**, que já consta do schema Prisma.
- Campos compartilhados preservados: `number`, `type`, `location`, `isAvailable`, `ownerId`, `ownerName`, `description`, `availability`, `currentReservationId`.
- **Nenhuma migration ou seed é aplicada ao iniciar**. As migrations antigas foram arquivadas em `legacy-migrations/` e não devem ser executadas no Neon.
- Escritas protegidas pelo token emitido pelo serviço de autenticação Pedro, utilizando o mesmo `JWT_SECRET`. O token do Pedro é um formato HMAC próprio (`body.signature`), não um JWT convencional. Além da assinatura, a API consulta o status atual do usuário no Neon.
- Respostas no padrão `{ data: ... }` usado pelos demais serviços. HATEOAS em `data.links`.

## Endpoints

| Método | Rota | Comportamento |
| --- | --- | --- |
| GET | `/health` | Status da API |
| GET | `/api/ParkingSpots` | Lista vagas com dados compatíveis com a API Node |
| GET | `/api/ParkingSpots/{id}` | Vaga e links HATEOAS |
| POST | `/api/ParkingSpots` | Cria vaga para morador aprovado, com condomínio |
| PUT | `/api/ParkingSpots/{id}` | Atualiza número, tipo, localização, descrição e indicador de disponibilidade |
| PATCH | `/api/ParkingSpots/{id}/availability` | Salva períodos de disponibilidade (JSONB) |
| DELETE | `/api/ParkingSpots/{id}` | Exclui apenas se não houver reservas vinculadas |

Todas as operações de escrita requerem `Authorization: Bearer <token-do-login>`. O Gateway existente encaminha `/api/ParkingSpots` para este serviço quando `GIOVANNY_API` está configurado. A consulta `/api/v1/spots` permanece na API Node (Allan), usando as **mesmas tabelas**.

### Cadastrar vaga

```http
POST /api/ParkingSpots
Content-Type: application/json
Authorization: Bearer <token-do-login>

{
  "number": "A-41",
  "type": "standard",
  "location": "Subsolo 1",
  "description": "Próximo ao elevador",
  "ownerId": "user-001"
}
```

O `ownerId` pode ser omitido para usar o próprio usuário autenticado. O `ownerName` vem do cadastro de usuários, nunca do corpo da requisição. Um síndico pode criar ou editar vagas de moradores **do mesmo condomínio**, desde que sua própria conta esteja associada a esse condomínio. Moradores podem gerenciar apenas as próprias vagas.

### Atualizar a disponibilidade

```http
PATCH /api/ParkingSpots/spot-001/availability
Content-Type: application/json
Authorization: Bearer <token-do-login>

{
  "availability": [{
    "id": "periodo-1",
    "spotId": "spot-001",
    "startTime": "2026-11-05T03:00:00.000Z",
    "endTime": "2026-11-06T02:59:59.999Z",
    "isRecurring": false
  }]
}
```

Os intervalos são gravados em `availability` (JSONB). Reservas já criadas não podem ficar fora de todos os intervalos após uma atualização. **A recorrência é armazenada, mas a lógica atual de reservas Node não expande padrões recorrentes**; essa capacidade permanece pendente no projeto como um todo.

### Unicidade

Não foi criada uma nova coluna `condominiumId` nem índice adicional em `vagaLivreParkingSpots`. A API checa duplicidade por `owner.condominiumId` e usa um *advisory lock* PostgreSQL para serializar suas próprias gravações concorrentes. Como o schema existente não possui uma constraint de unicidade por condomínio, isso **não protege contra outros escritores externos que ignorem o mesmo lock**.

## Executar no Mac (kit local)

Na raiz do projeto, mantenha `.env.local` com:

```dotenv
DATABASE_URL="postgresql://...BRANCH_DEV...-pooler.../neondb?sslmode=require"
DOTNET_DATABASE_URL="postgresql://...BRANCH_DEV.../neondb?sslmode=require"
JWT_SECRET="o mesmo valor usado pelo Pedro, com no mínimo 32 caracteres"
NEON_DEV_BRANCH_CONFIRMED=true
START_DOTNET=true
```

Use a **mesma branch de desenvolvimento** nas duas URLs; `DOTNET_DATABASE_URL` pode ser obtida desmarcando *Connection pooling* no Neon. Não exponha as credenciais e **não teste na branch `production`**.

```bash
node --env-file=.env.local local-dev/install.mjs
node --env-file=.env.local local-dev/start.mjs
```

Frontend: `http://localhost:9002` — Gateway: `http://localhost:3000` — Swagger: `http://localhost:3006/swagger`.

Para compilar apenas a API:

```bash
dotnet build src/backend/giovanny/src/VagaLivre.Api/VagaLivre.Api.csproj
```

**Não execute** `dotnet ef database update`, `dotnet ef migrations add`, `prisma db push` nem `prisma migrate reset` contra o banco compartilhado sem uma decisão explícita do grupo.

### Teste integrado (cria e exclui uma vaga de teste)

Após iniciar todos os serviços e confirmar que está numa branch dev, execute, no terminal:

```bash
ALLOW_SPOT_WRITE_TEST=true TEST_USER_EMAIL='email-do-morador' TEST_USER_PASSWORD='senha' node --env-file=.env.local local-dev/test-spots.mjs
```

O teste realiza login, cria uma vaga via .NET, consulta essa vaga pela API Node, altera a disponibilidade via .NET, lê a alteração pela API Node e remove a vaga de teste ao final. Use credenciais apenas em seu próprio terminal.

## Observações

- O banco não é recriado e nenhum dado de produção é modificado por instalação/build.
- A API rejeita usuários não aprovados, usuários sem condomínio e tentativas de modificar vagas de outro morador (exceto síndico do mesmo condomínio).
- A exclusão é bloqueada quando existem reservas, preservando histórico e integridade referencial.
- O arquivo `docker-compose.yml` inicia **somente a API** e exige conexão externa; não sobe PostgreSQL separado.
