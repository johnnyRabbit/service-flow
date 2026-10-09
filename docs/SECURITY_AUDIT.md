# 🔒 Auditoria de Segurança e Performance

## Data: 2024
## Status: CRÍTICO - Correções Necessárias

---

## 🚨 PROBLEMAS CRÍTICOS DE SEGURANÇA

### 1. **Webhook Signature Verification Opcional** 🔴 CRÍTICO
**Localização:** `apps/api/src/whatsapp/whatsapp.controller.ts:48-53`

**Problema:**
```typescript
// Atual: Signature verification é opcional
if (signature && !this.whatsappService.verifyWebhookSignature(payload, signature)) {
  this.logger.warn('Invalid webhook signature');
  return { status: 'error', message: 'Invalid signature' };
}
```

**Risco:** Ataques de webhook spoofing - atacantes podem enviar mensagens falsas

**Correção:**
```typescript
// Obrigatório em produção
if (!signature) {
  this.logger.error('Missing webhook signature');
  return { status: 'error', message: 'Missing signature' };
}

if (!this.whatsappService.verifyWebhookSignature(payload, signature)) {
  this.logger.error('Invalid webhook signature');
  return { status: 'error', message: 'Invalid signature' };
}
```

**Prioridade:** 🔴 CRÍTICA - Implementar imediatamente

---

### 2. **Falta Helmet.js (Security Headers)** 🔴 CRÍTICO
**Localização:** `apps/api/src/main.ts`

**Problema:** Sem security headers HTTP

**Risco:** 
- XSS attacks
- Clickjacking
- MIME sniffing
- Content injection

**Correção:**
```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }));
}
```

**Prioridade:** 🔴 CRÍTICA - Implementar imediatamente

---

### 3. **CORS Muito Permissivo** 🟠 ALTO
**Localização:** `apps/api/src/main.ts:36-39`

**Problema:**
```typescript
app.enableCors({
  origin: configService.get<string>('FRONTEND_URL', 'http://localhost:5173'),
  credentials: true,
});
```

**Risco:** Se FRONTEND_URL não estiver configurado, permite qualquer origem

**Correção:**
```typescript
const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

app.enableCors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Prioridade:** 🟠 ALTA

---

### 4. **Validação de Input Insuficiente** 🔴 CRÍTICO
**Localização:** Múltiplos controllers

**Problema:**
```typescript
// requests.controller.ts:25
@Post()
create(@Request() req, @Body() body: any) {  // ❌ Sem validação
  return this.requestsService.create(req.user.organizationId, body);
}
```

**Risco:** 
- SQL injection (embora Prisma proteja)
- Data corruption
- Type confusion attacks

**Correção:** Criar DTOs com class-validator para TODOS os endpoints

```typescript
// dto/create-request.dto.ts
import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  customerId: string;

  @IsString()
  serviceId: string;

  @IsString()
  problem: string;

  @IsString()
  address: string;

  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  @IsOptional()
  urgency?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}

// requests.controller.ts
@Post()
create(@Request() req, @Body() body: CreateRequestDto) {  // ✅ Validado
  return this.requestsService.create(req.user.organizationId, body);
}
```

**Prioridade:** 🔴 CRÍTICA - Implementar para todos os endpoints

---

### 5. **Rate Limiting Insuficiente** 🟠 ALTO
**Localização:** `apps/api/src/app.module.ts:34-37`

**Problema:**
```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,
  limit: 100,  // 100 requests por minuto para TODOS os endpoints
}])
```

**Risco:** 
- Brute force attacks em /auth/login
- DoS em endpoints pesados
- Abuse de webhooks

**Correção:**
```typescript
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,
    limit: 3,  // 3 requests por segundo
  },
  {
    name: 'medium',
    ttl: 60000,
    limit: 100,  // 100 requests por minuto
  },
  {
    name: 'long',
    ttl: 3600000,
    limit: 1000,  // 1000 requests por hora
  },
]),

// Aplicar throttlers específicos
@Throttle({ short: 5, medium: 50 })  // Login: 5/seg, 50/min
@Post('login')
async login() { }

@Throttle({ short: 1, medium: 10 })  // Webhook: 1/seg, 10/min
@Post('webhooks/whatsapp')
async webhook() { }
```

**Prioridade:** 🟠 ALTA

---

### 6. **JWT sem Refresh Token** 🟠 ALTO
**Localização:** `apps/api/src/auth/auth.module.ts:19`

**Problema:**
```typescript
signOptions: { expiresIn: '7d' },  // Token válido por 7 dias
```

**Risco:** 
- Token roubado pode ser usado por 7 dias
- Sem mecanismo de revogação
- Ataque de replay

**Correção:** Implementar refresh tokens
```typescript
// auth.service.ts
async login(email: string, password: string) {
  const user = await this.validateUser(email, password);
  
  const accessToken = this.jwtService.sign(
    { sub: user.id, email: user.email },
    { expiresIn: '15m' }  // Access token: 15 minutos
  );
  
  const refreshToken = this.jwtService.sign(
    { sub: user.id },
    { expiresIn: '7d' }  // Refresh token: 7 dias
  );
  
  // Salvar refresh token no database
  await this.prisma.refreshToken.create({
     {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  
  return { accessToken, refreshToken };
}

async refreshToken(refreshToken: string) {
  // Validar refresh token
  const stored = await this.prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  
  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedException('Invalid refresh token');
  }
  
  // Gerar novo access token
  const user = await this.prisma.user.findUnique({
    where: { id: stored.userId },
  });
  
  const newAccessToken = this.jwtService.sign(
    { sub: user.id, email: user.email },
    { expiresIn: '15m' }
  );
  
  return { accessToken: newAccessToken };
}
```

**Prioridade:** 🟠 ALTA

---

### 7. **Logs Podem Expor Dados Sensíveis** 🟡 MÉDIO
**Localização:** Múltiplos services

**Problema:**
```typescript
this.logger.log(`Processing message from ${message.from}`);  // Telefone
this.logger.log(`Email sent to ${recipients.join(', ')}`);   // Emails
```

**Risco:** Exposição de PII em logs

**Correção:**
```typescript
// Criar helper de sanitização
function sanitizeLog(data: any): any {
  const sanitized = { ...data };
  
  // Mascaramento de dados sensíveis
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  if (sanitized.email) {
    sanitized.email = sanitized.email.replace(/(.{2}).*(@.*)/, '$1***$2');
  }
  if (sanitized.password) {
    sanitized.password = '***';
  }
  
  return sanitized;
}

// Uso
this.logger.log(`Processing message from ${sanitizeLog({ phone: message.from }).phone}`);
```

**Prioridade:** 🟡 MÉDIA

---

### 8. **Falta Unique Constraint em Customer.phone** 🟡 MÉDIO
**Localização:** `apps/api/prisma/schema.prisma:95-116`

**Problema:**
```prisma
model Customer {
  phone  String  // ❌ Sem unique constraint
}
```

**Risco:** Duplicação de clientes, confusão de dados

**Correção:**
```prisma
model Customer {
  phone  String
  
  @@unique([organizationId, phone])  // ✅ Unique por organização
}
```

**Prioridade:** 🟡 MÉDIA

---

## ⚡ PROBLEMAS DE PERFORMANCE

### 1. **Sem Paginação em Queries** 🔴 CRÍTICO
**Localização:** Múltiplos services

**Problema:**
```typescript
// customers.service.ts:8
async findAll(organizationId: string) {
  return this.prisma.customer.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });  // ❌ Retorna TODOS os clientes
}
```

**Risco:** 
- Timeout em queries grandes
- Uso excessivo de memória
- Slowdown da aplicação

**Correção:**
```typescript
async findAll(
  organizationId: string,
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    this.prisma.customer.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.customer.count({ where: { organizationId } }),
  ]);

  return {
    data: customers,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

**Prioridade:** 🔴 CRÍTICA - Implementar em todas as queries findMany

---

### 2. **N+1 Query Problem** 🟠 ALTO
**Localização:** `apps/api/src/conversations/conversations.service.ts:13-26`

**Problema:**
```typescript
async findAll(organizationId: string) {
  return this.prisma.conversation.findMany({
    where: { organizationId },
    include: {
      customer: true,      // ❌ Carrega customer para CADA conversation
      assignedUser: true,  // ❌ Carrega user para CADA conversation
    },
  });
}
```

**Risco:** 
- 1 query + N queries adicionais
- Performance degrada com número de conversas

**Correção:**
```typescript
async findAll(organizationId: string, options: any = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  // Batch loading com include otimizado
  return this.prisma.conversation.findMany({
    where: { organizationId },
    include: {
      customer: {
        select: {  // ✅ Apenas campos necessários
          id: true,
          name: true,
          phone: true,
        },
      },
      assignedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { messages: true },  // ✅ Contagem sem carregar mensagens
      },
    },
    orderBy: { lastMessageAt: 'desc' },
    skip,
    take: limit,
  });
}
```

**Prioridade:** 🟠 ALTA

---

### 3. **Falta Database Connection Pooling** 🟠 ALTO
**Localização:** `apps/api/src/prisma/prisma.service.ts`

**Problema:** Configuração padrão do Prisma

**Risco:** 
- Conexões excessivas ao database
- Performance degradation under load

**Correção:**
```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Adicionar connection pool config
// DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

**Prioridade:** 🟠 ALTA

---

### 4. **Sem Cache em Queries Frequentes** 🟡 MÉDIO
**Localização:** Múltiplos services

**Problema:** Todas as queries vão ao database

**Risco:** 
- Latência alta
- Carga excessiva no database

**Correção:** Implementar cache com Redis
```typescript
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';

// app.module.ts
@Module({
  imports: [
    CacheModule.register({
      ttl: 300,  // 5 minutos
      max: 100,  // 100 items
    }),
  ],
})

// services.controller.ts
@UseInterceptors(CacheInterceptor)
@Get()
@CacheKey('services_list')
@CacheTTL(300)  // 5 minutos
findAll() {
  return this.servicesService.findAll();
}
```

**Prioridade:** 🟡 MÉDIA

---

### 5. **Falta Compression Middleware** 🟡 MÉDIO
**Localização:** `apps/api/src/main.ts`

**Problema:** Respostas não comprimidas

**Risco:** 
- Uso excessivo de bandwidth
- Latência alta em conexões lentas

**Correção:**
```typescript
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Compress responses
  app.use(compression({
    level: 6,  // Balance between speed and compression
    threshold: 1024,  // Compress only if > 1KB
  }));
}
```

**Prioridade:** 🟡 MÉDIA

---

### 6. **Database Indexes Faltando** 🟡 MÉDIO
**Localização:** `apps/api/prisma/schema.prisma`

**Problema:** Faltam indexes em campos de filtro frequentes

**Risco:** Queries lentas em filtros

**Correção:**
```prisma
model Customer {
  // ... fields
  
  @@index([organizationId])
  @@index([phone])
  @@index([createdAt])  // ✅ Adicionar
  @@index([organizationId, createdAt])  // ✅ Composite index
}

model Conversation {
  // ... fields
  
  @@index([organizationId])
  @@index([state])
  @@index([assignedUserId])
  @@index([lastMessageAt])  // ✅ Adicionar
  @@index([organizationId, state])  // ✅ Composite index
}

model ServiceRequest {
  // ... fields
  
  @@index([organizationId])
  @@index([state])
  @@index([assignedUserId])
  @@index([createdAt])  // ✅ Adicionar
  @@index([organizationId, state, createdAt])  // ✅ Composite index
}
```

**Prioridade:** 🟡 MÉDIA

---

### 7. **Sem Query Timeout** 🟡 MÉDIO
**Localização:** `apps/api/src/prisma/prisma.service.ts`

**Problema:** Queries podem correr indefinidamente

**Risco:** 
- Resource exhaustion
- Slow queries bloqueiam sistema

**Correção:**
```typescript
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    
    // Set query timeout
    this.$executeRaw`SET statement_timeout = '30s'`;
  }
}
```

**Prioridade:** 🟡 MÉDIA

---

## 📋 CHECKLIST DE CORREÇÕES

### 🔴 CRÍTICO (Implementar Imediatamente)
- [ ] 1. Webhook signature verification obrigatória
- [ ] 2. Helmet.js security headers
- [ ] 3. Validação de input em TODOS os endpoints (DTOs)
- [ ] 4. Paginação em todas as queries findMany

### 🟠 ALTO (Implementar em 1 semana)
- [ ] 5. CORS restritivo
- [ ] 6. Rate limiting granular
- [ ] 7. JWT refresh tokens
- [ ] 8. N+1 query optimization
- [ ] 9. Database connection pooling

### 🟡 MÉDIO (Implementar em 2 semanas)
- [ ] 10. Sanitização de logs
- [ ] 11. Unique constraint em Customer.phone
- [ ] 12. Cache com Redis
- [ ] 13. Compression middleware
- [ ] 14. Database indexes
- [ ] 15. Query timeout

---

## 🎯 PLANO DE AÇÃO

### Semana 1: Segurança Crítica
1. Implementar Helmet.js
2. Webhook signature obrigatória
3. DTOs para todos os endpoints
4. Paginação em queries

### Semana 2: Performance
5. Otimizar N+1 queries
6. Connection pooling
7. Database indexes
8. Compression

### Semana 3: Segurança Avançada
9. Refresh tokens
10. Rate limiting granular
11. CORS restritivo
12. Log sanitization

### Semana 4: Otimizações
13. Cache com Redis
14. Query timeouts
15. Unique constraints
16. Testes de carga

---

## 📊 IMPACTO ESTIMADO

### Segurança
- **Antes:** Vulnerável a 8 tipos de ataques
- **Depois:** Proteção contra 95% dos ataques comuns

### Performance
- **Antes:** 
  - Queries sem limite: 5-10s em 10k registros
  - Sem cache: 200-500ms por request
- **Depois:**
  - Queries paginadas: <100ms
  - Com cache: <50ms (cache hit)

---

## 🔧 FERRAMENTAS DE TESTE

### Segurança
```bash
# OWASP ZAP
zap-cli quick-scan http://localhost:3001

# SQLMap (testar SQL injection)
sqlmap -u "http://localhost:3001/api/v1/customers?id=1"

# Nmap (port scanning)
nmap -sV localhost
```

### Performance
```bash
# Apache Bench (load testing)
ab -n 1000 -c 10 http://localhost:3001/api/v1/customers

# Artillery (advanced load testing)
artillery quick --count 100 --num 10 http://localhost:3001/api/v1/customers

# Lighthouse (frontend performance)
lighthouse http://localhost:5173
```

---

## 📚 REFERÊNCIAS

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security)
- [Prisma Performance Guide](https://www.prisma.io/docs/guides/performance-and-optimization)
- [JWT Refresh Token Pattern](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)

---

**Próxima Ação:** Começar com correções CRÍTICAS (Semana 1)
