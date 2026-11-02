# 📊 Portal de Acompanhamento e Avaliação: Aluno 4

- **Nome Completo**: Gustavo Veloso de Castro Monteiro Pinto
- **Usuário do GitHub**: `Gust2003`
- **Função Pretendida**: Não informada (campo mantido com o texto de exemplo em `STUDENTS.md`)

---

## 📈 Histórico de Participação por Etapa

| Etapa | % Participação | Commits |
| :---: | :---: | :---: |
| Etapa 2 | `78%` | `7` |
| Etapa 1 | `78%` | `8` |

---

## 🔍 Avaliação por Etapa

### 🏗️ ETAPA 2 - APIs, Web Services e Persistência de Dados Distribuída
*   **Participação**: `78%` — Commits: `7`
*   **Funcionalidades em que atuou** (do total de 11 do sistema):
    - F6 — Reservas: criação com validação de conflito de agenda, consulta e cancelamento pelo dono — commits `605afde`, `98f7fc8`
*   **Atividades Entregues**:
    - API de Reservas (H36b) — `605afde`, `98f7fc8`: `server.js` (231 linhas) com regras de conflito (409) e posse (403), `schema.prisma`, `package.json`.
    - Testes automatizados (H36c) — `98f7fc8`: `tests/reservations.spec.js` com 16 cenários (Vitest, Prisma mockado) e `vitest.config.js`.
    - README do serviço — `b9c264e`: 78 linhas com endpoints e execução.
*   **Atividades Pendentes/Incompletas**:
    - T2.4 (JWT) consta no quadro em seu nome, mas a autenticação foi implementada no serviço do Pedro; seu username no quadro está incorreto (`gust_2003`).
    - Sem texto próprio no `backend-apis.md`; histórico com arquivos apagados e recriados (`ce833c7`, `9289b21`, `4911519`).
*   **Parecer do Professor**: O serviço de reservas é a regra de negócio central e foi entregue com boa cobertura de testes. A atuação ficou restrita a uma funcionalidade, concentrada em 24/09 e 04/10, sem contribuição à documentação da etapa. Corrija o quadro de contribuição e documente a seção de reservas.

### 🏗️ ETAPA 1 - Contexto e Planejamento da Solução Distribuída
*   **Participação**: `78%` — Commits: `8`
*   **Atividades Entregues**:
    - Diagrama de Componentes Físico e Lógico da Solução (T1.5, H35a): imagem do diagrama de arquitetura (`docs/img/diagrama-arquitetura.png`) e, após revisão, a descrição textual completa dos componentes (clientes Web/Mobile, API Gateway e os 6 serviços) e do fluxo de uma operação (Cliente → Gateway → Serviço → Banco de Dados), com exemplo prático de reserva de vaga. O conteúdo textual é coerente com os serviços listados no Catálogo (seção 3). Commit `366c696` (28 linhas adicionadas, 03/09), complementando os commits anteriores de upload de imagem (`8e72d70`, `692ca0c`, `dbe8a7e`, `9394902`, `de358a5`, `6c8ea32`).
*   **Atividades Pendentes/Incompletas**:
    - Nenhuma pendência de conteúdo remanescente nesta tarefa — a lacuna de descrição textual apontada na avaliação anterior foi corrigida.
    - Persiste um padrão de retrabalho no versionamento do mesmo arquivo de imagem (ciclos de adicionar/remover/adicionar `diagrama-arquitetura.png`, repetidos em 30/08 e novamente em 03/09), sinal de falta de organização nos commits.
*   **Parecer do Professor**: Houve evolução real desde a última avaliação: a tarefa T1.5, antes entregue apenas como imagem, agora inclui a explicação textual dos componentes e do fluxo de chamadas, atendendo de forma completa à rubrica H35a. A participação segue concentrada em duas janelas curtas (30/08 e 03/09), com repetição desnecessária de commits sobre o mesmo arquivo; para a próxima etapa, planeje os commits de forma mais organizada e distribua a participação ao longo do período de trabalho.

