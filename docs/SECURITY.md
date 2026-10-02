# 🔒 Security Guide - ServiceFlow AI

## Overview

This document outlines the security measures implemented in ServiceFlow AI to protect sensitive data, API keys, and credentials.

## 🛡️ What's Protected

### 1. Environment Variables & Secrets

**Protected Files:**
- `.env` - Main environment file
- `.env.local` - Local development
- `.env.production` - Production secrets
- `apps/api/.env*` - Backend environment files
- Any file containing API keys, tokens, or credentials

**What's in these files:**
- Database connection strings
- JWT secrets
- API keys (Groq, OpenAI, WhatsApp, etc.)
- Service account credentials
- Webhook secrets
- Third-party service tokens

### 2. Cryptographic Keys & Certificates

**Protected Files:**
- `*.pem` - PEM certificates
- `*.key` - Private keys
- `*.cert`, `*.crt` - Certificates
- `*.p12`, `*.pfx` - PKCS#12 files
- `*.jks`, `*.keystore` - Java keystores
- `id_rsa`, `id_ed25519` - SSH keys
- `*.private_key`, `*.privatekey` - Generic private keys

### 3. Service Account Credentials

**Protected Files:**
- `*-credentials.json` - Generic credentials
- `*-service-account.json` - GCP service accounts
- `firebase-service-account.json` - Firebase
- `google-credentials.json` - Google Cloud
- `aws-credentials.json` - AWS

### 4. Database Files

**Protected Files:**
- `*.db`, `*.sqlite`, `*.sqlite3` - Database files
- `apps/api/prisma/*.db` - Prisma databases
- `dump.rdb`, `appendonly.aof` - Redis dumps

### 5. Uploads & User Data

**Protected Directories:**
- `uploads/` - User uploads
- `public/uploads/` - Public uploads
- `tmp/`, `temp/` - Temporary files

### 6. Logs & Debug Info

**Protected Files:**
- `logs/` - Log directory
- `*.log` - Log files
- `npm-debug.log*` - npm debug logs
- `coverage/` - Test coverage

### 7. Build Outputs

**Protected Directories:**
- `dist/`, `build/` - Build outputs
- `.next/`, `.nuxt/` - Framework outputs
- `node_modules/` - Dependencies

## 🔐 Best Practices

### For Developers

1. **Never commit `.env` files**
   ```bash
   # ❌ BAD
   git add .env
   
   # ✅ GOOD
   git add .env.example
   ```

2. **Use `.env.example` as template**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Rotate secrets regularly**
   - API keys: Every 90 days
   - JWT secret: Every 6 months
   - Database passwords: Every 90 days

4. **Use strong secrets**
   ```bash
   # Generate strong JWT secret
   openssl rand -base64 32
   
   # Generate strong webhook secret
   openssl rand -hex 32
   ```

5. **Never log sensitive data**
   ```typescript
   // ❌ BAD
   console.log('API Key:', process.env.OPENAI_API_KEY);
   
   // ✅ GOOD
   console.log('API Key:', process.env.OPENAI_API_KEY?.substring(0, 8) + '...');
   ```

### For Production

1. **Use environment variables in deployment**
   - Vercel: Environment Variables section
   - Railway: Variables section
   - Docker: `docker run -e VAR=value`

2. **Never hardcode secrets**
   ```typescript
   // ❌ BAD
   const apiKey = "sk-1234567890abcdef";
   
   // ✅ GOOD
   const apiKey = process.env.OPENAI_API_KEY;
   ```

3. **Use secret managers**
   - AWS Secrets Manager
   - Google Secret Manager
   - Azure Key Vault
   - Vercel Environment Variables

4. **Enable audit logging**
   - Track who accessed what
   - Monitor for suspicious activity
   - Keep logs for compliance

## 🚨 What to Do If Secrets Are Leaked

### Immediate Actions

1. **Revoke the compromised secret**
   - Go to the service provider
   - Generate new API key/token
   - Update in all environments

2. **Check for unauthorized access**
   - Review audit logs
   - Check for unusual activity
   - Verify no data was exfiltrated

3. **Update the secret**
   ```bash
   # Update .env.local
   OPENAI_API_KEY="new-key-here"
   
   # Update production environment
   # (via Vercel/Railway dashboard)
   ```

4. **Notify affected parties**
   - If customer data was exposed
   - Follow GDPR/data protection laws
   - Document the incident

### Prevention

1. **Use pre-commit hooks**
   ```bash
   # Install husky
   npm install -D husky
   
   # Add pre-commit hook to check for secrets
   npx husky add .husky/pre-commit "npm run check-secrets"
   ```

2. **Use secret scanning tools**
   - GitGuardian
   - TruffleHog
   - detect-secrets

3. **Regular security audits**
   - Review `.gitignore` coverage
   - Check for hardcoded secrets
   - Verify access controls

## 📋 Security Checklist

### Before Committing

- [ ] No `.env` files with real values
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No private keys committed
- [ ] No database credentials in code
- [ ] `.gitignore` is up to date

### Before Deploying

- [ ] Environment variables set in production
- [ ] Secrets rotated from development
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Audit logging enabled

### Ongoing

- [ ] Regular secret rotation
- [ ] Monitor for unauthorized access
- [ ] Keep dependencies updated
- [ ] Review audit logs
- [ ] Test backup/restore procedures

## 🔍 What's in `.gitignore`

The `.gitignore` file protects:

### Critical (Never Commit)
- ✅ All `.env*` files (except `.env.example`)
- ✅ Private keys (`*.pem`, `*.key`, etc.)
- ✅ Service account credentials
- ✅ Database files
- ✅ SSH keys
- ✅ Certificates

### Important (Usually Don't Commit)
- ✅ `node_modules/`
- ✅ `dist/`, `build/`
- ✅ Logs
- ✅ Coverage reports
- ✅ Uploads

### Optional (Depends on Project)
- ✅ IDE files (`.vscode/`, `.idea/`)
- ✅ OS files (`.DS_Store`, `Thumbs.db`)
- ✅ Package manager files

## 📚 Additional Resources

- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitGuardian - What is a Git Leak?](https://blog.gitguardian.com/what-are-git-leaks/)
- [12 Factor App - Config](https://12factor.net/config)
- [GitHub - Keeping secrets secret](https://docs.github.com/en/code-security/secret-security/about-secret-scanning)

## 🆘 Getting Help

If you suspect a security breach:

1. **Immediate**: Revoke compromised secrets
2. **Assess**: Check audit logs for unauthorized access
3. **Document**: Record what happened
4. **Notify**: Inform relevant parties if data was exposed
5. **Prevent**: Update security measures

Contact: security@serviceflow.ai (example)

---

**Last Updated**: 2024
**Maintained By**: ServiceFlow AI Security Team
