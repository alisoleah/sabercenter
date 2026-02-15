# 🚀 SaberStore Deployment Handoff Guide

## 📋 Table of Contents
1. [Quick Start Summary](#quick-start-summary)
2. [Environment Setup](#environment-setup)
3. [Prompt for AI Assistant](#prompt-for-ai-assistant)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Security Checklist](#security-checklist)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start Summary

**Project**: SaberStore - Egyptian E-commerce Platform with Installments
**Status**: Phase 9 Security Hardening (67% complete - 4/6 critical fixes done)
**Tech Stack**:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript + Prisma ORM
- Database: PostgreSQL (Supabase)
- Cache/Sessions: Redis (for rate limiting & token blacklist)

**Latest Work Completed**:
- ✅ Rate limiting on all endpoints (brute force prevention)
- ✅ Helmet.js security headers (CSP, HSTS, X-Frame-Options)
- ✅ Input sanitization (XSS + NoSQL injection prevention)
- ✅ Secrets rotation guide created
- ⏳ Token blacklist service (NEXT - CRITICAL)
- ⏳ CSRF protection (NEXT - CRITICAL)

**Production Status**: 🔴 BLOCKED - 2 critical security issues remaining

---

## 🔐 Environment Setup

### Required Environment Variables (.env)

Create a `.env` file in the `backend/` directory with these variables:

```bash
# SUPABASE DATABASE
# Get from: Supabase Dashboard > Project Settings > Database > Connection String
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

# JWT AUTHENTICATION
# Generate with: openssl rand -base64 64
JWT_SECRET="REPLACE_WITH_64_BYTE_SECRET"
JWT_REFRESH_SECRET="REPLACE_WITH_64_BYTE_SECRET"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# SERVER
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# ADMIN CREDENTIALS
ADMIN_EMAIL="admin@saberstore.eg"
ADMIN_PHONE="01000000000"
ADMIN_PASSWORD="STRONG_PASSWORD_12_CHARS_MIN"

# REDIS (For rate limiting and token blacklist)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# AWS S3 (For file uploads - Optional for development)
AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_KEY"
AWS_REGION="eu-central-1"
AWS_S3_BUCKET="YOUR_BUCKET_NAME"

# ENCRYPTION (For PII data - National ID)
# Generate with: openssl rand -base64 32
ENCRYPTION_KEY="REPLACE_WITH_32_BYTE_KEY"
ENCRYPTION_IV="REPLACE_WITH_16_BYTE_IV"

# SECURITY
FORCE_HTTPS="false"
ENABLE_CSRF="true"
COOKIE_SECURE="false"
COOKIE_SAME_SITE="lax"

# LOGGING
LOG_LEVEL="info"
LOG_FILE_PATH="./logs"
```

### How to Generate Secure Secrets

Run these commands on the new machine:

```bash
# JWT Secret (64 bytes)
openssl rand -base64 64

# JWT Refresh Secret (64 bytes)
openssl rand -base64 64

# Encryption Key (32 bytes)
openssl rand -base64 32

# Encryption IV (16 bytes)
openssl rand -base64 16

# Strong Admin Password (20 characters)
openssl rand -base64 20
```

---

## 🤖 Prompt for AI Assistant (Antigravity/Claude)

Copy and paste this prompt to continue the work:

```
I'm continuing work on the SaberStore project - an Egyptian e-commerce platform with installment payment system. The project is currently in Phase 9: Security Hardening.

PROJECT CONTEXT:
- Tech Stack: React + TypeScript + Vite (Frontend), Node.js + Express + Prisma (Backend), PostgreSQL (Supabase), Redis
- Repository: SaberStore multi-phase e-commerce application
- Current Phase: Phase 9 - Security Audit & Hardening (67% complete)

WORK COMPLETED (Week 1 - Days 1-6):
✅ 1. Secrets rotation guide created (SECRETS_ROTATION_GUIDE.md)
✅ 2. Rate limiting implemented on 8 endpoints (auth, registration, OTP, API global, etc.)
✅ 3. Helmet.js security headers configured (CSP, HSTS, X-Frame-Options, noSniff)
✅ 4. Input sanitization middleware created (XSS + NoSQL injection prevention)

Files created:
- backend/src/middleware/rateLimiter.middleware.ts
- backend/src/middleware/sanitize.middleware.ts
- backend/.env.example
- backend/SECRETS_ROTATION_GUIDE.md

CRITICAL TASKS REMAINING (Week 2 - Days 7-8):
⏳ 5. Token Blacklist Service - Implement JWT revocation with Redis
   - Create backend/src/services/tokenBlacklist.service.ts
   - Update backend/src/controllers/auth.controller.ts logout method to blacklist tokens
   - Add blacklist check to backend/src/middleware/auth.middleware.ts
   - Required packages: ioredis (already installed)

⏳ 6. CSRF Protection - Implement CSRF token validation
   - Install csurf and cookie-parser: npm install csurf cookie-parser
   - Create backend/src/middleware/csrf.middleware.ts
   - Add CSRF token endpoint: GET /api/csrf-token
   - Update frontend to include CSRF tokens in all POST/PUT/DELETE requests

HIGH PRIORITY TASKS (Week 2 - Days 9-11):
- Create Zod validation schemas for all endpoints
- Fix S3 file upload security (private ACL + signed URLs)
- Implement PII encryption (AES-256 for National ID)
- Enhance password validation (12+ characters)

IMPORTANT FILES TO REVIEW:
- backend/src/middleware/rateLimiter.middleware.ts - Rate limiting implementation
- backend/src/middleware/sanitize.middleware.ts - Input sanitization
- backend/src/app.ts - Main app with security middleware
- backend/SECRETS_ROTATION_GUIDE.md - Secret rotation instructions
- CURRENT_STATUS.md - Detailed project status
- NEXT_STEPS.md - Implementation roadmap
- PHASE_9_SECURITY_AUDIT.md - Complete security audit findings

PRODUCTION BLOCKER:
The application cannot be deployed to production until all 6 critical vulnerabilities are fixed. Currently 4/6 are complete.

IMMEDIATE NEXT STEPS:
1. Verify environment is set up correctly (Node.js, Redis, PostgreSQL)
2. Install dependencies: npm install
3. Run database migrations: npx prisma migrate dev
4. Implement token blacklist service (CRITICAL)
5. Implement CSRF protection (CRITICAL)
6. Update CURRENT_STATUS.md and NEXT_STEPS.md with progress

Please help me continue from where we left off. Start by implementing the token blacklist service using Redis.
```

---

## 📦 Step-by-Step Deployment on New Computer

### Step 1: Prerequisites Installation

**On Windows:**
```powershell
# Install Node.js (v18 or higher)
winget install OpenJS.NodeJS.LTS

# Install Git
winget install Git.Git

# Install Redis (using WSL or Docker)
wsl --install
# Then in WSL:
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

**On macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Redis
brew install redis
brew services start redis

# Install Git
brew install git
```

**On Linux (Ubuntu/Debian):**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Redis
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Git
sudo apt install git
```

### Step 2: Clone the Repository

```bash
# Clone the repository
git clone [YOUR_REPOSITORY_URL] SaberStore
cd SaberStore/saber_store/Saberstore

# Checkout the correct branch
git checkout feature/phase6-3747078566971308357
# Or checkout master if merged
```

### Step 3: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env  # or use any text editor
```

**IMPORTANT**: Replace all placeholder values in .env:
- Database credentials from Supabase
- Generate new JWT secrets using openssl commands
- Set strong admin password
- Add Redis connection details
- Add AWS S3 credentials (if using file uploads)

### Step 4: Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Create admin user (if needed)
npx ts-node src/scripts/create-admin.ts
```

### Step 5: Frontend Setup

```bash
# Navigate to frontend
cd ../Saberstore

# Install dependencies
npm install

# Create .env file for frontend
echo "VITE_API_URL=http://localhost:3000/api" > .env.local
```

### Step 6: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should start on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd Saberstore
npm run dev
# Should start on http://localhost:5173
```

**Terminal 3 - Redis:**
```bash
redis-server
# Should start on localhost:6379
```

### Step 7: Verify Installation

```bash
# Check backend health
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","message":"SaberStore API is running","timestamp":"..."}

# Check Redis connection
redis-cli ping
# Expected: PONG

# Check database connection
cd backend
npx prisma studio
# Should open Prisma Studio at http://localhost:5555
```

---

## ✅ Security Checklist Before Production

**Critical Security (Must Fix):**
- [ ] All 6 critical vulnerabilities resolved
  - [x] Secrets rotation guide created
  - [x] Rate limiting implemented
  - [x] Security headers configured
  - [x] Input sanitization active
  - [ ] Token blacklist service
  - [ ] CSRF protection

**Environment:**
- [ ] All secrets rotated from default values
- [ ] Database password changed in Supabase
- [ ] Strong admin password set (12+ characters)
- [ ] Redis password set (if production)
- [ ] FRONTEND_URL updated to production domain
- [ ] NODE_ENV set to "production"

**Infrastructure:**
- [ ] HTTPS enabled
- [ ] Redis configured (managed service for production)
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Environment variables in secure vault

**Testing:**
- [ ] npm audit shows 0 high/critical vulnerabilities
- [ ] Security headers test: https://securityheaders.com
- [ ] Rate limiting tested
- [ ] CSRF protection tested
- [ ] Input sanitization tested

---

## 🔧 Troubleshooting

### Issue: Cannot connect to database

**Solution:**
```bash
# Verify DATABASE_URL is correct
npx prisma db push

# Check Supabase dashboard for connection pooler status
```

### Issue: Redis connection failed

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not running:
# Windows (WSL): sudo service redis-server start
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue: Prisma Client not generated

**Solution:**
```bash
cd backend
npx prisma generate
npm run dev
```

---

## 📚 Additional Resources

**Documentation:**
- See PHASE_9_SECURITY_AUDIT.md for complete security implementation details
- See CURRENT_STATUS.md for current project status
- See NEXT_STEPS.md for implementation roadmap
- See SECRETS_ROTATION_GUIDE.md for credential rotation

**Security Standards:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Security Headers: https://securityheaders.com

---

**Last Updated**: January 2026
**Phase**: 9 (Security Hardening)
**Status**: 67% Complete (4/6 Critical Fixed)
**Next Critical Task**: Token Blacklist Service
