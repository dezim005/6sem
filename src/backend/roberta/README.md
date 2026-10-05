# VagaLivre - API de Usuários e Condomínios

Web API REST para o gerenciamento de moradores, síndicos e condomínios integrados ao ecossistema do Vaga Livre.

## Tecnologias

- Node.js e Express
- Prisma ORM
- PostgreSQL
- Vitest e Supertest

## Executando localmente

Acesse o diretório do backend da Roberta, instale as dependências e inicie o projeto:

```bash
cd src/backend/roberta
npm install
npm start
```

A API ficará disponível na porta padrão configurada nas suas variáveis de ambiente (ou na porta `3000` por padrão). A comunicação cross-origin é liberada automaticamente pelo middleware CORS.

## Endpoints de Condomínios

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/v1/condominiums` | Lista todos os condomínios cadastrados (ordem alfabética) |
| GET | `/api/v1/condominiums/:id` | Busca os dados de um condomínio específico pelo ID |
| POST | `/api/v1/condominiums` | Cadastra um novo condomínio |

## Endpoints de Usuários

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/v1/users` | Lista todos os usuários (suporta filtros `?status=` e `?condominiumId=`) |
| GET | `/api/v1/users/:id` | Busca os dados de um usuário específico pelo ID |
| POST | `/api/v1/users` | Cadastra um novo usuário (O primeiro cadastro vira síndico aprovado) |
| PATCH | `/api/v1/users/:id` | Atualiza os dados ou o status de um usuário |
| DELETE | `/api/v1/users/:id` | Exclui um usuário do sistema |

*Nota: Há também uma rota de monitoramento em `GET /health` que retorna `200 OK` se a API estiver no ar.*

## Formato de Resposta

A API encapsula as respostas de sucesso dentro de um objeto `data`, escondendo dados sensíveis como a senha do usuário (`password`).

Exemplo de resposta de sucesso ao consultar um usuário (`200 OK`):

```json
{
  "data": {
    "id": "user-123456789",
    "name": "Morador Teste",
    "email": "teste@vagalivre.com",
    "role": "resident",
    "status": "approved",
    "registrationDate": "2026-01-01T12:00:00.000Z",
    "avatarUrl": "https://placehold.co/40x40.png?text=M",
    "condominiumId": "condo-987654321"
  }
}
```

## Banco de Dados e Regras de Negócio

O serviço utiliza o **Prisma Client** para modelar e consultar o banco de dados.
Existem regras específicas no cadastro:
- O **primeiro usuário** a se cadastrar no sistema ganha automaticamente a permissão de síndico (`manager`) e status `approved`.
- Os **próximos usuários** são cadastrados como moradores (`resident`), precisam obrigatoriamente informar o `condominiumId` e recebem o status inicial `pending`.

## Testando a API

O projeto possui uma suíte robusta de testes de integração e unidade cobrindo 23 cenários (rotas, validações de campos obrigatórios, regras de síndico/morador e duplicação de e-mail).

A estratégia de testes utiliza a técnica de *Mocking* no Prisma Client, o que garante que o banco de dados Neon real não seja acessado ou modificado durante os testes.

Para executar a suíte de testes (Vitest + Supertest) localmente:

```bash
cd src/backend/roberta
npm test
```

**Dica para Windows:** Se o PowerShell bloquear a execução do script `npm`, rode o seguinte comando antes:
```bash
Set-ExecutionPolicy -Scope Process Bypass
```