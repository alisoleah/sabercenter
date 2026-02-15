# 🧪 SaberStore API Testing Guide

Complete guide to testing all backend API endpoints.

## 🚀 Prerequisites

1. **Start the backend server:**
```bash
cd backend
npm run dev
```

Server should be running at `http://localhost:3000`

2. **Verify server is running:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "SaberStore API is running",
  "timestamp": "2024-12-24T12:00:00.000Z"
}
```

---

## 🔐 Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ahmed Mohamed",
    "phoneNumber": "01012345678",
    "email": "ahmed@example.com",
    "password": "Test123!",
    "governorate": "Cairo"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "fullName": "Ahmed Mohamed",
      "phoneNumber": "01012345678",
      "email": "ahmed@example.com",
      "governorate": "Cairo",
      "role": "customer",
      "isVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Requirements:**
- `fullName`: Required, string
- `phoneNumber`: Required, Egyptian format (01XXXXXXXXX)
- `password`: Required, min 8 chars, must have uppercase, lowercase, number
- `email`: Optional, valid email format
- `governorate`: Optional, Egyptian governorate

**Common Errors:**
```json
// Invalid phone number
{
  "success": false,
  "message": "Invalid Egyptian phone number. Format: 01XXXXXXXXX"
}

// Weak password
{
  "success": false,
  "message": "Password must be at least 8 characters with uppercase, lowercase, and number"
}

// Phone already exists
{
  "success": false,
  "message": "Phone number already registered"
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "01012345678",
    "password": "Test123!"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "fullName": "Ahmed Mohamed",
      "phoneNumber": "01012345678",
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Common Errors:**
```json
// Invalid credentials
{
  "success": false,
  "message": "Invalid phone number or password"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Request (requires authentication):**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "fullName": "Ahmed Mohamed",
    "phoneNumber": "01012345678",
    "email": "ahmed@example.com",
    "role": "customer",
    "profile": {
      "nationalId": "29501011234567",
      "employer": "Vodafone Egypt",
      "monthlySalary": 12000,
      "kycStatus": "approved"
    },
    "creditLimit": {
      "limitAmount": 100000,
      "availableCredit": 100000
    }
  }
}
```

**Common Errors:**
```json
// No token provided
{
  "success": false,
  "message": "No token provided"
}

// Invalid/expired token
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### 4. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 📦 Products Endpoints

### 5. Get All Products

**Endpoint:** `GET /api/products`

**Request (with filters):**
```bash
# Basic request
curl http://localhost:3000/api/products

# With filters
curl "http://localhost:3000/api/products?categoryId=uuid&brand=Samsung&minPrice=5000&maxPrice=15000&search=phone&inStock=true&page=1&limit=20"
```

**Query Parameters:**
- `categoryId` (optional): Filter by category UUID
- `brand` (optional): Filter by brand name (case-insensitive)
- `minPrice` (optional): Minimum price in EGP
- `maxPrice` (optional): Maximum price in EGP
- `search` (optional): Search in product name and brand
- `inStock` (optional): Only show in-stock products (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid-here",
        "name": "Samsung Galaxy S23",
        "brand": "Samsung",
        "cashPrice": 25000,
        "stockQty": 15,
        "category": {
          "id": "uuid",
          "name": "Smartphones"
        },
        "rating": 4.5,
        "badges": ["Featured", "Best Seller"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### 6. Get Single Product

**Endpoint:** `GET /api/products/:id`

**Request:**
```bash
curl http://localhost:3000/api/products/PRODUCT_UUID_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Samsung Galaxy S23",
    "brand": "Samsung",
    "cashPrice": 25000,
    "stockQty": 15,
    "description": "Latest flagship smartphone...",
    "specs": {
      "storage": "256GB",
      "ram": "8GB",
      "screen": "6.1 inch"
    },
    "category": {
      "id": "uuid",
      "name": "Smartphones"
    },
    "marketplaceListings": [
      {
        "channel": {
          "name": "Amazon Egypt",
          "platform": "amazon"
        },
        "sku": "AMZ-12345",
        "price": 25500,
        "stock": 5
      }
    ]
  }
}
```

**Common Errors:**
```json
// Product not found
{
  "success": false,
  "message": "Product not found"
}
```

---

### 7. Search Products

**Endpoint:** `GET /api/products/search`

**Request:**
```bash
curl "http://localhost:3000/api/products/search?q=laptop&limit=10"
```

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Max results (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dell XPS 13 Laptop",
      "brand": "Dell",
      "cashPrice": 35000,
      "category": {
        "name": "Laptops"
      }
    }
  ]
}
```

---

### 8. Get Products by Budget

**Endpoint:** `GET /api/products/budget/:monthlyBudget`

**Request:**
```bash
# Find products affordable with 500 EGP/month over 24 months
curl "http://localhost:3000/api/products/budget/500?duration=24&limit=20"
```

**Path Parameters:**
- `monthlyBudget` (required): Monthly payment amount in EGP

**Query Parameters:**
- `duration` (optional): Installment duration in months (default: 24)
- `limit` (optional): Max results (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "monthlyBudget": 500,
    "durationMonths": 24,
    "maxProductPrice": 12000,
    "products": [
      {
        "id": "uuid",
        "name": "Samsung Galaxy A54",
        "cashPrice": 10000,
        "monthlyInstallment": 416.67
      }
    ]
  }
}
```

**How it works:**
- `maxProductPrice = monthlyBudget × durationMonths`
- Example: 500 EGP/month × 24 months = 12,000 EGP max price
- Returns products with `cashPrice <= 12,000 EGP`

---

### 9. Get All Categories

**Endpoint:** `GET /api/categories`

**Request:**
```bash
curl http://localhost:3000/api/categories
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Smartphones",
      "description": "Latest mobile phones",
      "createdAt": "2024-12-24T12:00:00.000Z"
    },
    {
      "id": "uuid",
      "name": "Laptops",
      "description": "Computers and laptops"
    }
  ]
}
```

---

### 10. Get Category with Products

**Endpoint:** `GET /api/categories/:id`

**Request:**
```bash
curl http://localhost:3000/api/categories/CATEGORY_UUID_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Smartphones",
    "description": "Latest mobile phones",
    "products": [
      {
        "id": "uuid",
        "name": "Samsung Galaxy S23",
        "cashPrice": 25000,
        "stockQty": 15
      }
    ]
  }
}
```

**Note:** Only returns first 20 active, in-stock products.

---

### 11. Get Featured Products

**Endpoint:** `GET /api/products/featured`

**Request:**
```bash
curl "http://localhost:3000/api/products/featured?limit=8"
```

**Query Parameters:**
- `limit` (optional): Max results (default: 8)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "iPhone 15 Pro",
      "brand": "Apple",
      "cashPrice": 45000,
      "rating": 4.8,
      "badges": ["Featured", "Premium"],
      "category": {
        "name": "Smartphones"
      }
    }
  ]
}
```

**Note:** Returns products with "Featured" badge, sorted by rating.

---

## 🧪 Testing Workflow

### Complete Test Flow

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "phoneNumber": "01099999999",
    "password": "Test123!"
  }'

# Save the accessToken from response

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "01099999999",
    "password": "Test123!"
  }'

# 4. Get current user (replace TOKEN)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 5. Get products
curl http://localhost:3000/api/products

# 6. Search products
curl "http://localhost:3000/api/products/search?q=phone"

# 7. Get products by budget
curl http://localhost:3000/api/products/budget/1000
```

---

## 🛠️ Tools for Testing

### Option 1: cURL (Command Line)
- Built into Linux/Mac
- Windows: Install Git Bash or WSL
- Shown in all examples above

### Option 2: Postman
1. Download from https://postman.com
2. Import collection: Create new request for each endpoint
3. Set `Authorization` header: `Bearer YOUR_TOKEN`
4. Save requests for reuse

### Option 3: VS Code REST Client
1. Install "REST Client" extension
2. Create `test.http` file:
```http
### Health check
GET http://localhost:3000/health

### Register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "phoneNumber": "01099999999",
  "password": "Test123!"
}

### Get products
GET http://localhost:3000/api/products?limit=5
```
3. Click "Send Request" above each request

### Option 4: Browser
- Only works for GET requests
- Open browser and visit:
  - `http://localhost:3000/health`
  - `http://localhost:3000/api/products`
  - `http://localhost:3000/api/categories`

---

## 🐛 Common Issues

### "Connection refused"
- Backend server not running
- **Fix:** Run `npm run dev` in backend directory

### "Invalid phone number format"
- Must be Egyptian format: 01XXXXXXXXX
- **Valid:** 01012345678, 01123456789, 01212345678, 01512345678
- **Invalid:** +201012345678, 1012345678, 0100123456

### "No token provided"
- Missing Authorization header
- **Fix:** Add header: `Authorization: Bearer YOUR_TOKEN`

### "Product not found"
- Invalid product UUID
- **Fix:** Get valid UUID from `/api/products` first

---

## 📊 Database Verification

### Check data in Prisma Studio

```bash
cd backend
npm run studio
```

Opens at `http://localhost:5555` - Browse all tables visually.

### Check data in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor"
4. View users, products, categories, etc.

---

**Last Updated:** 2024-12-24
**API Version:** 1.0.0
**Backend Status:** ✅ Ready for testing
