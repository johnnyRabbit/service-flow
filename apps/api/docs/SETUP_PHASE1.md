# 🚀 Fase 1 - Setup Guide

## Overview

Este guia vai ajudá-lo a configurar o backend ServiceFlow AI com todas as integrações reais necessárias para a Fase 1.

## 📋 Pré-requisitos

Antes de começar, certifique-se de que tem:

- ✅ Node.js 18+ instalado
- ✅ PostgreSQL 14+ ou conta Supabase
- ✅ Conta Meta Developer (para WhatsApp)
- ✅ Conta Groq (para IA)
- ✅ Conta Resend (para emails) - opcional
- ✅ Conta Upstash (para Redis) - opcional

## 🔧 Passo 1: Instalar Dependências

```bash
cd apps/api
npm install

# Instalar dependências adicionais necessárias
npm install @nestjs/axios axios groq-sdk
```

## 🗄️ Passo 2: Configurar Database

### Opção A: Supabase (Recomendado)

1. Criar conta em [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Ir a **Settings → Database**
4. Copiar **Connection string** (formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`)

### Opção B: PostgreSQL Local

```bash
# Instalar PostgreSQL
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql

# Criar database
createdb serviceflow
```

### Configurar DATABASE_URL

Editar `apps/api/.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/serviceflow?schema=public"
```

Ou para Supabase:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?schema=public"
```

### Executar Migrations

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# (Opcional) Ver database visualmente
npm run prisma:studio
```

### Seed Database

```bash
npm run prisma:seed
```

Isto vai criar:
- ✅ Organização demo (ClimaTech AVAC)
- ✅ 2 utilizadores (admin + técnico)
- ✅ 2 serviços (reparação AC + manutenção)
- ✅ 2 clientes
- ✅ 1 conversa de exemplo com 5 mensagens
- ✅ 2 regras de automação

## 🤖 Passo 3: Configurar Groq AI

1. Criar conta em [console.groq.com](https://console.groq.com)
2. Ir a **API Keys**
3. Criar nova API key
4. Copiar a key

Editar `apps/api/.env.local`:

```env
GROQ_API_KEY="gsk_YOUR_GROQ_API_KEY"
GROQ_MODEL="llama-3.1-70b-versatile"
```

### Testar Groq

```bash
# Criar ficheiro de teste
cat > test-groq.js << 'EOF'
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function test() {
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: 'Olá, como estás?' }],
    model: 'llama-3.1-70b-versatile',
  });
  
  console.log('✅ Groq response:', completion.choices[0].message.content);
}

test().catch(console.error);
EOF

# Executar teste
GROQ_API_KEY=your_key node test-groq.js
```

## 📱 Passo 4: Configurar WhatsApp Cloud API

### 4.1 Criar Meta App

1. Ir a [developers.facebook.com](https://developers.facebook.com)
2. Clicar em **My Apps → Create App**
3. Escolher **Business** como tipo
4. Preencher detalhes e criar app

### 4.2 Adicionar WhatsApp Product

1. No dashboard da app, clicar em **Add Product**
2. Escolher **WhatsApp**
3. Clicar em **Set Up**

### 4.3 Configurar WhatsApp Business Account

1. Ir a **WhatsApp → API Setup**
2. Selecionar ou criar Business Account
3. Adicionar número de telefone (pode usar número pessoal para testes)
4. Verificar número via SMS/call

### 4.4 Obter Credenciais

1. **Phone Number ID**: Visível na página API Setup
2. **WhatsApp Business Account ID**: Visível na página API Setup
3. **Access Token**: 
   - Ir a **System Users** (Business Settings → Users → System Users)
   - Criar novo system user com **Admin** access
   - Adicionar o app ao system user
   - Gerar token com permissões: `whatsapp_business_messaging`

### 4.5 Configurar Webhook

1. Ir a **WhatsApp → Configuration**
2. Em **Webhook**, clicar em **Edit**
3. Preencher:
   - **Callback URL**: `https://YOUR_DOMAIN/api/v1/webhooks/whatsapp`
   - **Verify token**: Qualquer string (ex: `serviceflow_verify_token_2024`)
4. Clicar em **Verify and Save**
5. Subscrever campos:
   - ✅ `messages`
   - ✅ `message_status`

### 4.6 Atualizar .env.local

```env
WHATSAPP_PHONE_NUMBER_ID="YOUR_PHONE_NUMBER_ID"
WHATSAPP_BUSINESS_ACCOUNT_ID="YOUR_BUSINESS_ACCOUNT_ID"
WHATSAPP_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"
WHATSAPP_VERIFY_TOKEN="serviceflow_verify_token_2024"
WHATSAPP_WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET"
```

### 4.7 Testar WhatsApp

```bash
# Enviar mensagem de teste
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_PHONE_NUMBER",
    "type": "text",
    "text": { "body": "Teste do ServiceFlow AI!" }
  }'
```

## 🔐 Passo 5: Configurar JWT Secret

Gerar um JWT secret forte:

```bash
# macOS/Linux
openssl rand -base64 32

# Ou usar Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Editar `apps/api/.env.local`:

```env
JWT_SECRET="YOUR_GENERATED_SECRET"
```

## 📧 Passo 6: Configurar Resend (Email) - Opcional

1. Criar conta em [resend.com](https://resend.com)
2. Ir a **API Keys**
3. Criar nova API key
4. Verificar domínio (opcional mas recomendado)

Editar `apps/api/.env.local`:

```env
RESEND_API_KEY="re_YOUR_RESEND_API_KEY"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

## 🔴 Passo 7: Configurar Upstash Redis - Opcional

1. Criar conta em [upstash.com](https://upstash.com)
2. Criar nova database Redis
3. Copiar **REST URL** e **REST Token**

Editar `apps/api/.env.local`:

```env
UPSTASH_REDIS_REST_URL="https://YOUR_REDIS.upstash.io"
UPSTASH_REDIS_REST_TOKEN="YOUR_REDIS_TOKEN"
```

## 🚀 Passo 8: Iniciar Servidor

```bash
# Development mode (com hot reload)
npm run start:dev

# Ou production mode
npm run build
npm run start:prod
```

O servidor vai iniciar em `http://localhost:3001`

## ✅ Passo 9: Testar Integração Completa

### 9.1 Testar Auth

```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@climatech.pt","password":"demo123"}'

# Guardar o token retornado
export TOKEN="YOUR_JWT_TOKEN"

# Testar endpoint protegido
curl http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer $TOKEN"
```

### 9.2 Testar WhatsApp Webhook

```bash
# Simular webhook do WhatsApp
curl -X POST http://localhost:3001/api/v1/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "YOUR_PHONE_NUMBER",
            "phone_number_id": "YOUR_PHONE_NUMBER_ID"
          },
          "contacts": [{
            "profile": { "name": "Test Customer" },
            "wa_id": "CUSTOMER_PHONE_NUMBER"
          }],
          "messages": [{
            "from": "CUSTOMER_PHONE_NUMBER",
            "id": "wamid.TEST",
            "timestamp": "1234567890",
            "type": "text",
            "text": { "body": "Olá, o meu ar condicionado não funciona" }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

### 9.3 Verificar Logs

```bash
# Ver logs do servidor
# Deve mostrar:
# ✅ Message processed in Xms
# ✅ AI processed message: REQUEST_SERVICE (87% confidence)
# ✅ Created service request: req_XXX
# ✅ Message sent to CUSTOMER_PHONE_NUMBER
```

## 🔍 Troubleshooting

### Erro: "GROQ_API_KEY not configured"
- Verificar se `.env.local` existe em `apps/api/`
- Verificar se `GROQ_API_KEY` está definido
- Reiniciar servidor após alterar `.env`

### Erro: "WhatsApp credentials not configured"
- Verificar se todas as variáveis `WHATSAPP_*` estão definidas
- Verificar se o Access Token é válido (não expirou)
- Verificar se o Phone Number ID está correto

### Erro: "Invalid webhook signature"
- Verificar se `WHATSAPP_WEBHOOK_SECRET` está correto
- Opcional: desativar verificação de signature em desenvolvimento

### Erro: "Database connection failed"
- Verificar se `DATABASE_URL` está correto
- Verificar se PostgreSQL está a correr
- Verificar se as credenciais estão corretas

### Erro: "Cannot find module '@nestjs/axios'"
- Executar `npm install @nestjs/axios axios`
- Reiniciar servidor

## 📚 Próximos Passos

Após completar este setup:

1. ✅ Backend está funcional
2. ✅ WhatsApp recebe e envia mensagens
3. ✅ IA processa mensagens com Groq
4. ✅ Database tem dados de exemplo
5. ✅ Auth funciona com JWT

**Próximo:** Implementar testes automatizados (Fase 1 - Semana 3)

## 🆘 Suporte

Se encontrar problemas:

1. Verificar logs do servidor (`npm run start:dev`)
2. Verificar logs do database (`npm run prisma:studio`)
3. Verificar documentação oficial:
   - [NestJS Docs](https://docs.nestjs.com)
   - [Prisma Docs](https://www.prisma.io/docs)
   - [Groq Docs](https://console.groq.com/docs)
   - [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

**ServiceFlow AI** - Fase 1 Setup Complete! 🎉
