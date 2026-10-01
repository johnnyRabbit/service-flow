#!/usr/bin/env node

/**
 * ServiceFlow AI - Environment Variables Checker
 * 
 * This script verifies that all required environment variables are configured.
 * Run with: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'test'
  ? '.env.test'
  : '.env.local';

const envPath = path.join(__dirname, '..', envFile);

if (!fs.existsSync(envPath)) {
  console.error(`❌ Ficheiro ${envFile} não encontrado!`);
  console.error(`   Copie .env.example para ${envFile} e preencha os valores.`);
  process.exit(1);
}

// Parse .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key && value && !value.startsWith('YOUR-') && !value.startsWith('your-')) {
      envVars[key] = value;
    }
  }
});

// Required variables by category
const required = {
  'Database & Auth': [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  'AI Providers': [
    'GROQ_API_KEY',
    'OPENAI_API_KEY',
  ],
  'WhatsApp': [
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_VERIFY_TOKEN',
  ],
  'Security': [
    'JWT_SECRET',
    'WEBHOOK_SECRET',
  ],
};

// Optional variables
const optional = {
  'Email': ['RESEND_API_KEY'],
  'Monitoring': ['SENTRY_DSN'],
  'Analytics': ['POSTHOG_API_KEY'],
  'Redis': ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
};

console.log('🔍 Verificação de Variáveis de Ambiente\n');
console.log(`📄 Ficheiro: ${envFile}\n`);

let hasErrors = false;

// Check required variables
console.log('📋 Variáveis Obrigatórias:');
for (const [category, vars] of Object.entries(required)) {
  console.log(`\n  ${category}:`);
  vars.forEach(key => {
    if (envVars[key]) {
      const masked = envVars[key].substring(0, 8) + '...';
      console.log(`    ✅ ${key} = ${masked}`);
    } else {
      console.log(`    ❌ ${key} = NÃO CONFIGURADA`);
      hasErrors = true;
    }
  });
}

// Check optional variables
console.log('\n\n📋 Variáveis Opcionais:');
for (const [category, vars] of Object.entries(optional)) {
  console.log(`\n  ${category}:`);
  vars.forEach(key => {
    if (envVars[key]) {
      const masked = envVars[key].substring(0, 8) + '...';
      console.log(`    ✅ ${key} = ${masked}`);
    } else {
      console.log(`    ⚠️  ${key} = não configurada (opcional)`);
    }
  });
}

// Security checks
console.log('\n\n🔒 Verificações de Segurança:');

if (envVars.JWT_SECRET && envVars.JWT_SECRET.length < 32) {
  console.log('    ⚠️  JWT_SECRET deve ter pelo menos 32 caracteres');
} else if (envVars.JWT_SECRET) {
  console.log('    ✅ JWT_SECRET tem comprimento adequado');
}

if (envVars.SUPABASE_SERVICE_ROLE_KEY && envFile !== '.env.production') {
  console.log('    ⚠️  SUPABASE_SERVICE_ROLE_KEY detectada em ambiente de desenvolvimento');
  console.log('       Certifique-se de que não será exposta ao frontend');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ Variáveis obrigatórias em falta!');
  console.log('   Configure-as em', envFile, 'antes de continuar.');
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis obrigatórias estão configuradas!');
  console.log('   Pode iniciar a aplicação com: npm run dev');
}
