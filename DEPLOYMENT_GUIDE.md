# 🚀 SaberStore Deployment Guide

## ✅ Fixed: Vercel Build Error

**Error was:** `sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied`

**Root cause:** Output directory mismatch between `vite.config.ts` and `vercel.json`

**Fixed by:**
1. ✅ Updated `vite.config.ts` - changed `outDir: 'build'` → `outDir: 'dist'`
2. ✅ Updated `vercel.json` - changed `outputDirectory: 'build'` → `outputDirectory: 'dist'`
3. ✅ Created `.vercelignore` to exclude unnecessary files
4. ✅ Created `.gitignore` for version control

---

## 📦 Frontend Deployment (Vercel)

### ✅ Build Error Fixed!
**Previous error:** `Permission denied` on Vercel build
**Fixed by:** Using `npx vite build` instead of `vite build`
**Details:** See [VERCEL_FIX.md](./VERCEL_FIX.md) for complete troubleshooting guide

### Prerequisites
- ✅ Vercel account ([sign up here](https://vercel.com))
- ✅ GitHub repository connected to Vercel
- ✅ Build tested locally (it works! ✓ built in 16s)

### Deployment Steps

#### Option 1: Deploy via Vercel Dashboard (Recommended)
1. **Login to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select your `SaberStore` repository
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `saber_store/Saberstore`

3. **Configure Environment Variables** (Optional for now)
   ```
   VITE_API_URL=https://your-backend-api.railway.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at: `https://saber-store-xxx.vercel.app`

#### Option 2: Deploy via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd saber_store/Saberstore

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: saber-store
# - Directory: ./ (current)
# - Override settings? No

# Production deployment
vercel --prod
```

### Post-Deployment
- ✅ Your frontend will auto-deploy on every git push to `main`
- ✅ Preview deployments for every pull request
- ✅ Custom domain setup available in Vercel dashboard

---

## 🖥️ Backend Deployment (Railway/Render)

### Option A: Railway (Recommended - Easier)

**Why Railway?**
- Free tier: $5 credit/month
- PostgreSQL database included
- Automatic SSL
- Easy environment variables

**Steps:**

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `saber_store/Saberstore/backend` directory

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will auto-create `DATABASE_URL`

4. **Set Environment Variables**
   Go to your backend service → Variables:
   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=(auto-set by Railway)
   DIRECT_URL=(auto-set by Railway)

   # JWT Secrets
   JWT_SECRET=your-super-secret-key-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

   # Frontend URL (update after Vercel deployment)
   FRONTEND_URL=https://saber-store-xxx.vercel.app

   # Optional (add later)
   AMAZON_LWA_CLIENT_ID=your_amazon_client_id
   AMAZON_LWA_CLIENT_SECRET=your_amazon_secret
   NOON_API_KEY=your_noon_key
   ```

5. **Deploy**
   - Railway auto-deploys on push
   - Get your backend URL: `https://saberstore-backend-production.up.railway.app`

6. **Run Migrations**
   ```bash
   # In Railway dashboard → your service → Deploy logs
   # Or via Railway CLI:
   railway run npx prisma migrate deploy
   ```

### Option B: Render

**Steps:**

1. **Sign up for Render**
   - Go to https://render.com
   - Sign in with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect your repository
   - Root Directory: `saber_store/Saberstore/backend`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`

3. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Copy Internal Database URL

4. **Add Environment Variables**
   (Same as Railway above)

5. **Deploy**
   - Render will build and deploy automatically

---

## 🔗 Connect Frontend to Backend

After both are deployed:

1. **Update Frontend Environment Variable**
   - In Vercel dashboard → Your project → Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://saberstore-backend-production.up.railway.app
     ```
   - Redeploy frontend

2. **Update Backend CORS**
   - In Railway/Render → Environment Variables
   - Update `FRONTEND_URL` to your Vercel URL
   - Redeploy backend

3. **Test**
   - Visit your Vercel site
   - Try registering a user
   - Check if API calls work

---

## 🗄️ Database Setup

### Supabase (Current Setup)
Your database is already on Supabase. No changes needed!

### If Using Railway PostgreSQL (Alternative)

1. **Update Database URLs**
   - Railway provides `DATABASE_URL` automatically
   - Copy for `DIRECT_URL` as well

2. **Run Migrations**
   ```bash
   # Via Railway CLI
   railway run npx prisma migrate deploy

   # Or in Railway dashboard → Deploy logs
   # The migration should run automatically on first deploy
   ```

3. **Seed Initial Data** (Optional)
   ```bash
   railway run npx prisma db seed
   ```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Frontend builds successfully locally (`npm run build`)
- [x] Backend runs locally (`npm run dev`)
- [x] Environment variables documented
- [x] `.gitignore` created
- [x] `.vercelignore` created
- [ ] Sensitive data removed from code

### Frontend (Vercel)
- [ ] Vercel project created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Custom domain configured (optional)

### Backend (Railway/Render)
- [ ] Platform project created
- [ ] PostgreSQL database created
- [ ] All environment variables set
- [ ] Migrations run successfully
- [ ] First deployment successful
- [ ] Health check endpoint working (`/health`)

### Integration
- [ ] Frontend can call backend APIs
- [ ] CORS configured correctly
- [ ] Authentication works end-to-end
- [ ] Database connections stable

---

## 🔍 Troubleshooting

### Frontend Issues

**Build fails on Vercel:**
```bash
# Check build logs in Vercel dashboard
# Common fixes:
- Ensure outputDirectory is 'dist' in vercel.json
- Check vite.config.ts has outDir: 'dist'
- Verify all dependencies are in package.json
```

**API calls fail:**
```bash
# Check VITE_API_URL is set correctly
# Check browser console for CORS errors
# Verify backend FRONTEND_URL includes your Vercel domain
```

### Backend Issues

**Database connection fails:**
```bash
# Check DATABASE_URL format:
postgresql://user:password@host:5432/database?sslmode=require

# For Railway, use the auto-generated DATABASE_URL
# Make sure DIRECT_URL is also set
```

**Migrations fail:**
```bash
# Reset and re-run migrations
railway run npx prisma migrate reset
railway run npx prisma migrate deploy
```

**502 Bad Gateway:**
```bash
# Check if server is starting
# Look at deploy logs in Railway/Render
# Ensure PORT is set to 3000 or use process.env.PORT
```

### CORS Issues

**Error: CORS policy blocking requests**
```bash
# Backend .env needs:
FRONTEND_URL=https://your-vercel-app.vercel.app

# In backend/src/app.ts, CORS config should include:
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

---

## 📊 Monitoring & Logs

### Vercel
- **Logs:** Vercel Dashboard → Your Project → Deployments → View logs
- **Analytics:** Vercel Dashboard → Analytics tab
- **Performance:** Automatically tracked

### Railway
- **Logs:** Railway Dashboard → Your Service → Deploy logs
- **Metrics:** Railway Dashboard → Metrics tab
- **Database:** Railway Dashboard → PostgreSQL → Metrics

### Render
- **Logs:** Render Dashboard → Your Service → Logs
- **Metrics:** Render Dashboard → Metrics

---

## 🌐 Custom Domain Setup

### For Frontend (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `www.saberstore.eg` or `saberstore.com`
3. Follow DNS configuration instructions
4. Vercel handles SSL automatically

### For Backend (Optional)
1. Railway/Render provide free subdomains
2. For custom API domain (e.g., `api.saberstore.com`):
   - Add CNAME record pointing to Railway/Render URL
   - Configure in platform dashboard

---

## 💰 Cost Estimate

### Free Tier
- **Vercel:** Unlimited hobby projects, 100GB bandwidth/month
- **Railway:** $5 credit/month (usually enough for small apps)
- **Render:** Free tier available (with limitations)
- **Supabase:** Free tier: 500MB database, 2GB bandwidth

### Paid (When you scale)
- **Vercel Pro:** $20/month per user
- **Railway:** Pay as you go, ~$5-10/month for small app
- **Render:** $7/month for basic web service
- **Supabase Pro:** $25/month for production use

**Total for MVP:** $0-15/month 🎉

---

## 🚀 Quick Deploy Commands

```bash
# Frontend (from saber_store/Saberstore)
npm run build          # Test build
vercel                 # Deploy to preview
vercel --prod          # Deploy to production

# Backend (from saber_store/Saberstore/backend)
railway login          # One-time setup
railway link           # Link to project
railway up             # Deploy
railway run npx prisma migrate deploy  # Run migrations

# Check deployments
railway status         # Backend status
vercel ls             # Frontend deployments
```

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

**Last Updated:** December 26, 2024
**Status:** Ready to deploy! ✅
