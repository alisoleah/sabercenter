# 🚀 SaberStore Backend API

RESTful API backend for SaberStore Egypt e-commerce platform with multi-channel marketplace integration.

## 🏗️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT
- **Language**: TypeScript

## 📦 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Follow the complete guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md):

1. Create Supabase account
2. Create new project
3. Copy connection strings
4. Configure `.env` file

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Run Migrations

```bash
npm run generate  # Generate Prisma Client
npm run migrate   # Create database tables
npm run seed      # Seed initial data (optional)
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # Prisma client
│   │   └── config.ts           # Environment config
│   ├── controllers/
│   │   ├── auth.controller.ts  # Authentication
│   │   ├── products.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── kyc.controller.ts
│   │   └── admin.controller.ts
│   ├── services/
│   │   ├── auth.service.ts     # Business logic
│   │   ├── sms.service.ts
│   │   ├── payment.service.ts
│   │   ├── amazon.service.ts   # Marketplace integration
│   │   └── noon.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT verification
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   └── admin.routes.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── app.ts                  # Express app
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login
POST   /api/auth/verify-phone   # Send OTP
POST   /api/auth/confirm-otp    # Verify OTP
POST   /api/auth/refresh        # Refresh token
```

### Products
```
GET    /api/products            # List products
GET    /api/products/:id        # Get product
GET    /api/products/search     # Search
GET    /api/categories          # List categories
```

### KYC
```
POST   /api/kyc/submit          # Submit KYC
GET    /api/kyc/status          # Check status
POST   /api/kyc/upload          # Upload documents
```

### Orders
```
POST   /api/orders              # Create order
GET    /api/orders/:id          # Get order
GET    /api/orders/user/:id     # User orders
```

### Admin
```
GET    /api/admin/kyc/pending   # Pending KYC
PUT    /api/admin/kyc/approve   # Approve KYC
PUT    /api/admin/kyc/reject    # Reject KYC
GET    /api/admin/analytics     # Dashboard stats
```

---

## 🗄️ Database Schema

15 tables with full marketplace support:

**Core:**
- users
- profiles
- credit_limits
- categories
- products
- installment_plans

**Orders:**
- orders
- order_items
- installment_contracts
- payment_schedule

**Marketplace:**
- marketplace_channels
- marketplace_listings
- marketplace_orders
- inventory_logs

**Other:**
- store_branches

---

## 🔐 Environment Variables

Required variables in `.env`:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Server
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Optional (add later)
TWILIO_ACCOUNT_SID="..."
AWS_ACCESS_KEY_ID="..."
PAYMOB_API_KEY="..."
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Build for production
npm run start      # Start production server
npm run migrate    # Run database migrations
npm run studio     # Open Prisma Studio (DB GUI)
npm run seed       # Seed database
npm run generate   # Generate Prisma Client
```

### Testing Database

```bash
# Open Prisma Studio
npm run studio

# Or use Supabase Dashboard
# Go to https://supabase.com/dashboard
```

---

## 📊 Database Migrations

### Create Migration

```bash
npx prisma migrate dev --name add_new_feature
```

### Apply to Production

```bash
npx prisma migrate deploy
```

### Reset Database (Development)

```bash
npx prisma migrate reset
```

---

## 🚀 Deployment

### Deploy to Production

1. **Supabase** (Database already hosted)
2. **Backend Options:**
   - Railway.app
   - Render.com
   - DigitalOcean App Platform
   - AWS EC2

### Environment Setup

```bash
# Production
DATABASE_URL="postgresql://..." # Use connection pooling URL
DIRECT_URL="postgresql://..."    # Use direct connection URL
NODE_ENV="production"
```

---

## 🔧 Troubleshooting

### Can't connect to database
- Check Supabase project is active
- Verify connection strings in `.env`
- Ensure database password is correct

### Prisma errors
```bash
npm run generate  # Regenerate Prisma Client
```

### TypeScript errors
```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## 📚 Documentation

- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Complete database setup
- [../MARKETPLACE_INTEGRATION.md](../MARKETPLACE_INTEGRATION.md) - Amazon/Noon integration
- [../NEXT_STEPS.md](../NEXT_STEPS.md) - Implementation roadmap

---

## 👤 Author

**Ali Soleah**
- GitHub: [@alisoleah](https://github.com/alisoleah)
- Email: ali.soleah@gmail.com

---

**Last Updated:** 2024-12-24
**Status:** Phase 6 - Backend Development
