# 🗄️ Supabase Database Setup Guide

## Step-by-Step Setup

### 1. Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new organization (e.g., "SaberStore Egypt")
5. Create a new project:
   - **Name**: `saberstore-production` (or `saberstore-dev` for testing)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to Egypt (e.g., `Frankfurt (eu-central-1)` or `Mumbai (ap-south-1)`)
   - **Pricing Plan**: Free tier is perfect to start (500 MB database, 2 GB bandwidth)

### 2. Get Database Connection Strings

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **Database** tab
3. Scroll to **Connection string** section
4. You'll see multiple connection strings:

**Connection Pooling (Recommended for production):**
```
postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Direct Connection (Required for migrations):**
```
postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

### 3. Configure Environment Variables

1. Copy `backend/.env.example` to `backend/.env`:

```bash
cd backend
cp .env.example .env
```

2. Edit `.env` and replace:

```env
# Use Connection Pooling URL for application
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Use Direct Connection for migrations
DIRECT_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

**Important Notes:**
- Replace `YOUR_PROJECT_REF` with your actual project reference (e.g., `abcdefghijk`)
- Replace `YOUR_PASSWORD` with the database password you created
- Keep `?pgbouncer=true&connection_limit=1` at the end of DATABASE_URL

### 4. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- Prisma Client & CLI
- Express.js
- Authentication packages (bcryptjs, jsonwebtoken)
- Amazon SP-API SDK
- And all other dependencies

### 5. Run Database Migrations

```bash
# Generate Prisma Client
npm run generate

# Create database tables
npm run migrate

# Give it a name when prompted, e.g., "init"
```

This will:
- ✅ Create all 15 tables in your Supabase database
- ✅ Setup relationships and indexes
- ✅ Generate TypeScript types

### 6. Verify Database in Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor** (table icon in sidebar)
3. You should see all tables:
   - users
   - profiles
   - credit_limits
   - categories
   - products
   - installment_plans
   - orders
   - order_items
   - installment_contracts
   - payment_schedule
   - marketplace_channels
   - marketplace_listings
   - marketplace_orders
   - inventory_logs
   - store_branches

### 7. Seed Initial Data (Optional)

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Mobiles' },
      update: {},
      create: { name: 'Mobiles', icon: '📱', productCount: 0 },
    }),
    prisma.category.upsert({
      where: { name: 'Large Appliances' },
      update: {},
      create: { name: 'Large Appliances', icon: '🏠', productCount: 0 },
    }),
    prisma.category.upsert({
      where: { name: 'Small Appliances' },
      update: {},
      create: { name: 'Small Appliances', icon: '🔌', productCount: 0 },
    }),
    prisma.category.upsert({
      where: { name: 'TVs' },
      update: {},
      create: { name: 'TVs', icon: '📺', productCount: 0 },
    }),
    prisma.category.upsert({
      where: { name: 'Laptops' },
      update: {},
      create: { name: 'Laptops', icon: '💻', productCount: 0 },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create installment plans
  const plans = await Promise.all([
    prisma.installmentPlan.upsert({
      where: { id: 'plan-1' },
      update: {},
      create: {
        id: 'plan-1',
        name: 'Zero Interest - 6 Months',
        durationMonths: 6,
        interestRate: 0,
        minDownPayment: 20,
        isActive: true,
        applicableCategories: ['Mobiles', 'Small Appliances'],
      },
    }),
    prisma.installmentPlan.upsert({
      where: { id: 'plan-2' },
      update: {},
      create: {
        id: 'plan-2',
        name: 'Zero Interest - 12 Months',
        durationMonths: 12,
        interestRate: 0,
        minDownPayment: 15,
        isActive: true,
      },
    }),
    prisma.installmentPlan.upsert({
      where: { id: 'plan-3' },
      update: {},
      create: {
        id: 'plan-3',
        name: 'Low Interest - 18 Months',
        durationMonths: 18,
        interestRate: 15,
        minDownPayment: 12,
        isActive: true,
      },
    }),
    prisma.installmentPlan.upsert({
      where: { id: 'plan-4' },
      update: {},
      create: {
        id: 'plan-4',
        name: 'Standard - 24 Months',
        durationMonths: 24,
        interestRate: 20,
        minDownPayment: 10,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${plans.length} installment plans`);

  // Create store branches
  const branches = await Promise.all([
    prisma.storeBranch.create({
      data: {
        name: 'Nasr City Branch',
        city: 'Cairo',
        address: '15 Mostafa El-Nahas St, Nasr City, Cairo',
        phone: '0222747000',
        workingHours: 'Sat-Thu: 10:00 AM - 10:00 PM, Fri: 2:00 PM - 10:00 PM',
        latitude: 30.0444,
        longitude: 31.3585,
        hasStock: true,
      },
    }),
    prisma.storeBranch.create({
      data: {
        name: '6th October Branch',
        city: 'Giza',
        address: 'Mall of Arabia, 6th October City, Giza',
        phone: '0238371100',
        workingHours: 'Daily: 10:00 AM - 12:00 AM',
        latitude: 29.9772,
        longitude: 30.9318,
        hasStock: true,
      },
    }),
    prisma.storeBranch.create({
      data: {
        name: 'Alexandria Branch',
        city: 'Alexandria',
        address: 'Alexandria City Center, Smouha, Alexandria',
        phone: '0334281100',
        workingHours: 'Daily: 10:00 AM - 11:00 PM',
        latitude: 31.2156,
        longitude: 29.9553,
        hasStock: true,
      },
    }),
  ]);

  console.log(`✅ Created ${branches.length} store branches`);

  // Create marketplace channels
  const channels = await Promise.all([
    prisma.marketplaceChannel.create({
      data: {
        name: 'SaberStore',
        code: 'saberstore',
        isActive: true,
      },
    }),
    prisma.marketplaceChannel.create({
      data: {
        name: 'Amazon Egypt',
        code: 'amazon',
        isActive: false, // Activate when API credentials are added
      },
    }),
    prisma.marketplaceChannel.create({
      data: {
        name: 'Noon',
        code: 'noon',
        isActive: false, // Activate when API credentials are added
      },
    }),
  ]);

  console.log(`✅ Created ${channels.length} marketplace channels`);

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '01000000000' },
    update: {},
    create: {
      fullName: 'Admin User',
      phoneNumber: '01000000000',
      email: 'admin@saberstore.eg',
      passwordHash: adminPassword,
      isVerified: true,
      role: 'admin',
    },
  });

  console.log(`✅ Created admin user (phone: 01000000000, password: Admin123!)`);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed:
```bash
npm run seed
```

### 8. Open Prisma Studio (Database GUI)

```bash
npm run studio
```

This opens a web UI at `http://localhost:5555` where you can:
- ✅ Browse all tables
- ✅ Add/edit/delete records
- ✅ Test relationships
- ✅ Run queries

---

## 🔒 Security Best Practices

### 1. Enable Row Level Security (RLS)

While Prisma handles most security, you can add extra protection in Supabase:

1. Go to **Authentication** > **Policies**
2. Enable RLS on sensitive tables (users, credit_limits, etc.)
3. Create policies (optional, since backend handles auth)

### 2. Backup Strategy

Supabase automatically backs up your database daily on paid plans. For free tier:

1. Go to **Database** > **Backups**
2. Use **Manual Backup** feature
3. Or use Prisma:

```bash
npx prisma db pull
npx prisma migrate dev --create-only
```

### 3. Monitor Database Usage

1. Go to **Database** > **Usage**
2. Monitor:
   - Storage used (Free tier: 500 MB)
   - Egress bandwidth (Free tier: 2 GB/month)
   - Number of connections

---

## 🚀 Start Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

Test connection:
```bash
curl http://localhost:3000/health
```

---

## 📊 Supabase Dashboard Features

### 1. SQL Editor
Write custom SQL queries:
```sql
SELECT * FROM users WHERE role = 'admin';
SELECT COUNT(*) FROM products WHERE stock_qty > 0;
```

### 2. Table Editor
- Visual data editing
- Filter and search
- Export to CSV

### 3. API Docs
- Auto-generated REST API (optional, we use Prisma)
- GraphQL endpoint (optional)

### 4. Logs
- Real-time database logs
- Query performance
- Error tracking

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

1. Check your connection string
2. Verify database password
3. Ensure project is not paused (free tier pauses after 1 week inactivity)
4. Restart project in Supabase Dashboard

### Error: "SSL connection required"

Add `?sslmode=require` to your connection string:
```
DATABASE_URL="postgresql://...?sslmode=require"
```

### Error: "Too many connections"

Use connection pooling URL (port 6543) instead of direct connection (port 5432)

---

## 💰 Pricing & Limits

### Free Tier (Perfect for development)
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth/month
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ⚠️ Pauses after 1 week inactivity

### Pro Tier ($25/month)
- ✅ 8 GB database
- ✅ 50 GB bandwidth
- ✅ 100 GB file storage
- ✅ No pausing
- ✅ Daily backups
- ✅ Point-in-time recovery

---

## 📝 Next Steps

After database is setup:

1. ✅ Test connection: `npm run dev`
2. ✅ Verify tables in Supabase Dashboard
3. ✅ Run seed data: `npm run seed`
4. ✅ Test API endpoints (see `backend/src/routes/`)
5. ✅ Connect frontend to backend

---

**Last Updated:** 2024-12-24
**Maintained by:** alisoleah
