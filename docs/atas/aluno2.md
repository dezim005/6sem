# 📊 Portal de Acompanhamento e Avaliação: Aluno 2

- **Nome Completo**: Andre de Sousa Lopes
- **Usuário do GitHub**: `dezim005`
- **Função Pretendida**: Não informada (campo mantido com o texto de exemplo em `STUDENTS.md`)

---

## 📈 Histórico de Participação por Etapa

| Etapa | % Participação | Commits |
| :---: | :---: | :---: |
| Etapa 3 | `88%` | `4` |
| Etapa 2 | `96%` | `24` |
| Etapa 1 | `84%` | `11` |

---

## 🔍 Avaliação por Etapa

### 🏗️ ETAPA 3 - Interface Web Responsiva (Front-end Web)
*   **Participação**: `88%` — Commits: `4`
*   **Requisitos Funcionais desenvolvidos no front-end** (do total de 14 RFs web da etapa):
    - RF-102 — Cadastro/solicitação de acesso: `register/page.tsx` e `user-service.ts` integrados à API — `0eeefbc`
    - RF-103 — Aprovação de moradores: `admin/approvals` e `admin/users` conectados à API — `0eeefbc`
    - RF-104 — Cadastro de condomínio: `condominium-service.ts` e página de cadastro — `0eeefbc`
    - RF-101 (parcial) — ajustes em `auth-context.tsx` — `0eeefbc`
*   **Atividades Entregues**:
    - Integração de usuários e condomínios à API (H35b/H37b) — `0eeefbc`: 10 arquivos, serviços reescritos (`user-service.ts`, `condominium-service.ts`) e telas de admin/perfil.
    - Proposta de conteinerização e deploy/CI-CD (H35c) — `a7672c3`, `c61110f`: pipeline GitHub Actions e variável `VITE_API_GATEWAY_URL` documentados (aceito como documental).
*   **Atividades Pendentes/Incompletas**:
    - T3.6: não há testes (Vitest/Cypress) nem arquivos de teste no repositório, mas a seção 4.1 os declara com status 'Passou'. Documente testes manuais reais ou remova a afirmação.
    - T3.1: o projeto é Next.js, não Vite; a documentação de deploy (Vite, `import.meta.env`) não corresponde ao código.
*   **Parecer do Professor**: Entregou o bloco de usuários, condomínios e aprovação (RF-102, 103, 104) com código autoral e integração real à API. A documentação de testes descreve suítes inexistentes, o que compromete a credibilidade da seção; corrija na próxima rodada.

### 🏗️ ETAPA 2 - APIs, Web Services e Persistência de Dados Distribuída
*   **Participação**: `96%` — Commits: `24`
*   **Funcionalidades em que atuou** (do total de 11 do sistema):
    - F7 — Notificações e e-mail transacional: API completa (controller, rotas, migration, seed, e-mail via Resend) — commits `da9d2b0`, `c94d3d0`
    - F7 — Integração front de notificações: comunicação do front com a API — commit `5fa6d91`
    - F9 — Modelagem e persistência: documentou schema e DER; migration da tabela `notifications` — commits `9a255db`, `da9d2b0`
    - F10 — Contrato de API e segurança: seções 3.x (endpoints, payloads, HMAC/RBAC/CORS) do documento — commits `c72e0e9`, `acfed8b`, `b31711a`, `9a255db`
    - F11 — Containerização e proposta de implantação: seções 5.1 e 5.2 do documento — commits `c72e0e9`, `6aca835`
*   **Atividades Entregues**:
    - API de Notificações (H36b) — `da9d2b0`, `c94d3d0`, `6c87a8d`: `NotificationController.ts` (111 linhas), rotas, Prisma, migration e seed.
    - Modelagem e persistência (T2.2, H36b) — `da9d2b0`, `9a255db`: tabelas, DER em Mermaid e schema da tabela de notificações.
    - Testes (H36c) — `c94d3d0`: testes unitários e de integração das notificações (e-mail e banco mockados), com 7 cenários.
    - Documentação da etapa (H36a, H35b, H35c) — `9a255db`, `c72e0e9`: maior autor do `backend-apis.md` (≈270 linhas): arquitetura, tabela de endpoints, payloads, segurança, testes e implantação, além de textos de tarefas de outros integrantes (5.1, 5.2).
*   **Atividades Pendentes/Incompletas**:
    - Links quebrados para `seed.js` e `add-notifications.sql` no documento; quadro de contribuição ainda com `gust_2003` e coluna "Autoria Git" sem marcação.
    - A seção 5.2 descreve GitHub Actions sem que haja `.github/workflows` no repositório (apresentar como proposta, não como existente).
*   **Parecer do Professor**: Maior contribuição da equipe, com conteúdo substancial em código e documentação, distribuído de 24/09 a 04/10. Centralizou a redação de partes que outros integrantes deveriam ter escrito, o que mascara a autoria no quadro. Revise as imprecisões apontadas e deixe cada colega documentar sua parte.

### 🏗️ ETAPA 1 - Contexto e Planejamento da Solução Distribuída
*   **Participação**: `84%` — Commits: `11`
*   **Atividades Entregues**:
    - Wireframes do Frontend Web e Fluxograma de Navegação (T1.8, H37a): seção 6 com 4 telas descritas, prints reais de um protótipo funcional (Dashboard, Cadastro de Condomínios, Gestão de Vagas, Calendário) e explicação da migração de `localStorage` para consumo assíncrono de API. Commits `fe2353f` e `6f296dd`.
    - Wireframes do Frontend Móvel e Fluxo de Gestos (T1.9, H38a): seção 7 com 4 telas, prints do app e diretrizes de navegação por abas, pull-to-refresh e transições nativas.
    - Contribuições adicionais de organização do repositório: `README.md`, `CITATION.cff`, atualização dos usernames de `STUDENTS.md` e inclusão das referências acadêmicas (seção 8). Commits `9bc9f94`, `1b9d7da`, `056a970`, `16fc221`, `0e1b808`, `08d4a15`.
*   **Atividades Pendentes/Incompletas**:
    - Nenhuma das duas tarefas sob sua responsabilidade ficou pendente.
*   **Parecer do Professor**: Foi o estudante com maior volume e regularidade de commits da equipe, entregando as duas tarefas de planejamento de interface com evidências visuais reais e bem documentadas, além de assumir tarefas de organização geral do repositório. Boa parte dos commits, porém, é de ajuste incremental (README, usernames, status de tarefas); para a próxima etapa, direcione esse mesmo ritmo de participação também para a implementação de código em `src/`.

