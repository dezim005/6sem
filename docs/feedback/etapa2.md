# 📊 Feedback da Etapa 2: APIs, Web Services e Persistência de Dados Distribuída

- **Última Avaliação**: `2026-10-21`

---

## 🌟 Pontos Fortes da Equipe
- Backend real e funcional: seis serviços (cinco em Node/Express/Prisma e um em ASP.NET Core), API Gateway e persistência em PostgreSQL (Neon), com URLs de produção publicadas no documento.
- Contratos de API (H36a) bem documentados: tabela de verbos e rotas, payloads de sucesso e erro com códigos HTTP e seção de segurança (HMAC, RBAC, CORS, segredos) coerente com o código.
- Testes automatizados em cinco serviços (Vitest/Supertest, Prisma mockado), cerca de 69 cenários com casos de sucesso e erro (400/401/404/409/500).
- Todos os integrantes entregaram código próprio em `src/backend/`, e o DER e o catálogo de microsserviços estão alinhados ao implementado.

## ⚠️ Oportunidades de Melhoria
- O quadro de contribuição não reflete a autoria real: gateway (T2.5) é do Allan e não da Roberta; JWT (T2.4) está no serviço do Pedro e não do Gustavo, cujo username consta errado (`gust_2003`); a coluna "Autoria Git" segue sem marcação.
- A proposta de CI/CD (seção 5.2) cita GitHub Actions, mas não há `.github/workflows`; a API .NET não tem testes, não consta nas URLs publicadas e só entra no gateway com `GIOVANNY_API` configurada.
- Imprecisões em `docs/backend-apis.md`: links para `seed.js` e `add-notifications.sql` inexistentes no caminho indicado e `src/backend/README.md` (evidência de T2.1) muito curto.
- Desequilíbrio na redação: cerca de 55% do documento foi escrito por uma só pessoa, que também redigiu seções de tarefas de colegas. Pedro, Gustavo e Giovanny devem documentar suas partes. Há ruído no histórico (arquivos apagados e recriados, uploads de `.rar`) e trabalho concentrado em 04/10.

---

## 👥 Quadro de Participação da Equipe

| Aluno | Nome | GitHub | Commits | Funcionalidades | % Participação |
| :---: | :--- | :--- | :---: | :--- | :---: |
| Aluno 1 | Allan dos Anjos Viana | `AllanAviana` | `8` | F4, F8, F9 | `95%` |
| Aluno 2 | Andre de Sousa Lopes | `dezim005` | `24` | F7, F9, F10, F11 | `96%` |
| Aluno 3 | Giovanny Lisboa | `glisboapuc` | `1` | F5, F11 | `78%` |
| Aluno 4 | Gustavo Veloso de Castro Monteiro Pinto | `Gust2003` | `7` | F6 | `78%` |
| Aluno 5 | Pedro Henrique Correia Cassimiro | `pedroh-corr` | `9` | F1 | `76%` |
| Aluno 6 | Roberta Alves Lima | `RobertaAlvesLima` | `8` | F2, F3, F10 | `93%` |

**Mapa de funcionalidades do sistema (T = 11)**: F1 Autenticação e sessão; F2 Cadastro e aprovação de usuários; F3 Gestão de condomínios; F4 Consulta e filtro de vagas; F5 CRUD de vagas (.NET); F6 Reservas; F7 Notificações e e-mail; F8 API Gateway; F9 Modelagem e persistência; F10 Contrato de API e segurança; F11 Containerização e proposta de implantação.

---

## 🔍 Avaliação Individual por Atividades Entregues

### 👤 Aluno 1: Allan dos Anjos Viana
- **🧩 Funcionalidades**: F4 Consulta de vagas, F8 Gateway, F9 Modelagem (3 de 11 do sistema)
- **✔️ Entregue**: API de disponibilidade de vagas (T2.1, H36b) (`768bb86`); API Gateway (T2.5, H35b) (`b0cdefa`); Testes automatizados da API (T2.6, H36c) (`0bf9764`); Frontend web adiantado (`1fde0c6`): telas do protótipo em Next.js, fora do escopo da etapa (ponto extra). (`1fde0c6`)
- **❌ Pendente/Incompleto**: O gateway não tem testes nem README próprio, e o `src/backend/README.md` (evidência de T2.1) é curto, sem instruções completas de instalação.
- **Parecer**: Entrega técnica completa e bem distribuída entre 17/09 e 04/10: serviço de vagas, gateway, schema e testes, todos com commits próprios. Atuou na maior parte do sistema, acima da cota esperada. Ajuste o quadro de contribuição para refletir a autoria real do gateway e documente seu uso.

---

### 👤 Aluno 2: Andre de Sousa Lopes
- **🧩 Funcionalidades**: F7 Notificações, F9 Modelagem, F10 Contrato de API, F11 Implantação (4 de 11 do sistema)
- **✔️ Entregue**: API de Notificações (H36b) (`da9d2b0`); Modelagem e persistência (T2.2, H36b) (`da9d2b0`); Testes (H36c) (`c94d3d0`); Documentação da etapa (H36a, H35b, H35c) (`9a255db`)
- **❌ Pendente/Incompleto**: Links quebrados para `seed.js` e `add-notifications.sql` no documento; quadro de contribuição ainda com `gust_2003` e coluna "Autoria Git" sem marcação. A seção 5.2 descreve GitHub Actions sem que haja `.github/workflows` no repositório (apresentar como proposta, não como existente).
- **Parecer**: Maior contribuição da equipe, com conteúdo substancial em código e documentação, distribuído de 24/09 a 04/10. Centralizou a redação de partes que outros integrantes deveriam ter escrito, o que mascara a autoria no quadro. Revise as imprecisões apontadas e deixe cada colega documentar sua parte.

---

### 👤 Aluno 3: Giovanny Lisboa
- **🧩 Funcionalidades**: F5 CRUD de vagas (.NET), F11 Containerização (2 de 11 do sistema)
- **✔️ Entregue**: API de vagas em ASP.NET Core 8 (T2.3, H36b) (`a3cc9e1`); Dockerfile e docker-compose (T2.7, H35c) (`a3cc9e1`)
- **❌ Pendente/Incompleto**: Sem testes (automatizados ou roteiro manual documentado) para a API .NET. Serviço fora da lista de URLs publicadas e só roteado pelo gateway se `GIOVANNY_API` estiver configurada; sem texto próprio no `backend-apis.md` (as seções 5.1/3.x foram escritas por outro integrante).
- **Parecer**: Entregou, em um único commit robusto, uma API completa em outra stack e a conteinerização, o que é conteúdo real e relevante. A entrega ficou isolada: sem testes, sem publicação e sem integração efetiva ao gateway, e a participação se concentrou em um dia. Integre o serviço à arquitetura e documente os testes.

---

### 👤 Aluno 4: Gustavo Veloso de Castro Monteiro Pinto
- **🧩 Funcionalidades**: F6 Reservas (1 de 11 do sistema)
- **✔️ Entregue**: API de Reservas (H36b) (`605afde`); Testes automatizados (H36c) (`98f7fc8`); README do serviço (`b9c264e`)
- **❌ Pendente/Incompleto**: T2.4 (JWT) consta no quadro em seu nome, mas a autenticação foi implementada no serviço do Pedro; seu username no quadro está incorreto (`gust_2003`). Sem texto próprio no `backend-apis.md`; histórico com arquivos apagados e recriados (`ce833c7`, `9289b21`, `4911519`).
- **Parecer**: O serviço de reservas é a regra de negócio central e foi entregue com boa cobertura de testes. A atuação ficou restrita a uma funcionalidade, concentrada em 24/09 e 04/10, sem contribuição à documentação da etapa. Corrija o quadro de contribuição e documente a seção de reservas.

---

### 👤 Aluno 5: Pedro Henrique Correia Cassimiro
- **🧩 Funcionalidades**: F1 Autenticação e sessão (1 de 11 do sistema)
- **✔️ Entregue**: API de Identidade (T2.4, H36b) (`63c1e94`); Testes automatizados (H36c) (`052a586`)
- **❌ Pendente/Incompleto**: Proposta de implantação e CI/CD (T2.8, H36c): marcada como entregue, mas o texto da seção 5.2 foi escrito por outro integrante e não há `.github/workflows` no repositório. A tarefa T2.4 está no quadro em nome do Gustavo; ruído no histórico (upload e remoção de `.rar`, arquivos recriados).
- **Parecer**: Entregou a API de autenticação com testes e documentação do serviço, peça importante para a segurança do sistema. Atuou em uma única funcionalidade e não produziu a proposta de CI/CD que assumiu. Escreva a seção 5.2 por conta própria e mantenha o histórico limpo.

---

### 👤 Aluno 6: Roberta Alves Lima
- **🧩 Funcionalidades**: F2 Usuários, F3 Condomínios, F10 Contrato de API (3 de 11 do sistema)
- **✔️ Entregue**: API de Usuários e Condomínios (H36b) (`a31d3dd`); Testes automatizados (H36c) (`1f16bbe`); Documentação do contrato de API (H36a) (`e29e99f`)
- **❌ Pendente/Incompleto**: Gateway e integração (T2.5, H35b): consta em seu nome, mas não há commit seu no gateway (autoria do Allan). Commits concentrados em um único dia (04/10).
- **Parecer**: Segundo maior volume de conteúdo da equipe: duas funcionalidades de negócio com a suíte de testes mais ampla e contribuição relevante na documentação. A tarefa de gateway não foi sua e o trabalho ficou todo na véspera do prazo. Distribua melhor a entrega ao longo das próximas etapas.

---
