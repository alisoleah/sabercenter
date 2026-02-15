# ⚡ Quick Setup Guide - SaberStore

## 🎯 AI Assistant Prompt (Copy This to Antigravity/Claude)

```
I'm continuing the SaberStore project - Egyptian e-commerce platform with installments.

Current Status: Phase 9 Security (67% complete - 4/6 critical fixes done)

Completed:
✅ Rate limiting (8 endpoints protected)
✅ Helmet.js security headers
✅ Input sanitization (XSS + NoSQL injection)
✅ Secrets rotation guide

Next Tasks (CRITICAL):
⏳ Implement token blacklist service with Redis
⏳ Implement CSRF protection

Files to review:
- backend/src/middleware/rateLimiter.middleware.ts
- backend/src/middleware/sanitize.middleware.ts
- backend/src/app.ts
- CURRENT_STATUS.md
- NEXT_STEPS.md
- PHASE_9_SECURITY_AUDIT.md

Please implement the token blacklist service first, then CSRF protection. Update CURRENT_STATUS.md and NEXT_STEPS.md when done.
```

## 🔐 Environment Variables (.env)

```bash
# Database (from Supabase)
DATABASE_URL="postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET="YOUR_64_BYTE_SECRET_HERE"
JWT_REFRESH_SECRET="YOUR_64_BYTE_SECRET_HERE"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Admin
ADMIN_EMAIL="admin@saberstore.eg"
ADMIN_PHONE="01000000000"
ADMIN_PASSWORD="YOUR_STRONG_PASSWORD_12_CHARS"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_KEY="YOUR_32_BYTE_KEY"
ENCRYPTION_IV="YOUR_16_BYTE_IV"
```

## 🚀 Setup Commands

```bash
# 1. Install prerequisites
# Windows: winget install OpenJS.NodeJS.LTS
# macOS: brew install node redis
# Linux: sudo apt install nodejs redis-server

# 2. Clone and setup
git clone YOUR_REPO_URL SaberStore
cd SaberStore/saber_store/Saberstore/backend

# 3. Install dependencies
npm install

# 4. Setup environment
cp .env.example .env
# Edit .env with your values

# 5. Generate secrets
openssl rand -base64 64  # JWT_SECRET
openssl rand -base64 64  # JWT_REFRESH_SECRET
openssl rand -base64 32  # ENCRYPTION_KEY
openssl rand -base64 16  # ENCRYPTION_IV

# 6. Database setup
npx prisma generate
npx prisma migrate dev
npx ts-node src/scripts/create-admin.ts

# 7. Start Redis (if not running)
# WSL: sudo service redis-server start
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server

# 8. Start backend
npm run dev

# 9. Start frontend (in new terminal)
cd ../Saberstore
npm install
echo "VITE_API_URL=http://localhost:3000/api" > .env.local
npm run dev
```

## ✅ Verify Setup

```bash
# Backend health check
curl http://localhost:3000/health

# Redis check
redis-cli ping

# Database check
npx prisma studio
```

## 📋 Next Steps

1. Implement token blacklist service (CRITICAL)
2. Implement CSRF protection (CRITICAL)
3. Update documentation
4. Test security fixes
5. Deploy to production

See DEPLOYMENT_HANDOFF.md for complete details.
