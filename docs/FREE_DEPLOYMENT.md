# 🚀 Guia de Deploy Gratuito - ServiceFlow AI

## 📊 Stack 100% Gratuita

### **Frontend**
- **Vercel** - Hosting gratuito para React/Next.js
  - ✅ Deploy automático do GitHub
  - ✅ HTTPS automático
  - ✅ CDN global
  - ✅ 100 GB bandwidth/mês
  - 🔗 [vercel.com](https://vercel.com)

### **Backend**
- **Railway** - Hosting gratuito para Node.js/NestJS
  - ✅ $5 crédito gratuito/mês
  - ✅ Deploy automático do GitHub
  - ✅ Variáveis de ambiente
  - ✅ Logs em tempo real
  - 🔗 [railway.app](https://railway.app)

**Alternativas:**
- **Render** - 750 horas/mês grátis
- **Fly.io** - 3 VMs gratuitas
- **Koyeb** - 1 serviço gratuito

### **Database**
- **Supabase** - PostgreSQL gratuito
  - ✅ 500 MB storage
  - ✅ 5 GB bandwidth/mês
  - ✅ Backup automático
  - ✅ Auth integrado
  - 🔗 [supabase.com](https://supabase.com)

**Alternativas:**
- **Neon** - 0.5 GB gratuito
- **PlanetScale** - 5 GB gratuito (MySQL)
- **Aiven** - 5 GB gratuito

### **Redis**
- **Upstash** - Redis serverless gratuito
  - ✅ 10,000 commands/dia
  - ✅ REST API
  - ✅ Auto-scaling
  - 🔗 [upstash.com](https://upstash.com)

**Alternativas:**
- **Redis Cloud** - 30 MB gratuito
- **Redis Labs** - 30 MB gratuito

### **AI**
- **Groq** - API de IA gratuita
  - ✅ 14,400 requests/dia
  - ✅ Llama 3.1 70B
  - ✅ Resposta ultra-rápida
  - 🔗 [groq.com](https://groq.com)

**Alternativas:**
- **OpenRouter** - Modelos gratuitos
- **Hugging Face** - Inferência gratuita

### **Email**
- **Resend** - Email API gratuita
  - ✅ 3,000 emails/mês
  - ✅ 100 emails/dia
  - ✅ Templates HTML
  - 🔗 [resend.com](https://resend.com)

**Alternativas:**
- **Mailgun** - 100 emails/dia
- **SendGrid** - 100 emails/dia

### **WhatsApp**
- **Meta Cloud API** - API oficial gratuita
  - ✅ 1,000 conversas/mês
  - ✅ Webhooks
  - ✅ Templates
  - 🔗 [developers.facebook.com](https://developers.facebook.com)

### **Monitoring**
- **Sentry** - Error tracking gratuito
  - ✅ 5,000 events/mês
  - ✅ Performance monitoring
  - ✅ Release tracking
  - 🔗 [sentry.io](https://sentry.io)

- **PostHog** - Analytics gratuito
  - ✅ 1,000,000 events/mês
  - ✅ Product analytics
  - ✅ Feature flags
  - 🔗 [posthog.com](https://posthog.com)

**Alternativas:**
- **LogRocket** - Error tracking
- **Datadog** - APM (trial gratuito)

---

## 📋 Passo a Passo Completo

### **1. Criar Contas Gratuitas**

Cria contas em todos os serviços:

```bash
# Lista de serviços
1. GitHub (já tens)
2. Vercel - https://vercel.com/signup
3. Railway - https://railway.app/login
4. Supabase - https://supabase.com/dashboard/sign-up
5. Upstash - https://upstash.com/
6. Groq - https://console.groq.com/
7. Resend - https://resend.com/
8. Meta Developer - https://developers.facebook.com/
9. Sentry - https://sentry.io/signup/
10. PostHog - https://posthog.com/
```

---

### **2. Configurar Supabase (Database)**

#### **2.1 Criar Projeto**
1. Aceder a [supabase.com](https://supabase.com)
2. Clicar em "New Project"
3. Preencher:
   - Name: `serviceflow-db`
   - Database Password: (gerar password forte)
   - Region: Europe (Frankfurt)
4. Clicar em "Create new project"
5. Aguardar ~2 minutos

#### **2.2 Obter Credenciais**
1. Ir a **Settings → Database**
2. Copiar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (NUNCA expor no frontend!)

#### **2.3 Configurar DATABASE_URL**
1. Ir a **Settings → Database → Connection string**
2. Copiar URI format:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
3. Substituir `[PASSWORD]` pela tua password

#### **2.4 Executar Migrations**
```bash
cd apps/api

# Instalar Prisma CLI
npm install -g prisma

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate deploy

# (Opcional) Seed database
npx prisma db seed
```

---

### **3. Configurar Upstash (Redis)**

#### **3.1 Criar Database**
1. Aceder a [upstash.com](https://upstash.com)
2. Clicar em "Create Database"
3. Preencher:
   - Name: `serviceflow-redis`
   - Type: Regional
   - Region: Europe (Frankfurt)
4. Clicar em "Create"

#### **3.2 Obter Credenciais**
1. Ir ao dashboard da database
2. Copiar:
   - **REST URL**: `https://xxxxx.upstash.io`
   - **REST Token**: `AXxxxxx...`

---

### **4. Configurar Groq (AI)**

#### **4.1 Obter API Key**
1. Aceder a [console.groq.com](https://console.groq.com)
2. Ir a **API Keys**
3. Clicar em "Create API Key"
4. Copiar a key: `gsk_xxxxx...`

---

### **5. Configurar Resend (Email)**

#### **5.1 Obter API Key**
1. Aceder a [resend.com](https://resend.com)
2. Ir a **API Keys**
3. Clicar em "Create API Key"
4. Copiar a key: `re_xxxxx...`

#### **5.2 Verificar Domínio (Opcional)**
1. Ir a **Domains**
2. Adicionar teu domínio
3. Configurar DNS records
4. Aguardar verificação

---

### **6. Configurar Meta WhatsApp (Opcional)**

#### **6.1 Criar App**
1. Aceder a [developers.facebook.com](https://developers.facebook.com)
2. Clicar em "My Apps → Create App"
3. Escolher "Business"
4. Preencher detalhes
5. Clicar em "Create App"

#### **6.2 Adicionar WhatsApp**
1. No dashboard da app, clicar em "Add Product"
2. Escolher "WhatsApp"
3. Clicar em "Set Up"

#### **6.3 Obter Credenciais**
1. Ir a **WhatsApp → API Setup**
2. Copiar:
   - **Phone Number ID**: `123456789...`
   - **WhatsApp Business Account ID**: `987654321...`
   - **Temporary Access Token**: `EAAD...` (válido 24h)

#### **6.4 Gerar Token Permanente**
1. Ir a **System Users** (Business Settings → Users → System Users)
2. Criar novo system user
3. Adicionar assets (app)
4. Gerar token permanente

#### **6.5 Configurar Webhook**
1. Ir a **WhatsApp → Configuration**
2. Em "Webhook", clicar em "Edit"
3. Preencher:
   - **Callback URL**: `https://seu-backend.railway.app/api/v1/webhooks/whatsapp`
   - **Verify Token**: `serviceflow_verify_token_2024`
4. Subscrever: `messages`, `message_status`

---

### **7. Configurar Sentry (Monitoring)**

#### **7.1 Criar Projeto**
1. Aceder a [sentry.io](https://sentry.io)
2. Clicar em "Create Project"
3. Escolher "Node.js"
4. Preencher:
   - Name: `serviceflow-api`
   - Team: `serviceflow`
5. Clicar em "Create Project"

#### **7.2 Obter DSN**
1. Copiar DSN: `https://xxxxx@sentry.io/xxxxx`

---

### **8. Configurar PostHog (Analytics)**

#### **8.1 Criar Projeto**
1. Aceder a [posthog.com](https://posthog.com)
2. Clicar em "Create Project"
3. Preencher:
   - Name: `ServiceFlow AI`
4. Clicar em "Create Project"

#### **8.2 Obter API Key**
1. Ir a **Settings → Project**
2. Copiar:
   - **Project API Key**: `phc_xxxxx...`
   - **API Host**: `https://app.posthog.com`

---

### **9. Deploy Backend (Railway)**

#### **9.1 Preparar Código**
```bash
# Commit todas as alterações
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### **9.2 Criar Projeto Railway**
1. Aceder a [railway.app](https://railway.app)
2. Clicar em "New Project"
3. Escolher "Deploy from GitHub Repo"
4. Selecionar o repositório `serviceflow-ai`
5. Escolher a branch `main`

#### **9.3 Configurar Root Directory**
1. Ir a **Settings → Source**
2. Em "Root Directory", colocar: `apps/api`
3. Clicar em "Save"

#### **9.4 Configurar Variáveis de Ambiente**
1. Ir a **Variables**
2. Adicionar todas as variáveis:

```env
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres

# JWT
JWT_SECRET=gerar-com-openssl-rand-base64-32

# AI
GROQ_API_KEY=gsk_xxxxx...
GROQ_MODEL=llama-3.1-70b-versatile

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=123456789...
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321...
WHATSAPP_ACCESS_TOKEN=EAAD...
WHATSAPP_VERIFY_TOKEN=serviceflow_verify_token_2024
WHATSAPP_WEBHOOK_SECRET=gerar-com-openssl-rand-hex-32

# Email
RESEND_API_KEY=re_xxxxx...
RESEND_FROM_EMAIL=noreply@teu-dominio.com

# Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxx...

# Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Analytics
POSTHOG_API_KEY=phc_xxxxx...
POSTHOG_HOST=https://app.posthog.com

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://seu-frontend.vercel.app
API_URL=https://seu-backend.railway.app
```

#### **9.5 Gerar Secrets**
```bash
# JWT Secret
openssl rand -base64 32

# Webhook Secret
openssl rand -hex 32
```

#### **9.6 Deploy**
1. Railway vai automaticamente detetar o `package.json`
2. Vai executar `npm install` e `npm run build`
3. Aguardar deploy (~5 minutos)
4. Copiar URL: `https://seu-backend.railway.app`

#### **9.7 Verificar Deploy**
```bash
# Testar health check
curl https://seu-backend.railway.app/api/v1/health

# Deve retornar: {"status":"ok","timestamp":"..."}
```

---

### **10. Deploy Frontend (Vercel)**

#### **10.1 Preparar Código**
```bash
# Atualizar API URL
# Editar src/lib/api.ts
const API_BASE_URL = 'https://seu-backend.railway.app/api/v1';
```

#### **10.2 Criar Projeto Vercel**
1. Aceder a [vercel.com](https://vercel.com)
2. Clicar em "Add New → Project"
3. Importar o repositório `serviceflow-ai`
4. Vercel vai automaticamente detetar o Vite
5. Clicar em "Deploy"

#### **10.3 Configurar Variáveis de Ambiente**
1. Ir a **Settings → Environment Variables**
2. Adicionar:

```env
VITE_API_URL=https://seu-backend.railway.app/api/v1
VITE_POSTHOG_API_KEY=phc_xxxxx...
```

#### **10.4 Aguardar Deploy**
1. Vercel vai executar `npm install` e `npm run build`
2. Aguardar deploy (~3 minutos)
3. Copiar URL: `https://seu-frontend.vercel.app`

#### **10.5 Verificar Deploy**
1. Aceder a `https://seu-frontend.vercel.app`
2. Fazer login com:
   - Email: `admin@climatech.pt`
   - Password: `demo123`
3. Verificar se o dashboard carrega

---

### **11. Configurar WhatsApp Webhook**

#### **11.1 Atualizar Webhook URL**
1. Voltar ao Meta Developer
2. Ir a **WhatsApp → Configuration**
3. Atualizar **Callback URL**:
   ```
   https://seu-backend.railway.app/api/v1/webhooks/whatsapp
   ```
4. Clicar em "Verify and Save"

#### **11.2 Testar Webhook**
```bash
# Enviar mensagem de teste via WhatsApp
# Ou usar curl para simular webhook

curl -X POST https://seu-backend.railway.app/api/v1/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "SEU_NUMERO",
            "phone_number_id": "SEU_PHONE_NUMBER_ID"
          },
          "contacts": [{
            "profile": { "name": "Test User" },
            "wa_id": "351912345678"
          }],
          "messages": [{
            "from": "351912345678",
            "id": "wamid.TEST",
            "timestamp": "1234567890",
            "type": "text",
            "text": { "body": "Olá, o meu AC não funciona" }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

---

### **12. Testar Sistema Completo**

#### **12.1 Testar Frontend**
```bash
# Aceder ao frontend
https://seu-frontend.vercel.app

# Login
Email: admin@climatech.pt
Password: demo123

# Verificar:
- ✅ Dashboard carrega
- ✅ Métricas aparecem
- ✅ Menu lateral funciona
```

#### **12.2 Testar API**
```bash
# Testar autenticação
curl -X POST https://seu-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@climatech.pt","password":"demo123"}'

# Copiar token
TOKEN="eyJhbGc..."

# Testar customers
curl https://seu-backend.railway.app/api/v1/customers \
  -H "Authorization: Bearer $TOKEN"

# Deve retornar lista de customers
```

#### **12.3 Testar WhatsApp**
```bash
# Enviar mensagem de teste via WhatsApp para o teu número
# Verificar se:
- ✅ Mensagem é recebida pelo backend
- ✅ IA processa a mensagem
- ✅ Resposta é enviada de volta
- ✅ Pedido é criado automaticamente
```

#### **12.4 Testar Email**
```bash
# Criar um pedido via frontend
# Verificar se:
- ✅ Email de notificação é enviado
- ✅ Email chega à caixa de entrada
```

---

## 💰 Limites dos Planos Gratuitos

### **Railway**
- ✅ $5 crédito/mês
- ⚠️ ~500 horas de execução
- ⚠️ ~100 GB de bandwidth
- 💡 **Dica:** Suficiente para testes, não para produção

### **Supabase**
- ✅ 500 MB database
- ✅ 5 GB bandwidth/mês
- ⚠️ 2 projetos
- 💡 **Dica:** Suficiente para <10k utilizadores

### **Upstash**
- ✅ 10,000 commands/dia
- ⚠️ 256 MB max database size
- 💡 **Dica:** Suficiente para testes

### **Groq**
- ✅ 14,400 requests/dia
- ⚠️ 30 requests/min
- 💡 **Dica:** Suficiente para <1000 mensagens/dia

### **Resend**
- ✅ 3,000 emails/mês
- ⚠️ 100 emails/dia
- 💡 **Dica:** Suficiente para testes

### **Meta WhatsApp**
- ✅ 1,000 conversas/mês
- ⚠️ Templates gratuitos limitados
- 💡 **Dica:** Suficiente para <50 clientes/dia

### **Vercel**
- ✅ 100 GB bandwidth/mês
- ✅ 100 GB-hours de execução
- 💡 **Dica:** Suficiente para <10k visitas/mês

---

## 🎯 Quando Começar a Pagar?

### **Indicadores para Upgrade**

#### **Railway ($5 → $20/mês)**
- Quando ultrapassares $5 crédito
- Quando precisares de mais RAM
- Quando precisares de auto-scaling

#### **Supabase ($25/mês)**
- Quando ultrapassares 500 MB
- Quando precisares de >2 projetos
- Quando precisares de backup diário

#### **Upstash ($10/mês)**
- Quando ultrapassares 10k commands/dia
- Quando precisares de >256 MB

#### **Groq ($0.10/1k tokens)**
- Quando ultrapassares 14k requests/dia
- Quando precisares de >30 requests/min

#### **Resend ($20/mês)**
- Quando ultrapassares 3k emails/mês
- Quando precisares de domínios dedicados

#### **Meta WhatsApp ($0.005-0.08/mensagem)**
- Quando ultrapassares 1k conversas/mês
- Quando precisares de templates customizados

---

## 📊 Custos Estimados por Fase

### **Fase 1: MVP (0-10 clientes)**
- **Custo:** €0/mês
- **Stack:** Tudo gratuito
- **Duração:** 1-3 meses

### **Fase 2: Beta (10-50 clientes)**
- **Custo:** €20-50/mês
- **Stack:**
  - Railway: €20/mês
  - Supabase: €0 (ainda grátis)
  - Upstash: €0 (ainda grátis)
  - Groq: €0 (ainda grátis)
  - Resend: €0 (ainda grátis)

### **Fase 3: Produção (50-200 clientes)**
- **Custo:** €100-300/mês
- **Stack:**
  - Railway: €50/mês
  - Supabase: €25/mês
  - Upstash: €10/mês
  - Groq: €50-100/mês
  - Resend: €20/mês
  - Meta: €50-100/mês

### **Fase 4: Escala (200-1000 clientes)**
- **Custo:** €500-2000/mês
- **Stack:**
  - Railway: €200/mês
  - Supabase: €100/mês
  - Upstash: €50/mês
  - Groq: €200-500/mês
  - Resend: €100/mês
  - Meta: €200-500/mês
  - Sentry: €50/mês

---

## 🔧 Troubleshooting

### **Problema: Backend não inicia**
```bash
# Ver logs no Railway
railway logs

# Verificar variáveis de ambiente
railway variables

# Verificar se DATABASE_URL está correto
# Verificar se migrations foram executadas
```

### **Problema: Frontend não carrega**
```bash
# Verificar se VITE_API_URL está correto
# Verificar se backend está acessível
curl https://seu-backend.railway.app/api/v1/health
```

### **Problema: WhatsApp webhook não funciona**
```bash
# Verificar se webhook URL está correta
# Verificar se verify token coincide
# Verificar logs no Railway
railway logs | grep whatsapp
```

### **Problema: Emails não são enviados**
```bash
# Verificar se RESEND_API_KEY está correto
# Verificar se domínio está verificado
# Verificar logs no Railway
railway logs | grep email
```

---

## 📚 Recursos Adicionais

### **Documentação Oficial**
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Upstash Docs](https://upstash.com/docs)
- [Groq Docs](https://console.groq.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Meta WhatsApp Docs](https://developers.facebook.com/docs/whatsapp)

### **Comunidades**
- [Railway Discord](https://discord.gg/railway)
- [Vercel Discord](https://vercel.com/discord)
- [Supabase Discord](https://supabase.com/discord)

---

## ✅ Checklist Final

### **Antes de Deploy**
- [ ] Todas as contas gratuitas criadas
- [ ] Todas as credenciais obtidas
- [ ] Database migrations executadas
- [ ] Seed data carregado
- [ ] Testes locais passam
- [ ] Build local funciona

### **Durante Deploy**
- [ ] Backend deployado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend deployado no Vercel
- [ ] WhatsApp webhook configurado
- [ ] Monitoring configurado

### **Após Deploy**
- [ ] Frontend acessível
- [ ] Backend acessível
- [ ] Login funciona
- [ ] CRUD funciona
- [ ] WhatsApp funciona
- [ ] Emails são enviados
- [ ] Monitoring ativo

---

## 🎉 Conclusão

**Custo Total: €0/mês** ✅

Com esta stack gratuita, podes:
- ✅ Testar o produto em produção
- ✅ Fazer demos para clientes
- ✅ Coletar feedback real
- ✅ Validar o mercado
- ✅ Iterar rapidamente

**Quando começar a pagar?**
- Quando tiveres >10 clientes ativos
- Quando precisares de mais recursos
- Quando gerares receita

**Próximos passos:**
1. Criar contas gratuitas
2. Configurar serviços
3. Deploy backend
4. Deploy frontend
5. Testar sistema completo
6. Fazer demo para primeiros clientes

---

**ServiceFlow AI** - Pronto para deploy gratuito! 🚀

**Status:** ✅ **Custo Zero - Pronto para Produção!**
