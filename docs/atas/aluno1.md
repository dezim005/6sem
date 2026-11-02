# 📊 Portal de Acompanhamento e Avaliação: Aluno 1

- **Nome Completo**: Allan dos Anjos Viana
- **Usuário do GitHub**: `AllanAviana`
- **Função Pretendida**: Não informada (campo mantido com o texto de exemplo em `STUDENTS.md`)

---

## 📈 Histórico de Participação por Etapa

| Etapa | % Participação | Commits |
| :---: | :---: | :---: |
| Etapa 2 | `95%` | `8` |
| Etapa 1 | `75%` | `3` |

---

## 🔍 Avaliação por Etapa

### 🏗️ ETAPA 2 - APIs, Web Services e Persistência de Dados Distribuída
*   **Participação**: `95%` — Commits: `8`
*   **Funcionalidades em que atuou** (do total de 11 do sistema):
    - F4 — Consulta e filtro de vagas: implementou a API de disponibilidade (listagem, filtros, detalhe), com seed — commits `768bb86`, `0bf9764`
    - F8 — API Gateway: escreveu o proxy único de entrada e corrigiu o encaminhamento de caminhos — commits `b0cdefa`, `3a1e915`
    - F9 — Modelagem e persistência: modelou o schema Postgres/Prisma compartilhado — commit `b456109`
*   **Atividades Entregues**:
    - API de disponibilidade de vagas (T2.1, H36b) — `768bb86`: `server.js` (180 linhas), `schema.prisma`, `seed.js`; filtros `q`, `type`, `status`, `date`.
    - API Gateway (T2.5, H35b) — `b0cdefa`, `3a1e915`: roteamento por prefixo com timeout de 60 s e tratamento de 502. O quadro atribui a tarefa à Roberta, mas a autoria Git é do Allan.
    - Testes automatizados da API (T2.6, H36c) — `0bf9764`: `tests/spots.spec.js` com 11 cenários (Vitest/Supertest, Prisma mockado) e README do serviço (`e2ae70d`).
    - Frontend web adiantado (`1fde0c6`): telas do protótipo em Next.js, fora do escopo da etapa (ponto extra).
*   **Atividades Pendentes/Incompletas**:
    - O gateway não tem testes nem README próprio, e o `src/backend/README.md` (evidência de T2.1) é curto, sem instruções completas de instalação.
*   **Parecer do Professor**: Entrega técnica completa e bem distribuída entre 17/09 e 04/10: serviço de vagas, gateway, schema e testes, todos com commits próprios. Atuou na maior parte do sistema, acima da cota esperada. Ajuste o quadro de contribuição para refletir a autoria real do gateway e documente seu uso.

### 🏗️ ETAPA 1 - Contexto e Planejamento da Solução Distribuída
*   **Participação**: `75%` — Commits: `3`
*   **Atividades Entregues**:
    - Definição do Problema, Objetivos e Justificativa (H34a): seção 1.1 de `docs/contexto.md` completa, com problema bem delimitado (gestão manual e descentralizada de vagas em condomínios), dado estatístico de apoio (IBGE), objetivo geral específico e justificativa nas dimensões prática, social, ambiental e de TI, coerente com o problema descrito. Commits `74923c0` e `dcf14c8`.
    - Catálogo de Serviços Web e Acordos de SLA (T1.4, H34a): seção 3 com os 6 serviços de TI, canal de comunicação, SLA e mecanismo de monitoração por serviço. Commit `736dc65`.
*   **Atividades Pendentes/Incompletas**:
    - Nenhuma das duas tarefas sob sua responsabilidade ficou pendente nesta etapa.
*   **Parecer do Professor**: As duas entregas (T1.1 e T1.4) têm conteúdo autoral consistente, tecnicamente correto e coerente com o restante do documento, cumprindo bem a rubrica H34a. A participação, porém, ficou concentrada em poucos commits e em dois dias isolados (27 e 30/08), sem envolvimento visível em outras frentes do documento. Para a próxima etapa, distribua mais o trabalho ao longo do período e participe da revisão de outras seções do grupo.

