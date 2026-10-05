# VagaLivre - API de Disponibilidade de Vagas

Web API REST responsável pela consulta, filtragem e detalhamento da disponibilidade das vagas de estacionamento do condomínio.

## Tecnologias

- Node.js e Express
- Prisma ORM
- PostgreSQL
- Vitest e Supertest

## Executando localmente

Acesse o diretório do backend do Allan, instale as dependências e inicie o servidor:

```bash
cd src/backend/allan
npm install
npm start
```

A API ficará disponível na porta configurada (padrão `3000`), já com o middleware CORS habilitado para integrações com o frontend.

## Endpoints de Vagas

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Rota de monitoramento (Healthcheck). Retorna `200 OK`. |
| `GET` | `/api/v1/spots` | Lista de vagas com suporte a múltiplos filtros via *query params*. |
| `GET` | `/api/v1/spots/{id}` | Busca os detalhes completos de uma vaga específica pelo seu ID. |

## Formato de Resposta

A API de vagas retorna arrays ou objetos isolados encapsulados no campo `data`. Além dos dados da vaga, as respostas incluem o histórico de horários disponíveis e as reservas associadas.

Exemplo de resposta de sucesso na listagem (`200 OK`):

```json
{
  "data": [
    {
      "id": "spot-demo",
      "number": "A-01",
      "type": "standard",
      "location": "Subsolo 1",
      "isAvailable": true,
      "ownerId": "user-demo",
      "ownerName": "Morador Teste",
      "currentReservationId": null,
      "description": "Vaga de teste",
      "availability": [
        {
          "id": "slot-demo",
          "spotId": "spot-demo",
          "startTime": "2026-10-01T03:00:00.000Z",
          "endTime": "2026-10-31T02:59:59.999Z",
          "isRecurring": false
        }
      ],
      "reservations": []
    }
  ]
}
```

## Regras de Negócio e Filtros de Busca

A rota de listagem de vagas (`GET /api/v1/spots`) foi construída para suportar pesquisas detalhadas. Os seguintes filtros (*query params*) estão disponíveis:

- `q=`: Filtra vagas buscando uma correspondência exata ou parcial pelo número da vaga (ex: `A-01`) ou localização (ex: `Subsolo 1`).
- `status=`: Filtra a ocupação. Opções aceitas: `all`, `available` (retorna apenas vagas configuradas pelo dono e não ocupadas no momento) ou `occupied`. 
- `type=`: Filtra pelo tipo do veículo. Opções: `compact`, `standard`, `suv` ou `motorcycle`.
- `date=`: Permite verificar a disponibilidade em uma data específica (formato `YYYY-MM-DD`). Se omitido, a API utiliza o momento atual.
- `ownerId=`: Permite listar exclusivamente as vagas pertencentes a um morador específico (ex: "Minhas Vagas").

Tentativas de busca com status, tipo ou datas inválidas retornam o erro `400 Bad Request`.

## Testando a API

A suíte de testes valida isoladamente a lógica de listagem e os cálculos de disponibilidade. O ORM Prisma é mockado para garantir que as operações não afetem o banco de dados de produção (Neon).

Para rodar os testes localmente:

```bash
cd src/backend/allan
npm test
```

### Cenários Validados (11 testes com 100% de sucesso)

- **Health:** Rota `/health` devolve corretamente `200 OK`.
- **Listagem de vagas:** Testes atestando o retorno correto com listagem completa (`200 OK`), funcionamento do filtro de busca (`q=A-01`), funcionamento do filtro `status=available` (omitindo vagas ocupadas) e `status=occupied` (retornando apenas ocupadas).
- **Validação de filtros:** Rejeição (`400 Bad Request`) em caso de envio de `type` inválido, `status` inválido ou formato de `date` inválido.
- **Detalhe da vaga:** Sucesso na busca por ID existente (`200 OK`), tratamento correto para ID inexistente (`404 Not Found`) e simulação de resiliência caso o banco de dados falhe (`500 Internal Server Error`).
