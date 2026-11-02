# 📊 Portal de Acompanhamento e Avaliação: Aluno 5

- **Nome Completo**: Pedro Henrique Correia Cassimiro
- **Usuário do GitHub**: `pedroh-corr`
- **Função Pretendida**: Não informada (campo mantido com o texto de exemplo em `STUDENTS.md`)

---

## 📈 Histórico de Participação por Etapa

| Etapa | % Participação | Commits |
| :---: | :---: | :---: |
| Etapa 2 | `76%` | `9` |
| Etapa 1 | `69%` | `4` |

---

## 🔍 Avaliação por Etapa

### 🏗️ ETAPA 2 - APIs, Web Services e Persistência de Dados Distribuída
*   **Participação**: `76%` — Commits: `9`
*   **Funcionalidades em que atuou** (do total de 11 do sistema):
    - F1 — Autenticação e sessão: login, `/auth/me`, logout, token HMAC com validade de 24 h, bloqueio de contas pendentes/negadas — commits `63c1e94`, `dad49be`, `052a586`
*   **Atividades Entregues**:
    - API de Identidade (T2.4, H36b) — `63c1e94`: `server.js` (144 linhas), `schema.prisma`; token HMAC-SHA256 e validação de sessão.
    - Testes automatizados (H36c) — `052a586`: `tests/auth.spec.js` com 12 cenários, `vitest.config.js` e README do serviço (82 linhas, `dad49be`).
*   **Atividades Pendentes/Incompletas**:
    - Proposta de implantação e CI/CD (T2.8, H36c): marcada como entregue, mas o texto da seção 5.2 foi escrito por outro integrante e não há `.github/workflows` no repositório.
    - A tarefa T2.4 está no quadro em nome do Gustavo; ruído no histórico (upload e remoção de `.rar`, arquivos recriados).
*   **Parecer do Professor**: Entregou a API de autenticação com testes e documentação do serviço, peça importante para a segurança do sistema. Atuou em uma única funcionalidade e não produziu a proposta de CI/CD que assumiu. Escreva a seção 5.2 por conta própria e mantenha o histórico limpo.

### 🏗️ ETAPA 1 - Contexto e Planejamento da Solução Distribuída
*   **Participação**: `69%` — Commits: `4`
*   **Atividades Entregues**:
    - Definição das Tecnologias Distribuídas e Hospedagem (T1.6, H35a): seção 4.2 completa, com escolha e justificativa de backend (NestJS/TypeScript), frontend web (Next.js), frontend mobile (React Native/Expo), banco de dados (PostgreSQL + Redis) e hospedagem em nuvem (Vercel, Render, Neon, Upstash), refinada em 4 commits sucessivos (`cb05b7d`, `7668265`, `881ed3b`, `0a98c90`).
*   **Atividades Pendentes/Incompletas**:
    - Nenhuma pendência na tarefa sob sua responsabilidade (T1.6).
*   **Parecer do Professor**: A seção entregue justifica de forma objetiva cada escolha tecnológica e articula bem a estratégia de hospedagem distribuída com o restante da arquitetura descrita na seção 4.1, atendendo à rubrica H35a. Toda a atividade, porém, foi concentrada em um único dia (29/08) e restrita à tarefa individual, sem contribuição visível em outras partes do documento. Para a próxima etapa, distribua os commits ao longo do período de trabalho e busque colaborar em revisões de outras seções da equipe.

