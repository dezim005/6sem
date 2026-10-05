# VagaLivre - API de Autenticação

Web API REST responsável pelo gerenciamento de login, controle de acesso e validação de sessões dos usuários no ecossistema Vaga Livre.

## Tecnologias

* Node.js e Express
* Prisma ORM
* PostgreSQL
* Autenticação via Tokens (JWT/Hash)
* Vitest e Supertest

## Executando localmente

Acesse o diretório do backend do Pedro, instale as dependências e inicie o projeto:

```bash
cd src/backend/pedro
npm install
npm start
```

A API ficará disponível na porta configurada nas variáveis de ambiente (padrão `3000`). A comunicação cross-origin é gerenciada automaticamente pelo middleware CORS.

## Endpoints de Autenticação

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Rota de monitoramento. Retorna `200 OK` indicando que o serviço está ativo. |
| `POST` | `/api/v1/auth/login` | Autentica um usuário via email e senha, retornando o token de acesso. |
| `GET` | `/api/v1/auth/me` | Valida o token recebido no header e retorna os dados da sessão atual. |
| `POST` | `/api/v1/auth/logout` | Invalida a sessão/token atual do usuário. |

## Formato de Resposta

A API retorna os dados encapsulados, separando informações da sessão e dados do usuário, sempre omitindo dados sensíveis como senhas no retorno.

Exemplo de resposta de sucesso ao realizar o **Login** (`200 OK`):

```json
{
  "message": "Login realizado com sucesso.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "user": {
      "id": "user-123456789",
      "name": "Morador Teste",
      "email": "teste@vagalivre.com",
      "role": "resident",
      "status": "approved",
      "condominiumId": "condo-987654321"
    }
  }
}
```

## Regras de Negócio e Segurança

O serviço aplica validações rigorosas baseadas no status da conta do usuário no banco de dados:

* **Contas Aprovadas:** Apenas usuários com `status: "approved"` conseguem realizar login e obter um token válido.
* **Contas Pendentes:** Usuários recém-cadastrados (`status: "pending"`) recebem erro `403 Forbidden` com aviso de que aguardam aprovação do síndico.
* **Contas Negadas:** Usuários com acesso revogado (`status: "denied"`) têm o acesso bloqueado imediatamente (Erro `403`).
* **Proteção de Rotas:** O endpoint `/me` exige o envio de um token de autorização válido no cabeçalho da requisição.

## Testando a API

O projeto conta com uma suíte de testes de integração implementada com Vitest e Supertest, cobrindo com sucesso **12 cenários diferentes**. O banco de dados (Neon) é simulado via *Mocking* do Prisma, garantindo isolamento total.

Para executar os testes localmente:

```bash
cd src/backend/pedro
npm test
```

### Cenários Validados (100% de Aprovação)
* **Login:** Validação de campos obrigatórios ausentes, senhas incorretas, e-mails não cadastrados, bloqueio de contas pendentes/negadas e sucesso de login.
* **Sessão:** Acesso a rotas protegidas sem token, com token válido, acesso de usuário não aprovado e fluxos de logout.
* **Resiliência:** Tratamento adequado de erros internos do servidor.

*Nota técnica:* Durante a execução dos testes no terminal, é esperado o log de um erro `db`. Este erro é gerado propositalmente pela suíte de testes para simular uma falha de conexão com o banco de dados e garantir que a API trate a exceção retornando corretamente o HTTP Status `500 Internal Server Error`, sem derrubar a aplicação.