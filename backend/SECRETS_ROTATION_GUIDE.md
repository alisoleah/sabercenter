# 🔐 Secrets Rotation Guide

**CRITICAL:** The current .env file contains exposed credentials that must be rotated immediately.

## Current Exposed Secrets (DO NOT USE IN PRODUCTION)

The following secrets are currently exposed in the codebase:
- Database password: `LW3XAAHNK4L9rmQt`
- JWT secret: `saber-store-egypt-jwt-secret-2024` (WEAK)
- JWT refresh secret: `saber-store-egypt-refresh-secret-2024` (WEAK)
- Admin password: `Admin123!` (WEAK)

## New Secure Secrets Generated

Replace the following in your `.env` file with these newly generated cryptographically secure secrets:

```bash
# JWT AUTHENTICATION - NEW SECURE SECRETS
JWT_SECRET="T9/uDxFiGqgJpD0oIQkVtIT/BR86ACjzfjI88mPzEAxKzhL5qe0iDgV1EXuKBZGbHpP2gKfqrwA2mnixy3d5WA=="
JWT_REFRESH_SECRET="ebz10tPjsd9hZs2s7gFkSO19B6A/mHUFYS4IM/hMJaWFi0uq60sxJn0MWkT4EQMUMFJfH3TnK1WienQqsmKV1Q=="

# ENCRYPTION - NEW KEYS FOR PII DATA
ENCRYPTION_KEY="xZCcJ6eSZlnEq1K0xaY9vx1JWWpqPglWZhbdCCFfo9k="
ENCRYPTION_IV="kx7BTy4Kc+lwVzX5pZjbAQ=="
```

## Step-by-Step Rotation Process

### 1. Backup Current Database (CRITICAL)

```bash
# Export current data before rotation
pg_dump $DATABASE_URL > backup_before_rotation_$(date +%Y%m%d).sql
```

### 2. Rotate Database Password in Supabase

1. Go to Supabase Dashboard
2. Navigate to: Project Settings > Database > Reset Database Password
3. Generate new strong password (20+ characters)
4. Update DATABASE_URL and DIRECT_URL in .env with new password

### 3. Update .env File

```bash
# Backup current .env
cp .env .env.backup.$(date +%Y%m%d)

# Edit .env and replace:
# - DATABASE_URL password
# - JWT_SECRET (use generated value above)
# - JWT_REFRESH_SECRET (use generated value above)
# - ENCRYPTION_KEY (use generated value above)
# - ENCRYPTION_IV (use generated value above)
# - ADMIN_PASSWORD (create strong password with 12+ chars, uppercase, lowercase, number, symbol)
```

### 4. Update Admin Password

The current admin password `Admin123!` is too weak. Generate a strong password:

```bash
# Generate strong admin password (example)
openssl rand -base64 20
# Example output: K9mP2xN7vQ8zL4wR5tY6uI0o

# Hash it before storing (will be done automatically by registration endpoint)
```

**Recommended format:** 
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Example: `Sb$2024!Admin#Secure`

### 5. Invalidate All Existing JWT Tokens

After rotating JWT secrets, all existing tokens will become invalid automatically. Users will need to re-login.

**IMPORTANT:** Schedule this during low-traffic hours and notify users in advance.

### 6. Update Production Environment Variables

If deploying to cloud platforms:

**Vercel/Netlify:**
```bash
# Set environment variables in dashboard
# Or via CLI:
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production
```

**AWS/Docker:**
```bash
# Use AWS Secrets Manager or Parameter Store
aws secretsmanager create-secret --name saberstore/jwt-secret --secret-string "YOUR_SECRET"
```

**Supabase Edge Functions:**
```bash
# Set secrets via dashboard or CLI
supabase secrets set JWT_SECRET="YOUR_SECRET"
```

### 7. Verify Rotation

```bash
# Test authentication with new secrets
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"01000000000","password":"NEW_ADMIN_PASSWORD"}'

# Should return valid JWT token
```

### 8. Re-encrypt PII Data (If Database Has Existing Data)

If you already have user data with National IDs stored in plaintext, you need to:

1. Create migration script to re-encrypt existing PII
2. Use new ENCRYPTION_KEY to encrypt all nationalId fields
3. Test decryption before deleting plaintext data

**Migration script location:** `backend/src/scripts/migrate-encrypt-pii.ts`

### 9. Monitor for Issues

After rotation, monitor:
- Authentication failures
- Database connection errors
- Decryption errors for PII data
- User login issues

### 10. Document Completion

- [ ] Database password rotated in Supabase
- [ ] JWT_SECRET updated (64-byte secure)
- [ ] JWT_REFRESH_SECRET updated (64-byte secure)
- [ ] ENCRYPTION_KEY set (32-byte)
- [ ] ENCRYPTION_IV set (16-byte)
- [ ] Admin password changed (12+ chars, strong)
- [ ] All production env vars updated
- [ ] All team members notified
- [ ] Existing users re-logged in successfully
- [ ] Old .env.backup deleted after 7 days

## Emergency Rollback Plan

If rotation causes issues:

1. Restore .env from backup:
   ```bash
   cp .env.backup.YYYYMMDD .env
   ```

2. Restart application:
   ```bash
   npm run dev
   ```

3. Investigate issue before re-attempting rotation

## Security Best Practices Going Forward

1. **Never commit .env to git** (already in .gitignore ✅)
2. **Rotate secrets every 90 days** (set calendar reminder)
3. **Use environment variable vault** for production:
   - AWS Secrets Manager
   - Supabase Vault
   - HashiCorp Vault
   - Doppler
   - Infisical

4. **Different secrets per environment:**
   - Development: .env.development
   - Staging: .env.staging
   - Production: Use managed vault (never .env.production in repo)

5. **Audit access to secrets:**
   - Only DevOps/senior engineers should have production secrets
   - Use role-based access control
   - Log all secret retrievals

## Generating Future Secrets

When you need new secrets:

```bash
# JWT secrets (64 bytes)
openssl rand -base64 64

# Encryption keys (32 bytes)
openssl rand -base64 32

# Encryption IV (16 bytes)
openssl rand -base64 16

# Strong passwords (20 characters)
openssl rand -base64 20

# API keys (hex format)
openssl rand -hex 32
```

## Contact

**Security Issues:** security@saberstore.eg  
**Emergency Hotline:** [To be configured]

---

**Last Updated:** January 1, 2026  
**Next Rotation Due:** April 1, 2026 (90 days)
