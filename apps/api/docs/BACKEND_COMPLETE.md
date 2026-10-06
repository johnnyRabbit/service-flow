# 🚀 Backend Completo - ServiceFlow API

## ✅ Status: 100% Completo

O backend NestJS está agora **completamente funcional** com todos os módulos implementados.

## 📦 Módulos Implementados

### **Core Modules**
- ✅ **AuthModule** - JWT authentication + RBAC
- ✅ **PrismaModule** - Database ORM
- ✅ **OrganizationsModule** - Multi-tenant management
- ✅ **UsersModule** - User management with roles

### **Business Logic Modules**
- ✅ **CustomersModule** - Customer CRUD
- ✅ **ServicesModule** - Service catalog
- ✅ **RequestsModule** - Service requests
- ✅ **ConversationsModule** - Conversations
- ✅ **MessagesModule** - Messages
- ✅ **AppointmentsModule** - Appointments & scheduling
- ✅ **AutomationsModule** - Automation rules

### **Integration Modules**
- ✅ **AIModule** - Groq AI integration
- ✅ **WhatsAppModule** - WhatsApp Cloud API
- ✅ **EmailModule** - Resend email service
- ✅ **QueueModule** - BullMQ background jobs
- ✅ **WebhooksModule** - Webhook handlers

### **Monitoring**
- ✅ **AuditModule** - Audit logging

## 🏗️ Arquitetura

```
apps/api/src/
├── main.ts                          # Entry point
├── app.module.ts                    # Root module
├── common/
│   └── filters/
│       └── all-exceptions.filter.ts # Global exception filter
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── decorators/
│       └── roles.decorator.ts
├── organizations/
│   ├── organizations.module.ts
│   ├── organizations.service.ts
│   ├── organizations.controller.ts
│   └── dto/
│       └── organization.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── dto/
│       └── user.dto.ts
├── customers/
│   ├── customers.module.ts
│   ├── customers.service.ts
│   ├── customers.controller.ts
│   └── dto/
│       └── customer.dto.ts
├── services/
│   ├── services.module.ts
│   ├── services.service.ts
│   ├── services.controller.ts
│   └── dto/
│       └── service.dto.ts
├── requests/
│   ├── requests.module.ts
│   ├── requests.service.ts
│   ├── requests.controller.ts
│   └── dto/
│       └── request.dto.ts
├── conversations/
│   ├── conversations.module.ts
│   ├── conversations.service.ts
│   ├── conversations.controller.ts
│   └── dto/
│       └── conversation.dto.ts
├── messages/
│   ├── messages.module.ts
│   ├── messages.service.ts
│   ├── messages.controller.ts
│   └── dto/
│       └── message.dto.ts
├── appointments/
│   ├── appointments.module.ts
│   ├── appointments.service.ts
│   ├── appointments.controller.ts
│   └── dto/
│       └── appointment.dto.ts
├── automations/
│   ├── automations.module.ts
│   ├── automations.service.ts
│   ├── automations.controller.ts
│   └── dto/
│       └── automation.dto.ts
├── ai/
│   ├── ai.module.ts
│   └── groq.service.ts
├── whatsapp/
│   ├── whatsapp.module.ts
│   ├── whatsapp.service.ts
│   ├── whatsapp.controller.ts
│   └── message-processor.service.ts
├── email/
│   ├── email.module.ts
│   └── email.service.ts
├── queue/
│   ├── queue.module.ts
│   ├── queue.service.ts
│   └── processors/
│       ├── message.processor.ts
│       ├── automation.processor.ts
│       └── email.processor.ts
├── webhooks/
│   └── webhooks.module.ts
└── audit/
    ├── audit.module.ts
    └── audit.service.ts
```

## 🔌 API Endpoints

### **Auth**
```
POST   /api/v1/auth/login          # Login
POST   /api/v1/auth/register       # Register
GET    /api/v1/auth/me             # Get current user
```

### **Organizations**
```
GET    /api/v1/organizations       # List all (OWNER, ADMIN)
GET    /api/v1/organizations/:id   # Get one (OWNER, ADMIN)
POST   /api/v1/organizations       # Create (OWNER, ADMIN)
PATCH  /api/v1/organizations/:id   # Update (OWNER, ADMIN)
DELETE /api/v1/organizations/:id   # Delete (OWNER only)
```

### **Users**
```
GET    /api/v1/users               # List all (OWNER, ADMIN, MANAGER)
GET    /api/v1/users/:id           # Get one (OWNER, ADMIN, MANAGER)
POST   /api/v1/users               # Create (OWNER, ADMIN)
PATCH  /api/v1/users/:id           # Update (OWNER, ADMIN)
DELETE /api/v1/users/:id           # Delete (OWNER, ADMIN)
```

### **Customers**
```
GET    /api/v1/customers           # List all (all roles)
GET    /api/v1/customers/:id       # Get one (all roles)
POST   /api/v1/customers           # Create (OWNER, ADMIN, MANAGER)
PUT    /api/v1/customers/:id       # Update (OWNER, ADMIN, MANAGER)
DELETE /api/v1/customers/:id       # Delete (OWNER, ADMIN)
```

### **Services**
```
GET    /api/v1/services            # List all (all roles)
GET    /api/v1/services/:id        # Get one (all roles)
POST   /api/v1/services            # Create (OWNER, ADMIN)
PATCH  /api/v1/services/:id        # Update (OWNER, ADMIN)
DELETE /api/v1/services/:id        # Delete (OWNER, ADMIN)
```

### **Requests**
```
GET    /api/v1/requests            # List all (all roles)
GET    /api/v1/requests/:id        # Get one (all roles)
POST   /api/v1/requests            # Create (OWNER, ADMIN, MANAGER)
PUT    /api/v1/requests/:id        # Update (all roles)
```

### **Conversations**
```
GET    /api/v1/conversations       # List all (all roles)
GET    /api/v1/conversations/:id   # Get one (all roles)
PUT    /api/v1/conversations/:id/state  # Update state (OWNER, ADMIN, MANAGER, TECHNICIAN)
```

### **Messages**
```
GET    /api/v1/messages/conversation/:conversationId  # List messages
GET    /api/v1/messages/:id        # Get one
POST   /api/v1/messages            # Create
POST   /api/v1/messages/conversation/:conversationId/read  # Mark as read
DELETE /api/v1/messages/:id        # Delete (OWNER, ADMIN)
```

### **Appointments**
```
GET    /api/v1/appointments        # List all (all roles)
GET    /api/v1/appointments/stats  # Get stats (OWNER, ADMIN, MANAGER)
GET    /api/v1/appointments/:id    # Get one (all roles)
POST   /api/v1/appointments        # Create (OWNER, ADMIN, MANAGER)
PATCH  /api/v1/appointments/:id    # Update (OWNER, ADMIN, MANAGER, TECHNICIAN)
DELETE /api/v1/appointments/:id    # Delete (OWNER, ADMIN)
```

### **Automations**
```
GET    /api/v1/automations         # List all (OWNER, ADMIN, MANAGER)
GET    /api/v1/automations/trigger/:trigger  # Get by trigger
GET    /api/v1/automations/:id     # Get one
POST   /api/v1/automations         # Create (OWNER, ADMIN)
PATCH  /api/v1/automations/:id     # Update (OWNER, ADMIN)
PATCH  /api/v1/automations/:id/toggle  # Toggle enabled (OWNER, ADMIN)
DELETE /api/v1/automations/:id     # Delete (OWNER, ADMIN)
```

### **WhatsApp Webhooks**
```
GET    /api/v1/webhooks/whatsapp   # Verify webhook
POST   /api/v1/webhooks/whatsapp   # Receive messages
```

### **Queue Stats**
```
GET    /api/v1/queue/stats         # Get queue statistics
```

## 🔐 Autenticação & Autorização

### **JWT Authentication**
Todas as rotas protegidas requerem:
```
Authorization: Bearer <token>
```

### **RBAC (Role-Based Access Control)**

| Role | Permissões |
|------|-----------|
| **OWNER** | Acesso total, incluindo billing e delete de organização |
| **ADMIN** | Acesso quase total, sem delete de organização |
| **MANAGER** | Gere operações, sem delete de dados críticos |
| **TECHNICIAN** | Apenas dados atribuídos |
| **VIEWER** | Apenas leitura |

### **Tenant Isolation**
Todas as queries incluem `organizationId` para garantir isolamento entre tenants.

## 🗄️ Database Schema

Ver `prisma/schema.prisma` para o schema completo.

**Modelos principais:**
- Organization (multi-tenant root)
- User (organization members)
- Customer (end customers)
- Service (service catalog)
- ServiceRequest (service requests)
- Conversation (conversations)
- Message (messages)
- Appointment (appointments)
- AutomationRule (automation rules)
- AuditLog (audit trail)

## 🚀 Como Usar

### **1. Instalar dependências**
```bash
cd apps/api
npm install
```

### **2. Configurar .env.local**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
GROQ_API_KEY="gsk_..."
WHATSAPP_PHONE_NUMBER_ID="..."
WHATSAPP_ACCESS_TOKEN="..."
RESEND_API_KEY="re_..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### **3. Setup database**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### **4. Iniciar servidor**
```bash
npm run start:dev
```

### **5. Testar API**
```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@climatech.pt","password":"demo123"}'

# Listar clientes
curl http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Features

### **Core**
- ✅ Multi-tenant isolation
- ✅ JWT authentication
- ✅ RBAC com 5 roles
- ✅ Input validation (class-validator)
- ✅ Global exception handling
- ✅ Audit logging

### **Business Logic**
- ✅ CRUD completo para todas as entidades
- ✅ Filtros e paginação
- ✅ Tenant isolation em todas queries
- ✅ Relações entre entidades

### **Integrations**
- ✅ WhatsApp Cloud API (webhook + envio)
- ✅ Groq AI (processamento de mensagens)
- ✅ Resend (email service)
- ✅ BullMQ (background jobs)
- ✅ Upstash Redis (queue backend)

### **Performance**
- ✅ Background processing
- ✅ Retry logic
- ✅ Queue statistics
- ✅ Audit trail

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Documentation

- [Setup Guide](./docs/SETUP_PHASE1.md)
- [Architecture](../../docs/ARCHITECTURE.md)
- [Security](../../docs/SECURITY.md)
- [Permissions](../../docs/PERMISSIONS.md)

## 🎯 Status

**Backend:** ✅ **100% Completo**

Todos os módulos estão implementados e funcionais. O backend está pronto para:
- ✅ Receber requests do frontend
- ✅ Processar mensagens WhatsApp
- ✅ Gerir dados multi-tenant
- ✅ Executar automações
- ✅ Enviar emails
- ✅ Processar em background

**Próximo passo:** Deploy em produção! 🚀

---

**ServiceFlow API** - Backend completo e production-ready! 🎉
