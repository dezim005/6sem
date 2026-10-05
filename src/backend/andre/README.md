# VagaLivre - API de Notificações

Web API REST para garantir o registro, a rastreabilidade e a persistência do histórico de avisos enviados aos moradores do condomínio.

## Tecnologias

- Node.js e Express
- Prisma ORM
- PostgreSQL (Neon Serverless)
- Resend API
- Vitest e Supertest

## Executando localmente

Na raiz do diretório do backend, instale as dependências e inicie o projeto:

```bash
npm install
npm run dev
```

A comunicação cross-origin é gerida pelo middleware CORS, e as variáveis de ambiente devem ser configuradas previamente.

## Endpoints de notificações

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/notifications/user/:userId` | Listagem de todas as notificações gravadas de um morador |
| POST | `/notifications` | Cria notificação no banco Neon e dispara e-mail via Resend API |
| PATCH | `/notifications/:id/read` | Atualiza o status da notificação para lida (`read: true`) |
| DELETE | `/notifications/:id` | Remove um registro de notificação do histórico do usuário |

## Formato de Resposta

A consulta e criação de notificações retornam os dados estruturados no formato JSON.

Exemplo de resposta de sucesso (`201 Created` ou `200 OK`):

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "userId": "usr-882319",
  "title": "Reserva Confirmada",
  "message": "Sua reserva para a vaga A-12 foi confirmada com sucesso!",
  "type": "RESERVA_CONFIRMADA",
  "read": false,
  "createdAt": "2026-09-24T22:39:42.102Z",
  "updatedAt": "2026-09-24T22:39:42.102Z"
}
```

## Disparo de E-mails

A arquitetura adota a Resend API para contornar o bloqueio de portas SMTP tradicionais. 
O envio de e-mails transacionais ocorre via chamadas REST/HTTPS na porta 443. O processo é executado em segundo plano através de uma *Promise* assíncrona não-bloqueante, o que permite que a API responda imediatamente ao cliente.

## Banco de Dados

O serviço utiliza o Prisma Client como *singleton* e conecta-se a uma instância PostgreSQL na nuvem através do Neon. 
A plataforma utiliza uma camada de *Connection Pooling Serverless* para gerenciar múltiplas requisições em simultâneo.

## Testando a API

A estratégia de testes automatizados utiliza a técnica de *Mocking* para simular as respostas do banco de dados e as chamadas externas. 

Para rodar a suíte de testes unitários e de integração localmente com Vitest e Supertest, execute:

```bash
npm run test
```
