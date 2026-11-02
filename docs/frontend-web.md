# 💻 Etapa 3: Interface Web Responsiva (Front-end Web)

Este documento serve como diretriz mestre de interface e repositório de evidências para a **Etapa 3: Desenvolvimento do Front-end Web**. Ele foi estruturado para orientar o desenvolvimento prático do cliente web e permitir o acompanhamento e a auto-gestão das atividades pelos alunos.

---

## 🎯 Rubricas de Avaliação desta Etapa

Ao final desta Etapa, cada aluno será avaliado individualmente nestas 6 competências (incluindo oportunidades de desenvolvimento e reavaliação):

1. **H34a-SI-G: Gerenciar e documentar serviços de TI**: Gerenciar e documentar serviços de TI, de forma clara e objetiva (Reavaliação teórica e prática a partir do gerenciamento de serviços no frontend web em [src/frontend/](src/frontend/)).
2. **H35b-SI-G: Planejar, desenvolver e gerenciar uma arquitetura de aplicação distribuída**: Desenvolver uma arquitetura de aplicação distribuída (Integração dinâmica do cliente web com as APIs do backend distribuído desenvolvidas na Etapa 2, medido no código em [src/frontend/](src/frontend/) e na seção [Fluxo de Dados e Integração com Backend](#3-fluxo-de-dados-e-integracao-com-backend)).
3. **H35c-SI-G: Planejar, desenvolver e gerenciar uma arquitetura de aplicação distribuída**: Gerenciar uma arquitetura de aplicação distribuída, testando, implantando e avaliando a solução (Processo de empacotamento, otimização de build estático e elaboração da proposta de deploy automatizado do front-end Web, medido na seção [Instruções de Implantação e DevOps Web](#5-instrucoes-de-implantacao-e-devops-web)).
4. **H37a-SI-G: Planejar, desenvolver e gerenciar uma aplicação Web**: Planejar e documentar uma aplicação Web, de forma clara e objetiva (Reavaliação/ajustes de planejamento, diagramação e design, medido em [docs/frontend-web.md](docs/frontend-web.md)).
5. **H37b-SI-G: Planejar, desenvolver e gerenciar uma aplicação Web**: Desenvolver uma aplicação Web (Construção de telas e componentes funcionais baseados no layout responsivo planejado, consumo de dados assíncronos e controle de estados locais, medido em [src/frontend/](src/frontend/) e na seção [Desenvolvimento de Páginas e Componentes](#2-desenvolvimento-de-paginas-e-componentes)).
6. **H37c-SI-G: Planejar, desenvolver e gerenciar uma aplicação Web**: Gerenciar uma aplicação Web, testando, implantando e avaliando a solução (Escrita de suítes de testes automatizados unitários de componentes ou de interface de ponta a ponta, e auditoria de qualidade/performance no ecossistema web, medido na seção [Estratégia e Relatório de Testes Web](#4-estrategia-e-relatorio-de-testes-web)).

---

## 📅 QUADRO DE CONTRIBUIÇÃO REAL (ETAPA 3)

**Atenção alunos:** Preencham esta tabela para atualizar o andamento das tarefas e quem foi o responsável técnico pela construção do Front-end Web. Os nomes, usuários e links de evidências devem corresponder aos entregáveis em [src/frontend/](src/frontend/).

- **Status admitidos**: `⌛ Não Iniciado` | `📝 Em Progresso` | `✔️ Entregue`
- **Autoria Git**: Indica se há commits desse estudante nos arquivos da tarefa.

**Atividades Semanais desta Etapa** (ver [Cronograma do Semestre](contexto.md#-cronograma-do-semestre-semana--periodo)):
- `ATV3.1` — Desenvolvimento de Funcionalidades - Web (Semanas 10 a 12)
- `ATV3.2` — Testes - Front-End Web (Semana 13)

| Rubrica Curricular | ID Tarefa | Atividade Semanal | Descrição Detalhada da Tarefa | Estudante Responsável | GitHub Username | Status de Entrega | Evidência/Seção Temática | Autoria Git |
| :---: | :---: | :---: | :--- | :--- | :---: | :---: | :--- | :---: |
| **H37b** | `T3.1` | `ATV3.1` | Configuração do Projeto Web (Create React App, Vite, etc.) | [Nome do Aluno 1] | `username1` | `⌛ Não Iniciado` | [Instalação/README](src/frontend/README.md) | [ ] |
| **H37b** | `T3.2` | `ATV3.1` | Estilização Global, Layout Base Responsivo e Temas (CSS) | [Nome do Aluno 2] | `username2` | `⌛ Não Iniciado` | [Seção 1.2](#12-estilizacao-e-design-sistema) | [ ] |
| **H37b** | `T3.3` | `ATV3.1` | Desenvolvimento das Telas Chaves (Home, Cadastro, Dashboards) | [Nome do Aluno 3] | `username3` | `⌛ Não Iniciado` | [Seção 2.1](#21-telas-implementadas) | [ ] |
| **H35b** | `T3.4` | `ATV3.1` | Consumo Assíncrono da API backend (Services HTTP / Axios) | [Nome do Aluno 4] | `username4` | `⌛ Não Iniciado` | [Seção 3.2](#32-servicos-de-chamada-a-api) | [ ] |
| **H37b** | `T3.5` | `ATV3.1` | Gerenciamento de Estado Global do Cliente (Auth, Rotas Privadas) | [Nome do Aluno 5] | `username5` | `⌛ Não Iniciado` | [Seção 2.2](#22-rotas-e-estado-de-autenticacao) | [ ] |
| **H37c** | `T3.6` | `ATV3.2` | Desenvolvimento de Testes Modernos (Jest / Testing Library / Cypress) | [Nome do Aluno 6] | `username6` | `⌛ Não Iniciado` | [Seção 4.1](#41-arquivos-de-testes) | [ ] |
| **H35c** | `T3.7` | `ATV3.1` | Configuração de Build, Otimização (Assets, Caching) e Docker | [Nome do Aluno 1] | `username1` | `⌛ Não Iniciado` | [Seção 5.1](#51-conteinerisacao-da-aplicacao-web) | [ ] |
| **H37c** | `T3.8` | `ATV3.2` | Proposta de Implantação e Pipeline de CI/CD Web | [Nome do Aluno 5] | `username5` | `⌛ Não Iniciado` | [Seção 5.2](#52-proposta-de-infraestrutura-de-deploy-e-automacao-de-builds) | [ ] |

---

# 1. Escopo e Diretrizes da Interface Web

[Insira aqui uma breve introdução descrevendo o escopo técnico do produto Web que foi entregue. Qual framework visual principal foi adotado (ex: React com Vite, Angular, Vue), como a interface se conecta na topologia da sua rede distribuída e como as premissas de UX/UI foram priorizadas.]

## 1.1. Identidade Visual da Interface Web

[Justifique as escolhas visuais do design em conformidade com o que foi planejado na Etapa 1. Descreva brevemente a paleta de cores (ex: Primary `#1B2A47`, Secondary `#E2E8F0`), a tipografia (ex: `Inter, sans-serif`) e a biblioteca de componentes visuais adotada se houver (ex: TailwindCSS, ChakraUI, Bootstrap).]

---

# 2. Desenvolvimento de Páginas e Componentes

*(Esta seção atende diretamente à rubrica **H37b**)*

Abaixo detalhe como as interfaces visuais foram implementadas nos diretórios de código em [src/frontend/](src/frontend/).

## 2.1. Telas Implementadas

Descreva as telas desenvolvidas e como elas interagem com os fluxos operacionais planejados.

*   **Página 1: Login / Cadastro Administrativo**: [Explique o funcionamento da tela, indicando os campos de controle e o que ocorre quando há a submissão de dados.]
*   **Página 2: Dashboard de Soluções**: ...

*Insira ou anexe Screenshots funcionais do sistema rodando:*
```
[Insira aqui imagens das telas navegáveis na Web para evidência física]
```

## 2.2. Rotas e Estado de Autenticação

[Descreva como o aplicativo lida com autenticação. Explique se há um contexto de autenticação global para guardar o JWT gerado no backend, como o guardião de rotas (Route Guards) protege as páginas privadas de usuários sem login e como os dados são retidos no navegador (ex: localStorage, sessionStorage).]

---

# 3. Fluxo de Dados e Integração com Backend

*(Esta seção atende diretamente à rubrica **H35b**)*

A integração entre a interface Web (*Single Page Application*) e a arquitetura distribuída de microsserviços do **VagaLivre** é totalmente desacoplada e padronizada através do protocolo HTTP/HTTPS REST. Todas as requisições disparadas pelo frontend são direcionadas ao **API Gateway** unificado em produção (`https://gateway-api-d2uo.onrender.com`), responsável pelo roteamento para os respectivos microsserviços em nuvem (Identidade, Usuários, Disponibilidade, Reservas e Notificações).

---

## 3.1. Arquitetura de Comunicação Cliente-Servidor

A comunicação entre o cliente Web e o backend ocorre de forma assíncrona orientada a eventos de interface (utilizando a API `fetch` ou o cliente `axios`). Para garantir a segurança dos dados transmitidos e manter o estado da sessão ativo, a aplicação implementa o fluxo completo de autenticação e validação de permissões conforme detalhado no diagrama de sequência abaixo.

##### Diagrama de Sequência de Comunicação e Autenticação

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Front-end (Navegador SPA)
    participant AuthContext as Estado Global (AuthContext)
    participant GW as API Gateway (Render)
    participant IdentityAPI as API de Identidade (Pedro)
    participant SpotsAPI as API de Vagas (Allan)
    participant DB as PostgreSQL Serverless (Neon)

    Note over Browser, DB: 1. Inicialização e Validação de Sessão
    Browser->>AuthContext: Carrega aplicação SPA
    AuthContext->>Browser: Busca token no localStorage ("vagalivre_token")
    alt Token Presente
        AuthContext->>GW: GET /api/v1/auth/me (Header Authorization: Bearer token)
        GW->>IdentityAPI: Repassa chamada /api/v1/auth/me
        IdentityAPI->>DB: Valida assinatura HMAC e status "approved"
        DB-->>IdentityAPI: Dados do Usuário Válidos
        IdentityAPI-->>GW: HTTP 200 OK (Dados do perfil)
        GW-->>AuthContext: HTTP 200 OK
        AuthContext->>Browser: Mantém usuário autenticado no Estado Global
    else Token Ausente ou Expirado
        AuthContext->>Browser: Redireciona para rota pública /login
    end

    Note over Browser, DB: 2. Fluxo de Autenticação (Login)
    Browser->>GW: POST /api/v1/auth/login { email, password }
    GW->>IdentityAPI: Roteia requisição de Login
    IdentityAPI->>DB: Consulta credenciais e papel (resident/manager)
    DB-->>IdentityAPI: Usuário encontrado e status "approved"
    IdentityAPI-->>GW: HTTP 200 OK + Token HMAC-SHA256 (Validade 24h)
    GW-->>Browser: HTTP 200 OK { token, user }
    Browser->>AuthContext: Salva token no localStorage e atualiza estado da sessão

    Note over Browser, DB: 3. Consulta de Dados Autenticada
    Browser->>GW: GET /api/v1/spots?status=available (Bearer Token)
    GW->>SpotsAPI: Encaminha requisição de busca de vagas
    SpotsAPI->>DB: Consulta vagas com disponibilidade em JSON
    DB-->>SpotsAPI: Retorna registros de vagas
    SpotsAPI-->>GW: HTTP 200 OK [ Lista de Vagas ]
    GW-->>Browser: HTTP 200 OK [ Lista de Vagas ]
    Browser->>Browser: Renderiza componentes reativos (Cards de Vagas)
```

---

## 3.2. Serviços de Chamada à API

Para evitar a duplicação de código e centralizar as configurações de rede, o frontend utiliza uma camada de serviços isolada em [`src/frontend/src/services/api.js`](src/frontend/src/services/api.js). Esse módulo encapsula as chamadas HTTP com Axios, gerencia variáveis de ambiente e injeta interceptadores (*interceptors*) para tratamento global de tokens e erros.

##### Configuração Centralizada da API (`src/frontend/src/services/api.js`)

```javascript
import axios from 'axios';

// Definição da URL base centralizada no API Gateway em produção
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'https://gateway-api-d2uo.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Timeout de 60s para absorver o cold start do Render
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ==========================================================================
   INTERCEPTOR DE REQUISIÇÃO: Injeção de Token HMAC/JWT
   ========================================================================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vagalivre_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ==========================================================================
   INTERCEPTOR DE RESPOSTA: Tratamento Global de Erros e Expiração de Sessão
   ========================================================================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Sessão expirada ou token inválido: limpa o storage e redireciona para login
      if (status === 401) {
        localStorage.removeItem('vagalivre_token');
        localStorage.removeItem('vagalivre_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
      
      // Falha de Gateway ou Cold Start excedido no Render
      if (status === 502 || status === 504) {
        console.error('[API Gateway] Serviço temporariamente indisponível (Cold Start). Retentando...');
      }
    }
    return Promise.reject(error);
  }
);
```

##### Módulos de Serviços Especializados

As chamadas aos microsserviços do backend são expostas como funções assíncronas reutilizáveis:

```javascript
/* Módulo de Autenticação (Pedro) */
export const authService = {
  login: (credentials) => api.post('/api/v1/auth/login', credentials),
  getProfile: () => api.get('/api/v1/auth/me'),
  logout: () => api.post('/api/v1/auth/logout'),
};

/* Módulo de Disponibilidade de Vagas (Allan) */
export const spotService = {
  getAll: (params) => api.get('/api/v1/spots', { params }),
  getById: (id) => api.get(`/api/v1/spots/${id}`),
};

/* Módulo de Gestão de Reservas (Gustavo) */
export const reservationService = {
  create: (data) => api.post('/api/v1/reservations', data),
  getByUser: (userId) => api.get('/api/v1/reservations', { params: { userId } }),
  cancel: (id) => api.delete(`/api/v1/reservations/${id}`),
};

/* Módulo de Notificações (André) */
export const notificationService = {
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

/* Módulo de Usuários e Aprovação (Roberta) */
export const userService = {
  register: (data) => api.post('/api/v1/users', data),
  getPending: (condominiumId) => api.get('/api/v1/users', { params: { condominiumId, status: 'pending' } }),
  updateStatus: (userId, status) => api.patch(`/api/v1/users/${userId}`, { status }),
};
```

---

# 4. Estratégia e Relatório de Testes Web

*(Esta seção atende diretamente à rubrica **H37c**)*

[Descreva como a qualidade da interface e a resiliência a bugs foram validadas no projeto Web. Indique que ferramentas foram aplicadas para rodar os testes localmente.]

## 4.1. Arquivos de Testes

- **Ferramenta de Asserção de Interface**: (Ex: `Jest`, `React Testing Library`, `Cypress`, `Playwright`).
- **Comando de Execução**: `npm run test` ou `npm run cypress:run`.

### Tabela de Cobertura de Testes Web:

| Componente Web | Tipo de Teste (Unitário/E2E) | Cenário de Teste Validado | Status da Suíte |
| :--- | :--- | :--- | :---: |
| **Formulário de Entrada** | Unitário | Validação de preenchimento, e-mail inválido, botão desabilitado | ✔️ Passou |
| **Integração de Compra** | E2E | Fluxo completo desde seleção de item, autenticação até sucesso | ✔️ Passou |

---

# 5. Instruções de Implantação e DevOps Web

*(Esta seção atende diretamente à rubrica **H35c**)*

## 5.1. Conteinerização da Aplicação Web

[Descreva se o projeto conta com dockerização para servir a interface Web. Por exemplo, uso de imagens multi-stage contendo a etapa de geração de build node e a etapa final rodando um proxy reverso estático como o Nginx para melhor performance.]

- **Caminho do Dockerfile do Frontend Web**: `[src/frontend/Dockerfile](src/frontend/Dockerfile)`

---

## 5.2. Proposta de Infraestrutura de Deploy e Automação de Builds

Abaixo, apresente a proposta teórica de como o build de produção seria gerido e publicado. **Nota:** Não há cobrança de deploy prático na nuvem para esta disciplina; a avaliação consiste na demonstração teórica do plano de implantação/hospedagem e nos testes de interface executados localmente.

- **Serviço de Hospedagem Planejado**: (Ex: `Vercel`, `Netlify`, `GitHub Pages`).
- **Proposta de Fluxo Contínuo**: Explique como o build estático de produção seria planejado de forma automatizada no repositório (ex: GitHub Actions disparando build/teste a cada push).
- **Tratamento de Variáveis e Integração**: Descreva de forma textual como o frontend web se comunicaria com as URLs de variáveis de ambiente secretas em produção para apontar para as APIs distribuídas sem hardcode.

---

# 6. Referências Acadêmicas e de Engenharia

[Registre as fontes técnicas, documentação de frameworks (React, Angular) ou livros sobre usabilidade que inspiraram a solução.]

1. **NIELSEN, Jakob**. *Projetando Websites*: Usabilidade Desenvolvido por Jakob Nielsen. Rio de Janeiro: Campus, 2000.
2. **KRUG, Steve**. *Não me faça pensar*: Uma abordagem de bom senso à usabilidade na Web. Rio de Janeiro: Alta Books, 2014.
3. [Adicione referências de documentação oficial de frameworks e CSS utilizados].

