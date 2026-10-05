# VagaLivre - API de Vagas

Web API REST para gerenciamento de vagas de estacionamento em condomínios.

## Tecnologias

- ASP.NET Core 8
- Entity Framework Core
- PostgreSQL
- Npgsql
- Swagger / OpenAPI
- Docker Compose
- EF Core Migrations

## Executando com Docker

Na raiz do projeto, execute:

```bash
docker compose up --build
```

A API ficará disponível em:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/swagger
```

## Endpoints de vagas

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/ParkingSpots` | Lista todas as vagas |
| GET | `/api/ParkingSpots/{id}` | Busca uma vaga pelo ID |
| POST | `/api/ParkingSpots` | Cadastra uma nova vaga |
| PUT | `/api/ParkingSpots/{id}` | Atualiza uma vaga |
| DELETE | `/api/ParkingSpots/{id}` | Exclui uma vaga |

## Dados iniciais

A migration inicial inclui dados para teste local:

```text
Condomínio: 11111111-1111-1111-1111-111111111111
Morador:    22222222-2222-2222-2222-222222222222
Vaga A-01:  33333333-3333-3333-3333-333333333333
```

## HATEOAS

A consulta de uma vaga por ID também retorna links relacionados ao recurso, permitindo identificar as operações disponíveis.

Exemplo:

```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "number": "A-01",
  "links": [
    {
      "rel": "self",
      "method": "GET"
    },
    {
      "rel": "update",
      "method": "PUT"
    },
    {
      "rel": "delete",
      "method": "DELETE"
    }
  ]
}
```

## Migrations

As migrations ficam em:

```text
src/VagaLivre.Api/Migrations
```

Ao iniciar pelo Docker, a aplicação executa as migrations automaticamente.

Para trabalhar localmente com o SDK .NET instalado:

```bash
dotnet tool install --global dotnet-ef
dotnet ef migrations add NomeDaMigration --project src/VagaLivre.Api
dotnet ef database update --project src/VagaLivre.Api
```

## Resetando o banco

Para remover o volume do PostgreSQL e recriar o banco:

```bash
docker compose down -v
docker compose up --build
```

## Testando a API

O projeto possui exemplos de requisições em:

```text
examples/requests.http
```

As requisições também podem ser executadas pelo Swagger ou por clientes HTTP como Insomnia e Postman.
