# ServiceFlow AI - Backend API

Backend NestJS para o ServiceFlow AI - Sistema de atendimento automatizado para pequenas empresas.

## 🏗️ Arquitetura

```
apps/api/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── prisma/                    # Database layer
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── auth/                      # Authentication & Authorization
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── decorators/
│   │       └── roles.decorator.ts
│   ├── customers/                 # Customer management
│   ├── services/                  # Service catalog
│   ├── requests/                  # Service requests
│   ├── conversations/             # Conversations & messaging
│   ├── messages/                  # Message handling
│   ├── appointments/              # Appointments & scheduling
│   ├── automations/               # Automation rules
│   ├── ai/                        # AI engine (Groq/OpenAI)
│   ├── whatsapp/                  # WhatsApp integration
│   ├── webhooks/                  # Webhook handlers
│   ├── audit/                     # Audit logging
│   ├── queue/                     # Background jobs (BullMQ)
│   ├── organizations/             # Organization management
│   └── users/                     # User management
├── prisma/
│   └── schema.prisma              # Database schema
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 🚀 Setup

### 1. Instalar dependências

```bash
cd apps/api
npm install
```

### 2. Configurar variáveis de ambiente

Copiar `.env.example` para `.env.local` e preencher:

```bash
cp ../../.env.example .env.local
```

Variáveis necessárias:
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `JWT_SECRET` - Secret para JWT tokens
- `GROQ_API_KEY` - Groq API key (AI provider)
- `OPENAI_API_KEY` - OpenAI API key (fallback)
- `WHATSAPP_*` - Meta WhatsApp Cloud API credentials
- `RESEND_API_KEY` - Resend API key (email)
- `UPSTASH_REDIS_*` - Upstash Redis credentials (queue)

### 3. Setup do Database

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio
npm run prisma:studio

# (Opcional) Seed database
npm run prisma:seed
```

### 4. Iniciar servidor

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `GET /api/v1/auth/me` - Get current user

### Customers
- `GET /api/v1/customers` - List customers
- `GET /api/v1/customers/:id` - Get customer
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Conversations
- `GET /api/v1/conversations` - List conversations
- `GET /api/v1/conversations/:id` - Get conversation
- `PUT /api/v1/conversations/:id/state` - Update state

### Requests
- `GET /api/v1/requests` - List requests
- `GET /api/v1/requests/:id` - Get request
- `POST /api/v1/requests` - Create request
- `PUT /api/v1/requests/:id` - Update request

## 🔐 Autenticação & Autorização

### JWT Authentication
Todas as rotas protegidas requerem header:
```
Authorization: Bearer <token>
```

### RBAC (Role-Based Access Control)

5 roles disponíveis:
- **OWNER** - Acesso total
- **ADMIN** - Acesso quase total (sem billing)
- **MANAGER** - Gere operações
- **TECHNICIAN** - Apenas atribuídos
- **VIEWER** - Apenas leitura

Uso em controllers:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.ADMIN)
@Get()
findAll() { ... }
```

## 🗄️ Database Schema

Ver `prisma/schema.prisma` para schema completo.

Entidades principais:
- **Organization** - Multi-tenant root
- **User** - Organization members
- **Customer** - End customers
- **Service** - Service catalog
- **ServiceRequest** - Service requests
- **Conversation** - Conversations
- **Message** - Messages
- **Appointment** - Appointments
- **AutomationRule** - Automation rules
- **AuditLog** - Audit trail

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Deploy

### Railway (recomendado)
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático em cada push

### Docker
```bash
docker build -t serviceflow-api .
docker run -p 3001:3001 serviceflow-api
```

## 🔗 Integrações

### WhatsApp Cloud API
- Webhook receiver em `/api/v1/webhooks/whatsapp`
- Validação de signature HMAC-SHA256
- Processamento idempotente

### AI Providers
- **Groq** (primary) - Llama 3.1 70B
- **OpenAI** (fallback) - GPT-4
- Abstração em `src/ai/`

### Email (Resend)
- Envio de emails transacionais
- Templates em `src/emails/`

### Queue (BullMQ + Redis)
- Background jobs
- Retry logic
- Dead letter queue

## 📝 Notas

- Este backend é complementar ao frontend em `src/`
- O frontend usa mocks para desenvolvimento
- Em produção, frontend conecta a este backend
- Isolamento de tenant garantido em todas queries

## 📚 Documentação

- [API Docs](./docs/API.md)
- [Database Schema](./prisma/schema.prisma)
- [Permissions](../../docs/PERMISSIONS.md)

---

**ServiceFlow AI** - Transformar conversas em ações.
