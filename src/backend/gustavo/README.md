# VagaLivre - API de Reservas

Web API REST responsável pelo gerenciamento de reservas de vagas de estacionamento, garantindo a disponibilidade e evitando conflitos de horários no condomínio.

## Tecnologias

- Node.js e Express
- Prisma ORM
- PostgreSQL
- Vitest e Supertest

## Executando localmente

Acesse o diretório do backend do Gustavo, instale as dependências e inicie o projeto:

```bash
cd src/backend/gustavo
npm install
npm start
```

A API ficará disponível na porta configurada (padrão `3000`). O cors já está configurado para permitir o consumo pelo frontend.

## Endpoints de Reservas

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Rota de monitoramento (Healthcheck). Retorna `200 OK`. |
| `GET` | `/api/v1/reservations` | Lista as reservas. Aceita filtros via *query params* (`?userId=` ou `?spotId=`). |
| `GET` | `/api/v1/reservations/{id}` | Busca os detalhes de uma reserva específica pelo seu ID. |
| `POST` | `/api/v1/reservations` | Cria uma nova reserva de vaga. |
| `DELETE` | `/api/v1/reservations/{id}` | Cancela uma reserva existente (exige envio do `userId`). |

## Formato de Resposta

A API retorna os dados estruturados em JSON, encapsulados no objeto `data`.

Exemplo de resposta de sucesso ao criar uma reserva (`201 Created`):

```json
{
  "message": "Vaga reservada com sucesso!",
  "data": {
    "id": "res-16789012345-abcde",
    "spotId": "spot-demo",
    "userId": "user-demo",
    "startTime": "2026-10-08T03:00:00.000Z",
    "endTime": "2026-10-10T02:59:59.999Z",
    "vehiclePlate": "XYZ-9A87"
  }
}
```

## Regras de Negócio e Validações

O serviço implementa regras de negócio estritas para garantir a integridade da locação das vagas:

- **Disponibilidade da Vaga:** A reserva só é permitida se o período solicitado estiver contido dentro do horário de disponibilidade (`availability`) definido pelo dono da vaga.
- **Prevenção de Conflitos:** O sistema varre as reservas existentes para a vaga e impede o agendamento se houver qualquer sobreposição de horários (Erro `409 Conflict`).
- **Validação de Datas:** Impede que a data de término (`endTime`) seja anterior à data de início (`startTime`) e barra formatos de data inválidos.
- **Segurança no Cancelamento:** Um morador só pode cancelar (`DELETE`) uma reserva se ele for o titular da mesma. Tentativas de cancelamento por terceiros retornam erro `403 Forbidden`.

## Testando a API

A suíte de testes de integração foi implementada utilizando Vitest e Supertest. O Prisma Client é mockado, garantindo que o banco de dados de produção (Neon) não seja afetado e isolando o ambiente de testes.

Para rodar os testes localmente:

```bash
cd src/backend/gustavo
npm test
```

### Cenários Validados (16 testes com 100% de sucesso)

- **Listagem e Busca:** Retorno correto de todas as reservas e tratamento de erro `404` para buscas de IDs inexistentes.
- **Criação de Reserva:** Rejeição por campos obrigatórios ausentes, datas inválidas, morador ou vaga inexistente, tentativa de reserva fora da janela de disponibilidade da vaga, tentativa de reserva conflitante com outra existente, e criação bem-sucedida.
- **Cancelamento:** Validação da obrigatoriedade do parâmetro `userId`, bloqueio de exclusão de reservas que não pertencem ao usuário, e sucesso no cancelamento pelo próprio locatário.