# 📊 Feedback da Etapa 1: Contexto e Planejamento da Solução Distribuída

- **Última Avaliação**: `2026-09-07`

---

## 🌟 Pontos Fortes da Equipe
- Documento de contexto (`docs/contexto.md`) completo e coerente: problema bem delimitado (gestão manual e descentralizada de vagas em condomínios, com dado do IBGE), objetivo geral específico e justificativa que conecta problema, objetivos e público-alvo.
- Requisitos Funcionais e Não Funcionais corretamente classificados: os RFs descrevem ações do sistema e os RNFs descrevem qualidades técnicas (desempenho, segurança, auditoria, disponibilidade), sem inversões de categoria, e coerentes com o problema e a arquitetura propostos.
- Especificação de Contratos de API (H36a) com nível técnico acima da média: 13 endpoints documentados com payloads, respostas de sucesso/erro e códigos HTTP, rastreáveis aos requisitos funcionais correspondentes.
- Após a rodada de avaliação anterior, a equipe corrigiu a principal lacuna apontada (diagrama de arquitetura sem descrição textual): a seção 4.1 agora explica os componentes e o fluxo de chamadas, coerente com os 6 serviços do Catálogo (seção 3).

## ⚠️ Oportunidades de Melhoria
- Participação ainda desigual entre os membros: Andre concentra o maior volume de commits e de seções entregues, enquanto Roberta, Pedro e Allan têm participação pontual, restrita a poucos dias e sem envolvimento em outras seções do documento.
- Padrão recorrente de retrabalho no versionamento de imagens (`docs/img/diagrama-arquitetura.png` foi adicionado e removido repetidamente em 30/08 e novamente em 03/09) — sinal de commits pouco planejados.
- Nenhum código-fonte real foi iniciado em `src/` (apenas READMEs de template) — aceitável para a Etapa 1, mas a equipe deve iniciar a implementação já no começo da Etapa 2 para não acumular atraso.
- O campo "Função Principal Pretendida" em `STUDENTS.md` não foi preenchido por nenhum integrante (mantido o texto de exemplo entre colchetes) — recomenda-se definir papéis reais o quanto antes, já que isso orienta a divisão de trabalho nas próximas etapas (backend, web, mobile). A coluna "Autoria Git" do Quadro de Contribuição Real de `docs/contexto.md` também segue sem nenhuma marcação preenchida pela equipe.

---

## 👥 Quadro de Participação da Equipe

| Aluno | Nome | GitHub | Commits | % Participação |
| :---: | :--- | :--- | :---: | :---: |
| Aluno 1 | Allan dos Anjos Viana | `AllanAviana` | `3` | `75%` |
| Aluno 2 | Andre de Sousa Lopes | `dezim005` | `11` | `84%` |
| Aluno 3 | Giovanny Lisboa | `glisboapuc` | `5` | `88%` |
| Aluno 4 | Gustavo Veloso de Castro Monteiro Pinto | `Gust2003` | `8` | `78%` |
| Aluno 5 | Pedro Henrique Correia Cassimiro | `pedroh-corr` | `4` | `69%` |
| Aluno 6 | Roberta Alves Lima | `RobertaAlvesLima` | `3` | `62%` |

---

## 🔍 Avaliação Individual por Atividades Entregues

### 👤 Aluno 1: Allan dos Anjos Viana
- **✔️ Entregue**: Definição do Problema, Objetivos e Justificativa (T1.1, H34a) — commits `74923c0`, `dcf14c8`; Catálogo de Serviços Web e SLAs (T1.4, H34a) — commit `736dc65`.
- **❌ Pendente/Incompleto**: Nenhuma tarefa designada pendente; participação restrita às tarefas individuais.
- **Parecer**: Entregas de boa qualidade, tecnicamente corretas e coerentes com o restante do documento, mas com baixa frequência de commits e nenhuma colaboração fora do escopo próprio.

---

### 👤 Aluno 2: Andre de Sousa Lopes
- **✔️ Entregue**: Wireframes do Frontend Web (T1.8, H37a) — commits `fe2353f`, `6f296dd`; Wireframes do Frontend Móvel (T1.9, H38a); além de README, CITATION.cff, STUDENTS.md e referências acadêmicas — commits `9bc9f94`, `1b9d7da`, `056a970`, `16fc221`, `0e1b808`, `08d4a15`.
- **❌ Pendente/Incompleto**: Nenhuma tarefa designada pendente.
- **Parecer**: Maior volume e regularidade de participação do grupo, com entregas visuais bem documentadas; direcionar esse ritmo também para o código a partir da Etapa 2.

---

### 👤 Aluno 3: Giovanny Lisboa
- **✔️ Entregue**: Requisitos Funcionais e Não Funcionais corretamente classificados e priorizados (T1.3, H34a); Especificação de Contratos de API (T1.7, H36a) — commit `5023c1c` (612 linhas).
- **❌ Pendente/Incompleto**: Nenhuma tarefa designada pendente.
- **Parecer**: Entrega tecnicamente a mais completa e correta da equipe; recomenda-se fracionar o trabalho em commits menores e mais frequentes.

---

### 👤 Aluno 4: Gustavo Veloso de Castro Monteiro Pinto
- **✔️ Entregue**: Diagrama de Componentes (T1.5, H35a) — imagem e, após revisão, descrição textual completa da arquitetura, coerente com o Catálogo de Serviços — commit `366c696`.
- **❌ Pendente/Incompleto**: Nenhuma pendência de conteúdo; falta apenas organizar melhor os commits (evitar ciclos de adicionar/remover o mesmo arquivo de imagem).
- **Parecer**: Evolução real em relação à avaliação anterior — a lacuna de descrição textual do diagrama foi corrigida de forma coerente e completa; falta apenas mais organização no versionamento dos commits.

---

### 👤 Aluno 5: Pedro Henrique Correia Cassimiro
- **✔️ Entregue**: Definição das Tecnologias Distribuídas e Hospedagem (T1.6, H35a) — commits `cb05b7d`, `7668265`, `881ed3b`, `0a98c90`.
- **❌ Pendente/Incompleto**: Nenhuma tarefa designada pendente.
- **Parecer**: Justificativas tecnológicas objetivas e coerentes com a arquitetura da seção 4.1; participação concentrada em um único dia, sem colaboração em outras seções.

---

### 👤 Aluno 6: Roberta Alves Lima
- **✔️ Entregue**: Personas e Mapa de Stakeholders (T1.2, H34a) — commit `9eae85f`.
- **❌ Pendente/Incompleto**: Nenhuma tarefa designada pendente.
- **Parecer**: Boa qualidade narrativa nas personas, coerente com o problema descrito; participação restrita a um único dia e à tarefa individual, sem outras contribuições ao documento.
