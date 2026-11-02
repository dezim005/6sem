# 📊 Portal de Acompanhamento e Avaliação: Aluno 3

- **Nome Completo**: Giovanny Lisboa
- **Usuário do GitHub**: `glisboapuc`
- **Função Pretendida**: Não informada (campo mantido com o texto de exemplo em `STUDENTS.md`)

---

## 📈 Histórico de Participação por Etapa

| Etapa | % Participação | Commits |
| :---: | :---: | :---: |
| Etapa 2 | `78%` | `1` |
| Etapa 1 | `88%` | `5` |

---

## 🔍 Avaliação por Etapa

### 🏗️ ETAPA 2 - APIs, Web Services e Persistência de Dados Distribuída
*   **Participação**: `78%` — Commits: `1`
*   **Funcionalidades em que atuou** (do total de 11 do sistema):
    - F5 — CRUD de vagas (API .NET HATEOAS): `ParkingSpotsController`, EF Core, migrations, modelos — commit `a3cc9e1`
    - F11 — Containerização: Dockerfile e docker-compose (API + PostgreSQL) — commit `a3cc9e1`
*   **Atividades Entregues**:
    - API de vagas em ASP.NET Core 8 (T2.3, H36b) — `a3cc9e1`: controller CRUD (168 linhas) com HATEOAS, `AppDbContext`, migration inicial, enums e `examples/requests.http`.
    - Dockerfile e docker-compose (T2.7, H35c) — `a3cc9e1`: orquestração API + PostgreSQL com README de execução (117 linhas).
*   **Atividades Pendentes/Incompletas**:
    - Sem testes (automatizados ou roteiro manual documentado) para a API .NET.
    - Serviço fora da lista de URLs publicadas e só roteado pelo gateway se `GIOVANNY_API` estiver configurada; sem texto próprio no `backend-apis.md` (as seções 5.1/3.x foram escritas por outro integrante).
*   **Parecer do Professor**: Entregou, em um único commit robusto, uma API completa em outra stack e a conteinerização, o que é conteúdo real e relevante. A entrega ficou isolada: sem testes, sem publicação e sem integração efetiva ao gateway, e a participação se concentrou em um dia. Integre o serviço à arquitetura e documente os testes.

### 🏗️ ETAPA 1 - Contexto e Planejamento da Solução Distribuída
*   **Participação**: `88%` — Commits: `5`
*   **Atividades Entregues**:
    - Definição de Requisitos Funcionais e Priorização (T1.3, H34a): seção 2.1 com 17 requisitos funcionais e 7 não funcionais, priorizados (Alta/Média/Baixa) e justificados. Classificação de RF/RNF revisada e consistente: os RFs descrevem ações do sistema e os RNFs descrevem qualidades técnicas (desempenho, segurança, auditoria, disponibilidade), sem inversões de categoria, e coerentes com o problema e objetivos descritos na seção 1. Commit `5023c1c` (612 linhas adicionadas).
    - Especificação de Contratos de API (T1.7, H36a): seção 5, com 13 endpoints REST detalhados (método, autenticação, payload, respostas de sucesso e erro, códigos HTTP), rastreáveis aos RFs correspondentes — o entregável mais técnico e extenso do documento.
    - Organização inicial da divisão de tarefas entre os colegas (commit `65a03eb` — "Divisão dos Alunos").
*   **Atividades Pendentes/Incompletas**:
    - Nenhuma das duas tarefas sob sua responsabilidade ficou pendente. Fora do escopo da Etapa 1, houve um ajuste pontual em `docs/backend-apis.md` (commit `1511870`, 02/09) — não computado nesta avaliação por pertencer à Etapa 2.
*   **Parecer do Professor**: Entrega de altíssima qualidade técnica e conceitualmente correta — o material mais próximo de uma especificação real de engenharia entregue nesta etapa, com requisitos bem classificados e contratos de API completos. O ponto de atenção é a concentração de quase todo o trabalho em um único commit muito grande; para a próxima etapa, prefira commits menores e mais frequentes, o que facilita o acompanhamento incremental do progresso.

