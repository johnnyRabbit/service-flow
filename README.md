# 🧊 ServiceFlow AI

> **MVP SaaS multi-tenant para pequenas empresas de serviços**  
> Automatiza atendimento, recolha de pedidos, marcações e follow-up — transformando conversas em ações estruturadas.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

---

## 🎯 Visão do Produto

O ServiceFlow AI é uma plataforma de **atendimento inteligente via WhatsApp** pensada para pequenas empresas de serviços (AVAC, eletricistas, canalizadores, manutenção, oficinas) que querem:

- ❌ Reduzir chamadas perdidas
- ❌ Eliminar mensagens repetitivas
- ❌ Diminuir tempo administrativo
- ✅ Transformar conversas em **pedidos estruturados**

### Exemplo de Fluxo

```
Cliente: "O meu ar condicionado não funciona."

↓ IA percebe a intenção e recolhe progressivamente:
   • tipo de equipamento
   • marca / modelo
   • sintoma / código de erro
   • fotografias
   • morada / urgência
   • disponibilidade

↓ Cria automaticamente:
   Request {
     cliente, contacto, serviço, problema,
     urgência, morada, anexos, disponibilidade, estado
   }

↓ Encaminha para humano (se necessário)
↓ Funcionário vê pedido no dashboard
```

> ⚠️ **Não é um chatbot genérico.** É um sistema que transforma conversas em ações e pedidos estruturados.

---

## 🏗️ Arquitetura

### Monorepo (planeado para produção)

```
pnpm + Turborepo

apps/
  web          → Next.js + shadcn/ui + Tailwind
  api          → NestJS

packages/
  ui           → Componentes partilhados
  database     → Prisma + PostgreSQL
  ai           → Abstração de providers (Groq/OpenAI)
  types        → Tipos partilhados
  config       → Configurações partilhadas
```

### Stack

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS, TypeScript |
| **Database** | PostgreSQL + Prisma |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Messaging** | Meta WhatsApp Cloud API |
| **AI** | Groq (primary) + OpenAI (fallback) |
| **Async/Jobs** | Redis + BullMQ |
| **Email** | Resend |
| **Monitoring** | Sentry |
| **Analytics** | PostHog |

### Deploy

| Serviço | Plataforma |
|---|---|
| Web | Vercel |
| API | Railway |
| DB / Auth / Storage | Supabase |
| Redis | Upstash |

---

## 🧩 Entidades Multi-Tenant

Todas as entidades têm `organizationId` para garantir **isolamento entre tenants**.

```
Organization
├── User
├── Customer
├── Conversation
│   └── Message
├── Request
├── Service
├── Appointment
├── FAQ
├── AutomationRule
└── AuditLog
```

---

## 📦 Módulos

### 1. Organizations
Cada empresa configura: nome, horários, telefone, email, zonas de serviço, serviços, regras e FAQs.

### 2. Customers
Nome, telefone, email, morada e histórico de interações.

### 3. Conversations
Estados possíveis:
- `AI_ACTIVE` — IA a recolher dados
- `WAITING_CUSTOMER` — A aguardar resposta
- `NEEDS_HUMAN` — Handoff necessário
- `HUMAN_ACTIVE` — Funcionário assumiu
- `CLOSED` — Finalizada

### 4. Inbox
Lista em tempo real com filtros por estado, prioridade, atribuição e última mensagem.

### 5. Requests
Estados: `NEW → REVIEWING → QUOTE_PENDING → QUOTED → SCHEDULED → IN_PROGRESS → COMPLETED / CANCELLED`

### 6. Services
Cada empresa configura os seus próprios serviços com:
- **Campos obrigatórios** (ex: marca, modelo, sintomas, fotos, morada)
- **Campos opcionais** (ex: código de erro)
- **Regras automáticas** (ex: cheiro a queimado → handoff imediato)

### 7. AI Engine
Abstração `AIProvider` com implementações `GroqProvider` e `OpenAIProvider`.

Funções principais:
```ts
classifyIntent()
extractStructuredData()
generateReply()
decideNextAction()
```

Todos os outputs são validados com **Zod** e preferem **structured output**.

Exemplo de output:
```json
{
  "intent": "REQUEST_SERVICE",
  "service": "AIR_CONDITIONING",
  "urgency": "NORMAL",
  "missingFields": ["address", "photos"],
  "confidence": 0.91
}
```

> ⚠️ O LLM **nunca altera diretamente a base de dados**.

### 8. Tools (Function Calling)
Ações controladas que o LLM pode invocar:

```ts
createRequest()
updateRequest()
getServices()
getBusinessHours()
checkAvailability()
createAppointment()
requestHuman()
closeConversation()
```

Cada tool:
- Valida permissões
- Valida tenant
- Regista `AuditLog`
- Retorna resultado estruturado

### 9. Human-in-the-Loop
Três níveis de autonomia configuráveis por organização:

| Nível | Descrição |
|---|---|
| **1 — Sugestão** | IA apenas sugere respostas; humano aprova tudo |
| **2 — Semi-Autónomo** ⭐ | IA responde FAQs e recolhe dados; ações importantes exigem aprovação |
| **3 — Autónomo** | IA executa ações previamente autorizadas sem aprovação |

### 10. WhatsApp
Integração com **Meta WhatsApp Cloud API**:

```
WhatsApp → webhook → NestJS
  → localizar organization/customer/conversation
  → processar mensagem (IA + regras)
  → responder
```

Implementa: validação de webhook, processamento idempotente, retries, logging e tratamento de anexos.

### 11. Automações
Modelo `Trigger → Condition → Action` executado via **BullMQ**.

**Triggers:** `REQUEST_CREATED`, `REQUEST_UPDATED`, `QUOTE_SENT`, `APPOINTMENT_CREATED`, `APPOINTMENT_REMINDER`, `CONVERSATION_IDLE`

**Actions:** `SEND_MESSAGE`, `SEND_EMAIL`, `NOTIFY_USER`, `REQUEST_HUMAN`, `UPDATE_REQUEST`

Exemplo:
> WHEN quote sent → WAIT 48h → IF no customer reply → THEN send follow-up

### 12. Appointments
Calendário interno simples com estados: `SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED / CANCELLED / NO_SHOW`.

Arquitetura preparada para futura integração com Google Calendar.

### 13. Dashboard
Métricas principais:
- Conversas ativas / totais
- Pedidos totais / tratados pela IA
- Human handoffs
- Marcações do dia
- Leads
- **EstimatedTimeSaved** (métrica configurável)
- Tempo médio de resposta
- Satisfação do cliente

### 14. Audit Log
Regista **toda** a atividade:
```ts
{
  actorType: 'USER' | 'AI' | 'SYSTEM',
  action,
  entityType,
  entityId,
  before,
  after,
  timestamp
}
```

### 15. Segurança
- RBAC (OWNER / ADMIN / TECHNICIAN / VIEWER)
- Isolamento de tenant a nível de database
- Validação com Zod
- Rate limiting
- Secrets management
- Webhook validation (Meta)
- Audit logs
- Minimização de dados

### 16. Clínicas (extensibilidade)
Quando usado numa clínica, o sistema **limita-se** a:
- Marcações e reagendamentos
- Confirmações
- FAQs administrativas
- Horários e contactos

**Nunca faz:** diagnóstico, triagem clínica, aconselhamento médico ou decisões de tratamento.

Permite configurar **categorias de dados proibidas** para envio ao LLM.

---

## 🧪 Testes

Testes obrigatórios:
- ✅ Tenant isolation
- ✅ Create request
- ✅ WhatsApp webhook
- ✅ AI structured output
- ✅ Tool validation
- ✅ Human handoff
- ✅ Appointment
- ✅ Automation
- ✅ Audit log

Stack: **Jest / Vitest**, **Supertest**, **Playwright**.

---

## 🔭 Observabilidade

- Logs estruturados
- Sentry para erros
- **correlationId** em todas as requests
- **organizationId** e **conversationId** em todos os logs

---

## 🚀 CI/CD

GitHub Actions:
```
lint → typecheck → tests → build → deploy
```

---

## 🚫 Fora do Escopo (MVP)

Não usar:
- ❌ Microservices
- ❌ Kafka
- ❌ Kubernetes
- ❌ Temporal
- ❌ Elasticsearch
- ❌ ClickHouse
- ❌ Event sourcing

Arquitetura **modular dentro do monólito**.

---

## 📅 Fases de Implementação

| Fase | Conteúdo | Estado |
|---|---|---|
| **1** | Monorepo, auth, organizations, database | ✅ Implementado (simulado no frontend) |
| **2** | Customers, services, requests | ✅ Implementado (CRUD completo) |
| **3** | Conversations, messages, inbox | ✅ Implementado (tempo real + webhook) |
| **4** | AI providers, structured output, tools | ✅ Implementado (engine completa + console) |
| **5** | Human handoff | ✅ Implementado (queue + supervisão + níveis) |
| **6** | WhatsApp | ✅ Implementado (configuração + status + eventos) |
| **7** | Appointments | ✅ Implementado (criação + calendário + lista) |
| **8** | BullMQ automations | ✅ Implementado (execução simulada + logs + métricas) |
| **9** | Dashboard | ✅ Implementado |
| **10** | Hardening, tests, logging | 🔜 Próxima fase |

> Em cada fase: **implementar → testar → documentar → explicar decisões → indicar riscos → só depois avançar**.

### Detalhes das Fases 1 e 2

#### Fase 1 — Auth, Organizations, Database

**Implementado:**
- ✅ `AuthContext` com login/logout, persistência em localStorage, multi-tenant
- ✅ Contas demo: `admin@climatech.pt` / `carlos@climatech.pt` (password: `demo123`)
- ✅ Qualquer email com password `demo123` cria automaticamente um novo tenant
- ✅ `DataProvider` com "database" em memória isolada por `organizationId`
- ✅ Repositórios CRUD: `customersRepo`, `servicesRepo`, `requestsRepo`, `conversationsRepo`, `appointmentsRepo`, `orgRepo`, `auditRepo`
- ✅ `ToastContext` para notificações em tempo real
- ✅ Página de Login com UI completa e contas demo
- ✅ Isolamento de tenant: cada organização tem a sua própria "database"

**Decisões:**
- Simular o backend com Context API + memória (em produção: NestJS + Prisma + Supabase)
- `localStorage` para persistir sessão (em produção: Supabase Auth com JWT)
- Repositórios seguem o padrão Repository para fácil migração para API real

**Riscos:**
- Dados em memória perdem-se ao refresh (exceto auth)
- Sem validação de schema no frontend (em produção: Zod no backend)

#### Fase 2 — Customers, Services, Requests

**Implementado:**
- ✅ Página `CustomersPage` com CRUD completo (criar, editar, eliminar, pesquisar)
- ✅ Página `Services` com criação de novos serviços via modal
- ✅ Página `Requests` com workflow de estados interativo (clique para mudar estado)
- ✅ Modal de criação de pedido com seleção de cliente/serviço/urgência
- ✅ Audit log automático em todas as operações CRUD
- ✅ Toasts de feedback para cada ação

**Decisões:**
- Workflow de estados em `Requests` clicável para demonstrar transições
- Audit log gerado automaticamente por cada operação nos repositórios
- Modais reutilizáveis (`Modal` component) para consistência visual

**Riscos:**
- Sem paginação (em produção: cursor-based pagination)
- Sem validação de permissões RBAC nas operações

#### Fase 3 — Conversations, Messages, Inbox

**Implementado:**

*Messaging em tempo real:*
- ✅ **Simulador de Webhook WhatsApp** — botão "Simular mensagem" na Inbox dispara uma mensagem de cliente aleatória em tempo real
- ✅ **Simulação contínua** — botão "Iniciar simulação" dispara mensagens a cada 8-15 segundos
- ✅ **Feed de Webhook Events** — barra superior na Inbox mostra eventos em tempo real (incoming, AI response, handoff, request created)
- ✅ **Indicador de digitação** animado enquanto a IA está a processar (`TypingIndicator` component)
- ✅ **Notificações toast** para cada evento (incoming, handoff, pedido criado)

*Inbox avançada:*
- ✅ **Filtros avançados** — por canal (WhatsApp/Email/Web), prioridade (Alta/Normal/Baixa) e estado
- ✅ **Ações em lote** — selecionar múltiplas conversas com checkboxes + bulk takeover/close
- ✅ **Indicador SLA** — mostra tempo desde última mensagem (>30min em laranja)
- ✅ **Dot de estado** no avatar para indicar estado atual da conversa
- ✅ **Pesquisa** por nome de cliente ou conteúdo da mensagem

*ConversationDetail rico:*
- ✅ **Anexos** — simular envio de fotos, documentos e áudio (com preview e remoção)
- ✅ **Notas internas** — painel lateral dedicado com notas privadas (não visíveis para o cliente)
- ✅ **Templates de resposta rápida** — 10 templates pré-definidos (saudação, preços, agendamento, etc.)
- ✅ **Transferência entre agentes** — dropdown para reatribuir conversa a outro agente
- ✅ **Estatísticas da conversa** — total de mensagens, mensagens do cliente vs IA, duração, canal, performance IA
- ✅ **Painel com 3 abas** — Contexto (cliente + IA + transferência + ações), Notas, Stats

**Decisões:**
- `useWebhookSimulator` hook encapsula toda a lógica de simulação (mensagens, IA, handoffs, pedidos)
- Separação entre mensagens do cliente, IA, utilizador e sistema para clareza visual
- Notas internas armazenadas localmente no componente (em produção: tabela `InternalNote` na DB)
- Quick replies como dados estáticos (`quickReplies.ts`) para fácil extensão

**Riscos:**
- Simulação usa `setInterval` (em produção: WebSocket/SSE para tempo real)
- Notas não persistem entre refresh (em produção: tabela dedicada)
- Sem rate limiting na simulação (em produção: Redis + BullMQ)

#### Fase 4 — AI Providers, Structured Output, Tools

**Implementado:**

*Motor de IA completo:*
- ✅ **Abstração `AIProvider`** — interface para trocar entre Groq, OpenAI ou outros providers
- ✅ **`MockAIProvider`** — implementação simulada compatível com Groq
- ✅ **Validação com Zod** — schemas para `IntentSchema`, `ToolCallSchema`, `AIResponseSchema`
- ✅ **Structured Output** — outputs sempre validados e tipados
- ✅ **Sistema de Tools (Function Calling)** — IA pode invocar ferramentas controladas:
  - `getServiceDetails` — obter detalhes de serviço
  - `checkAvailability` — verificar disponibilidade para agendamento
  - `getCustomerInfo` — obter informação do cliente
- ✅ **Cada tool valida** permissões, tenant, e regista em audit log
- ✅ **Métricas em tempo real** — tempo de processamento, tokens usados, confiança, tool calls

*AI Console (página dedicada):*
- ✅ **Métricas agregadas** — total chamadas, tempo médio, confiança média, tool calls, handoffs
- ✅ **Distribuição de intenções** — gráfico de barras com % por tipo de intenção
- ✅ **Logs detalhados** — cada chamada à IA com:
  - Input/Output
  - Intent + confiança
  - Tool calls executados (com parâmetros e resultados)
  - Tempo de processamento e tokens
  - Modelo utilizado
- ✅ **Indicadores visuais** — handoffs, erros, sucesso
- ✅ **Botão "Limpar Métricas"** — reset do estado

*Integração com Inbox:*
- ✅ ConversationDetail agora usa o `aiEngine` em vez do simulador antigo
- ✅ Cada mensagem processada é registada no `AIContext`
- ✅ Métricas acumulam em tempo real enquanto usas a app

**Arquitetura:**
```
src/lib/
├── ai-schemas.ts      # Zod schemas (Intent, ToolCall, AIResponse)
├── ai-engine.ts       # AIProvider abstraction + MockAIProvider
└── ai-simulator.ts    # (legado, mantido para compatibilidade)

src/contexts/
└── AIContext.tsx      # Métricas globais da IA

src/pages/
└── AIConsole.tsx      # Dashboard de monitorização da IA
```

**Fluxo:**
```
Mensagem do Cliente
  ↓
AI Engine (aiEngine.process)
  ↓
AIProvider.processMessage(message, context)
  ↓
├─ analyzeIntent() → IntentSchema (Zod validated)
├─ executeTools() → ToolCall[] (cada tool validado)
└─ AIResponse { intent, toolCalls, processingTime, tokens, model }
  ↓
AIContext.addMetric() → Métricas acumuladas
  ↓
UI: Mensagem + AI Console atualizados
```

**Decisões:**
- Zod para validação rigorosa de outputs (em produção: previne alucinações)
- Abstração `AIProvider` permite trocar de provider sem mudar código
- Tools são executadas dentro do provider (não expostas ao LLM diretamente)
- Métricas em memória (em produção: PostgreSQL + dashboard dedicado)

**Riscos:**
- Mock provider não reflete latência real de APIs externas
- Sem fallback automático entre providers (em produção: circuit breaker)
- Métricas em memória perdem-se ao refresh (em produção: persistência)

#### Fase 5 — Human Handoff

**Implementado:**

*Sistema de Handoff completo:*
- ✅ **`HandoffContext`** — gestão centralizada de pedidos de handoff
- ✅ **3 Níveis de Autonomia** configuráveis em tempo real:
  - **Nível 1 — Sugestão**: IA apenas sugere respostas, humano aprova tudo
  - **Nível 2 — Semi-Autónomo** (padrão): IA responde FAQs e recolhe dados, ações importantes exigem aprovação
  - **Nível 3 — Autónomo**: IA executa ações previamente autorizadas sem aprovação
- ✅ **Queue de Handoffs** — pedidos pendentes com prioridade (LOW/NORMAL/HIGH/CRITICAL)
- ✅ **Resumo automático da IA** — cada handoff inclui contexto gerado pela IA
- ✅ **Ações de supervisão**:
  - Aceitar e assumir conversa (navega para inbox)
  - Rejeitar handoff
  - Resolver handoff (após intervenção)
- ✅ **Integração com ConversationDetail** — quando IA deteta `requiresHuman`, cria automaticamente pedido de handoff
- ✅ **Notificações toast** — alerta visual quando handoff é criado

*Página de Supervisão:*
- ✅ **Controlo de Nível de Autonomia** — botões para alternar entre níveis 1/2/3
- ✅ **Métricas em tempo real**:
  - Pendentes
  - Críticos
  - Resolvidos
  - Taxa de aceitação
- ✅ **Lista de handoffs pendentes** com:
  - Nome do cliente
  - Urgência (badge colorido)
  - Motivo do handoff
  - Resumo da IA (contexto completo)
  - Botões Aceitar/Rejeitar
- ✅ **Handoffs recentes** — histórico com status e agente responsável

**Arquitetura:**
```
src/contexts/
└── HandoffContext.tsx    # Queue + níveis de autonomia

src/pages/
└── HandoffSupervisor.tsx # Página de supervisão
```

**Fluxo:**
```
Mensagem do Cliente
  ↓
AI Engine processa
  ↓
requiresHuman === true?
  ↓ Sim
HandoffContext.requestHandoff()
  ↓
Queue atualizada + Toast notificação
  ↓
Supervisor vê em /handoffs
  ↓
Aceita → Navega para /inbox/:conversationId
  ↓
Humano assume conversa (HUMAN_ACTIVE)
```

**Decisões:**
- Níveis de autonomia configuráveis globalmente (em produção: por organização/serviço)
- Handoffs com resumo automático da IA (reduz tempo de contexto do humano)
- Queue ordenada por urgência (CRITICAL primeiro)
- Integração bidirecional: ConversationDetail cria handoff, Supervisor aceita e navega

**Riscos:**
- Sem SLA automático (em produção: alertas se handoff não aceite em X minutos)
- Sem rotação de agentes (em produção: round-robin ou load balancing)
- Handoffs em memória perdem-se ao refresh (em produção: persistência)

#### Fase 6 — WhatsApp

**Implementado:**

*Página de Integração WhatsApp completa:*
- ✅ **Status de conexão** — indicador visual (conectado/desconectado) com botão de teste
- ✅ **Configuração editável**:
  - Webhook URL (com botão copiar)
  - Verify Token (com botão copiar)
  - Phone Number ID
  - Business Account ID
- ✅ **Métricas em tempo real**:
  - Mensagens recebidas hoje
  - Taxa de entrega
  - Erros nas últimas 24h
- ✅ **Webhook Events subscritos** — lista de eventos ativos/inativos:
  - `messages` — receber mensagens de clientes
  - `message_status` — status de entrega
  - `message_template_status_update` — atualizações de templates
- ✅ **Log de webhooks recentes** — histórico com:
  - Timestamp
  - Cliente
  - Tipo de evento
  - Status (sucesso/erro)
- ✅ **Instruções de setup** — passo-a-passo para configurar no Meta for Developers
- ✅ **Link para documentação oficial** da Meta

*Integração com resto do sistema:*
- ✅ Webhook Tester (já implementado na Fase 3) simula mensagens WhatsApp
- ✅ AI Engine processa mensagens recebidas
- ✅ Handoff automático quando necessário
- ✅ Pedidos criados automaticamente pela IA

**Arquitetura (produção):**
```
WhatsApp Cloud API
  ↓ (webhook POST)
NestJS Backend
  ↓
├─ Validar signature (HMAC-SHA256)
├─ Verificar verify_token
├─ Processar idempotente (dedup por message_id)
├─ Localizar organization/customer/conversation
├─ AI Engine processa
├─ Tools executadas (se necessário)
└─ Responder via WhatsApp API
```

**Decisões:**
- Página de configuração editável (em produção: apenas leitura + botão "ir para Meta")
- Webhook URL e Verify Token copiáveis para facilitar setup
- Log de webhooks recentes para debugging
- Instruções de setup integradas na UI

**Riscos:**
- Sem validação de signature HMAC (em produção: obrigatório)
- Sem processamento idempotente (em produção: dedup por message_id)
- Sem rate limiting específico para WhatsApp (em produção: Redis + BullMQ)
- Sem retry logic (em produção: dead letter queue)

#### Fase 7 — Appointments

**Implementado:**

*Página de Marcações melhorada:*
- ✅ **Criação de marcações** — modal com:
  - Seleção de cliente
  - Seleção de serviço
  - Data e hora
  - Duração (minutos)
  - Notas adicionais
- ✅ **Vista Lista** — agrupada por dia (Hoje, Amanhã):
  - Hora e duração
  - Nome do cliente
  - Serviço
  - Estado (badge colorido)
  - Morada
  - Técnico atribuído
  - Notas
  - Botões Confirmar/Reagendar
- ✅ **Vista Calendário** — grelha mensal com:
  - Dias do mês
  - Marcações visíveis em cada dia
  - Destaque do dia atual
- ✅ **Métricas em tempo real**:
  - Marcações hoje
  - Marcações amanhã
  - Total da semana
  - Taxa de confirmação
- ✅ **Integração com DataContext** — criação persistida e refletida em todas as vistas
- ✅ **Estados de marcação**:
  - SCHEDULED (agendada)
  - CONFIRMED (confirmada)
  - IN_PROGRESS (em curso)
  - COMPLETED (concluída)
  - CANCELLED (cancelada)
  - NO_SHOW (não compareceu)

**Decisões:**
- Vista lista como padrão (mais útil para operações diárias)
- Calendário como vista alternativa (visão geral)
- Modal de criação com validação de campos obrigatórios
- Estados com cores distintas para fácil identificação

**Riscos:**
- Sem verificação de conflitos de agenda (em produção: verificar disponibilidade do técnico)
- Sem integração com Google Calendar (preparado para futura integração)
- Sem lembretes automáticos (em produção: BullMQ + WhatsApp)
- Sem reagendamento automático (em produção: IA sugere alternativas)

#### Fase 8 — BullMQ Automations

**Implementado:**

*Sistema de Automações completo:*
- ✅ **Automações pré-configuradas** — 5 regras de exemplo:
  - Follow-up após orçamento (48h)
  - Lembrete de marcação (24h antes)
  - Conversa inativa (2h sem resposta)
  - Notificação de pedido urgente (imediato)
  - Pedido de avaliação após conclusão (1h)
- ✅ **Visualização de fluxo** — cada regra mostra:
  - Trigger (azul)
  - Condições (amarelo)
  - Delay (cinza)
  - Actions (verde)
- ✅ **Simulação de execução** — botão Play para executar automação:
  - Duração aleatória (50-250ms)
  - Taxa de sucesso de 90%
  - Logs registados automaticamente
- ✅ **Métricas em tempo real**:
  - Regras ativas
  - Total de execuções
  - Taxa de sucesso
  - Duração média
- ✅ **Logs de execução** — histórico com:
  - Nome da automação
  - Timestamp
  - Duração
  - Status (SUCCESS/FAILED)
  - Mensagem de erro (se aplicável)
- ✅ **Toggle enable/disable** — ativar/desativar regras
- ✅ **Botão "Limpar"** — reset dos logs de execução

**Arquitetura (produção):**
```
Trigger (evento do sistema)
  ↓
BullMQ Job criado
  ↓
Worker processa
  ↓
├─ Verificar condições
├─ Aguardar delay (se necessário)
├─ Executar actions
└─ Registar resultado
```

**Decisões:**
- Simulação em memória (em produção: Redis + BullMQ)
- Logs mantidos em memória (últimos 100)
- Taxa de sucesso simulada (90%)
- Duração aleatória para simular latência real

**Riscos:**
- Sem persistência de jobs (em produção: Redis)
- Sem retry logic (em produção: dead letter queue)
- Sem priorização de jobs (em produção: prioridades BullMQ)
- Sem rate limiting (em produção: Redis + limiter)
- Sem monitorização de falhas (em produção: Sentry + alertas)

---

## 🎯 Objetivo do Primeiro Release

Uma empresa consegue:
1. ✅ Criar conta
2. ✅ Configurar serviços
3. ✅ Receber mensagem WhatsApp
4. ✅ IA recolhe dados progressivamente
5. ✅ Criar pedido estruturado
6. ✅ Encaminhar para humano
7. ✅ Funcionário vê pedido no dashboard

**Esse é o MVP real. Tudo o resto é secundário.**

---

## 💻 Protótipo Frontend (este repositório)

Este repositório contém um **protótipo funcional do frontend** que demonstra visualmente todos os módulos descritos acima, com dados mock realistas para uma empresa de AVAC.

### Stack do Protótipo
- React 18 + TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Recharts (dashboard)
- Lucide React (ícones)

### Arquitetura do Protótipo

```
src/
├── App.tsx                    # Rotas + providers (Auth, Toast, Data)
├── components/
│   ├── Layout.tsx             # Sidebar + topbar dinâmicos
│   └── ui/
│       └── Modal.tsx          # Modal reutilizável
├── contexts/
│   ├── AuthContext.tsx        # Autenticação multi-tenant
│   ├── DataContext.tsx        # CRUD + estado global
│   └── ToastContext.tsx       # Notificações
├── data/
│   └── mockData.ts            # Dados iniciais de demonstração
├── lib/
│   ├── ai-simulator.ts        # Simula AI engine (structured output)
│   └── db.ts                  # "Database" em memória com repos CRUD
├── pages/
│   ├── LandingPage.tsx        # Página pública
│   ├── LoginPage.tsx          # Login com contas demo
│   ├── Dashboard.tsx          # Métricas dinâmicas
│   ├── Inbox.tsx              # Lista de conversas
│   ├── ConversationDetail.tsx # Conversa + IA em tempo real
│   ├── Requests.tsx           # Pedidos com workflow
│   ├── CustomersPage.tsx      # CRUD de clientes
│   ├── Services.tsx           # CRUD de serviços
│   ├── Appointments.tsx       # Calendário
│   ├── WebhookTester.tsx      # Simulador de WhatsApp
│   ├── Automations.tsx        # Regras Trigger→Condition→Action
│   ├── AuditLogs.tsx          # Registo de auditoria
│   └── Settings.tsx           # Configurações multi-tenant
├── types/
│   └── index.ts               # Tipos TypeScript
└── index.css                  # Tailwind + tema
```

**Fluxo de dados:**
```
User Action → DataContext → Repository (db.ts) → Audit Log → Toast
                           ↕
                    AI Simulator (ai-simulator.ts)
                           ↕
                    Conversations / Requests
```

### Estrutura
```
src/
├── App.tsx                    # Rotas principais
├── components/
│   └── Layout.tsx             # Sidebar + topbar
├── data/
│   └── mockData.ts            # Dados de demonstração
├── pages/
│   ├── LandingPage.tsx        # Página pública + demo
│   ├── Dashboard.tsx          # Métricas e gráficos
│   ├── Inbox.tsx              # Lista de conversas
│   ├── ConversationDetail.tsx # Conversa + painel de contexto
│   ├── Requests.tsx           # Pedidos estruturados
│   ├── Services.tsx           # Configuração de serviços
│   ├── Appointments.tsx       # Calendário / lista
│   ├── Automations.tsx        # Regras Trigger→Condition→Action
│   ├── AuditLogs.tsx          # Registo de auditoria
│   └── Settings.tsx           # Configurações multi-tenant
├── types/
│   └── index.ts               # Tipos TypeScript
└── index.css                  # Tailwind + tema
```

### Executar

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # produção
npm run typecheck  # verificação de tipos
```

### 🚀 Deploy no Vercel

Este protótipo está pronto para deploy no Vercel. Existem duas formas:

#### Opção A — Via Vercel CLI (recomendado)

```bash
# 1. Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy de preview
vercel

# 4. Deploy para produção
vercel --prod
```

#### Opção B — Via GitHub + Vercel Dashboard

1. Fazer push do repositório para o GitHub/GitLab/Bitbucket
2. Aceder a [vercel.com/new](https://vercel.com/new)
3. Importar o repositório
4. Vercel deteta automaticamente o Vite (framework preset)
5. Clicar em **Deploy**

#### Opção C — Via Vercel Dashboard (sem Git)

1. Aceder a [vercel.com/new](https://vercel.com/new)
2. Escolher "Deploy from template" ou arrastar a pasta `dist/` gerada por `npm run build`

### Configuração (`vercel.json`)

O ficheiro `vercel.json` já está configurado com:
- **Framework preset**: Vite
- **Rewrites**: necessário para o React Router funcionar (SPA)
- **Cache headers**: para assets estáticos em `/assets/`

```json
{
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> 💡 **Nota sobre o README principal**: o README descreve a arquitetura de produção com **Next.js + NestJS** (monorepo). Este protótipo é apenas o **frontend de demonstração** em Vite + React. Para o produto final, o `apps/web` em Next.js também será deployado no Vercel, seguindo a mesma lógica.

---

## 🏢 Casos de Uso Iniciais

- 🔧 **AVAC** — Reparação, manutenção e instalação de ar condicionado
- ⚡ **Eletricistas** — Avarias, instalações, certificações
- 🚰 **Canalizadores** — Fugas, desentupimentos, instalações
- 🛠️ **Manutenção geral** — Contratos de manutenção preventiva
- 🚗 **Oficinas** — Diagnóstico, reparações, revisões

### Extensível para (futuro):
- 💅 Estética
- 🏋️ Ginásios
- 🍽️ Restauração
- 🏥 Clínicas (apenas processos administrativos)

---

## 📄 Licença

Proprietário. Todos os direitos reservados.

---

<p align="center">
  <strong>ServiceFlow AI</strong><br/>
  <em>Transformar conversas em ações.</em>
</p>
