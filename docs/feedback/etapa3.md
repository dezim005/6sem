# 📊 Feedback da Etapa 3: Interface Web Responsiva (Front-end Web)

- **Última Avaliação**: `10/11/2026 14:20`

---

## 🌟 Pontos Fortes da Equipe
- Front-end funcional em Next.js com telas para os principais fluxos web (login, cadastro, aprovação, condomínio, vagas, disponibilidade, reservas e histórico).
- Integração real com o API Gateway e os microsserviços (usuários, vagas, reservas), com tratamento de cold start do Render.
- DevOps/implantação documentados com proposta coerente de CI/CD (aceita como documental).

## ⚠️ Oportunidades de Melhoria
- Desequilíbrio: cerca de 90% do código é de um aluno (Allan); Roberta não tem código no front-end e Giovanny tem contribuição mínima.
- Documento diverge do código: cita Vite, Axios, `src/services/api.js`, `/spots`, `/notifications` e componentes `.jsx` que não existem; o quadro declara tarefas entregues por quem não as codificou.
- Testes declarados como "Passou" (Vitest/Cypress) não existem no repositório; entregue roteiro de testes manuais com evidências ou ajuste o texto. Tela de notificações e RF-117 não foram implementados.

---

## 👥 Quadro de Participação da Equipe

| Aluno | Nome | GitHub | Commits | RFs no front-end | % Participação |
| :---: | :--- | :--- | :---: | :--- | :---: |
| Aluno 1 | Allan dos Anjos Viana | `AllanAviana` | 5 | RF-105/106; RF-107/108/109; RF-110; RF-112/115/116; Base visual e layout (`layout.tsx`, `globals.css`, `components/ui`, login e demais telas) | `94%` |
| Aluno 2 | Andre de Sousa Lopes | `dezim005` | 4 | RF-102; RF-103; RF-104; RF-101 (parcial) | `88%` |
| Aluno 3 | Giovanny Lisboa | `glisboapuc` | 2 | RF-105; Ajuste do gateway para produção (Render) | `32%` |
| Aluno 4 | Gustavo Veloso de Castro Monteiro Pinto | `Gust2003` | 1 | RF-110; RF-112; RF-113 | `85%` |
| Aluno 5 | Pedro Henrique Correia Cassimiro | `pedroh-corr` | 4 | RF-101 | `68%` |
| Aluno 6 | Roberta Alves Lima | `RobertaAlvesLima` | 2 | nenhum | `9%` |

---

## 🔍 Avaliação Individual por Atividades Entregues

### 👤 Aluno 1: Allan dos Anjos Viana
- **🧩 RFs desenvolvidos no front-end**: RF-105/106; RF-107/108/109; RF-110; RF-112/115/116; Base visual e layout (`layout.tsx`, `globals.css`, `components/ui`, login e demais telas)
- **✔️ Entregue**: Telas e componentes do front-end web (H37b) — `1fde0c6`, `1fa85ec`, `7a1e98a`: autor de cerca de 90% das linhas de `src/frontend/src`, incluindo layout base, estilos e componentes de vagas.
- **❌ Pendente/Incompleto**: Não consta no quadro de contribuição, embora seja o principal autor do código; T3.1/T3.2/T3.4 estão atribuídas a outros alunos.
- **Parecer**: Autor da quase totalidade do front-end web (telas, layout, estilos e integração de vagas/reservas), com commits distribuídos em 31/10, 01/11 e 03/11. Acima da cota. Corrija o quadro de contribuição da etapa para refletir a autoria real.

---

### 👤 Aluno 2: Andre de Sousa Lopes
- **🧩 RFs desenvolvidos no front-end**: RF-102; RF-103; RF-104; RF-101 (parcial)
- **✔️ Entregue**: Integração de usuários e condomínios à API (H35b/H37b) — `0eeefbc`: 10 arquivos, serviços reescritos (`user-service.ts`, `condominium-service.ts`) e telas de admin/perfil.
- **❌ Pendente/Incompleto**: T3.6: não há testes (Vitest/Cypress) nem arquivos de teste no repositório, mas a seção 4.1 os declara com status 'Passou'. Documente testes manuais reais ou remova a afirmação.
- **Parecer**: Entregou o bloco de usuários, condomínios e aprovação (RF-102, 103, 104) com código autoral e integração real à API. A documentação de testes descreve suítes inexistentes, o que compromete a credibilidade da seção; corrija na próxima rodada.

---

### 👤 Aluno 3: Giovanny Lisboa
- **🧩 RFs desenvolvidos no front-end**: RF-105; Ajuste do gateway para produção (Render)
- **✔️ Entregue**: Integração do cadastro de vagas ao backend .NET (H35b) — `5c2360c`: cerca de 105 linhas no front (service e formulário); a maior parte do commit é backend (controller, EF Core, docker-compose).
- **❌ Pendente/Incompleto**: Sem atividade atribuída no quadro desta etapa e sem contribuição à documentação do front-end.
- **Parecer**: Contribuição de código pontual e correta no cadastro de vagas, mas pequena no front-end e concentrada em um único dia (02/11). Participe das telas e do roteiro de testes na próxima etapa.

---

### 👤 Aluno 4: Gustavo Veloso de Castro Monteiro Pinto
- **🧩 RFs desenvolvidos no front-end**: RF-110; RF-112; RF-113
- **✔️ Entregue**: Integração de reservas (criação, listagem, cancelamento) com a API (H35b/H37b) — `3981c29`: `reservation-service.ts` reescrito (autor de 83 das ~120 linhas finais) e 5 telas ajustadas.
- **❌ Pendente/Incompleto**: Sem atividade no quadro desta etapa e sem teste/documentação do fluxo de reservas.
- **Parecer**: Implementou a camada de serviço de reservas, que sustenta RF-110, 112 e 113, com código autoral substancial. Faltou presença em outros momentos da etapa e documentação/roteiro de teste do fluxo.

---

### 👤 Aluno 5: Pedro Henrique Correia Cassimiro
- **🧩 RFs desenvolvidos no front-end**: RF-101
- **✔️ Entregue**: Contexto de autenticação (H35b/H37b) — `181b950`: +127 linhas, validação de sessão contra a API.
- **❌ Pendente/Incompleto**: T3.2 (estilização global): o código de `globals.css`/Tailwind é de Allan; a seção 1.1 apenas documenta.
- **Parecer**: Entregou o RF-101 com código autoral e escreveu a maior parte do texto do documento, porém parte dele descreve arquivos inexistentes e atribui a si tarefas implementadas por outro aluno. Alinhe o documento ao código real.

---

### 👤 Aluno 6: Roberta Alves Lima
- **🧩 RFs desenvolvidos no front-end**: nenhum
- **✔️ Entregue**: Atualização de status e seções 2.1/2.2 do documento (H37a) — `d516a1d`, `d0910fe`: texto descritivo das telas e do estado de autenticação.
- **❌ Pendente/Incompleto**: T3.3 (telas chave) e T3.5 (estado global/rotas privadas): declaradas como 'Entregue', mas sem nenhum commit de código dela em `src/frontend`; a autoria real é de Allan (telas) e Pedro/Andre (contexto de autenticação).
- **Parecer**: Não há código autoral dela no front-end; T3.3 e T3.5 constam como entregues sem evidência de commit. A participação se limita à edição do documento. É necessário assumir um RF e implementá-lo na próxima etapa.
