# SaberStore Database Schema Documentation

> **Database**: PostgreSQL (Supabase)  
> **ORM**: Prisma  
> **Total Tables**: 15  
> **Last Updated**: 2026-02-01

---

## Table of Contents
1. [User Management](#user-management) (3 tables)
2. [Product Catalog](#product-catalog) (2 tables)
3. [Installment Plans](#installment-plans) (1 table)
4. [Orders & Transactions](#orders--transactions) (4 tables)
5. [Marketplace Integration](#marketplace-integration) (4 tables)
6. [Store Operations](#store-operations) (1 table)
7. [ER Diagram](#er-diagram)

---

## 1. User Management

### 1.1 `users` - Core User Accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `full_name` | VARCHAR | NOT NULL | User's full name |
| `phone_number` | VARCHAR(11) | UNIQUE, NOT NULL | Egyptian phone (01XXXXXXXXX) |
| `email` | VARCHAR | UNIQUE, NULLABLE | User email address |
| `password_hash` | VARCHAR | NOT NULL | Bcrypt hashed password |
| `is_verified` | BOOLEAN | DEFAULT false | KYC approval status |
| `governorate` | VARCHAR | NULLABLE | Cairo, Giza, Alexandria, etc. |
| `role` | VARCHAR | DEFAULT 'customer' | customer / admin / credit_officer |
| `created_at` | TIMESTAMP | DEFAULT now() | Account creation date |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Last modification |

**Relationships**:
- Has one `Profile`
- Has one `CreditLimit`
- Has many `Orders`
- Has many `InstallmentContracts`

---

### 1.2 `profiles` - KYC/Credit Applications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Profile ID |
| `user_id` | UUID | FOREIGN KEY, UNIQUE | Links to users.id |
| `national_id` | VARCHAR | UNIQUE, ENCRYPTED | 14-digit Egyptian National ID |
| `scanned_id_url` | VARCHAR | NULLABLE | Uploaded ID image path |
| `utility_bill_url` | VARCHAR | NULLABLE | Uploaded bill image path |
| `monthly_salary` | DECIMAL(10,2) | NOT NULL | Monthly income in EGP |
| `employer` | VARCHAR | NOT NULL | Company name |
| `address` | TEXT | NULLABLE | Full address |
| `kyc_status` | VARCHAR | DEFAULT 'Pending' | Pending / Approved / Rejected |
| `kyc_submitted_at` | TIMESTAMP | NULLABLE | Submission date |
| `kyc_approved_at` | TIMESTAMP | NULLABLE | Approval date |
| `approved_by` | UUID | NULLABLE | Admin user ID |
| `rejection_reason` | TEXT | NULLABLE | Reason for rejection |

**Encryption**: `national_id` is encrypted using AES-256 (via `src/utils/encryption.ts`)

---

### 1.3 `credit_limits` - User Credit Lines

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Credit limit ID |
| `user_id` | UUID | FOREIGN KEY, UNIQUE | Links to users.id |
| `total_limit` | DECIMAL(10,2) | NOT NULL | Maximum credit allowed |
| `current_balance` | DECIMAL(10,2) | DEFAULT 0 | Current debt |
| `remaining_limit` | DECIMAL(10,2) | NOT NULL | Available credit |
| `status` | VARCHAR | DEFAULT 'Active' | Active / Frozen / Suspended |
| `approved_by` | UUID | NULLABLE | Admin who approved |
| `approved_at` | TIMESTAMP | NULLABLE | Approval timestamp |
| `created_at` | TIMESTAMP | DEFAULT now() | Record creation |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Last update |

**Formula**: `remaining_limit = total_limit - current_balance`

---

## 2. Product Catalog

### 2.1 `categories` - Product Categories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Category ID |
| `name` | VARCHAR | UNIQUE, NOT NULL | Category name |
| `icon` | VARCHAR | NOT NULL | Emoji or icon identifier |
| `product_count` | INTEGER | DEFAULT 0 | Number of products |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation date |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Last update |

**Current Categories**:
1. 🧴 Personal & Health Care
2. 🌸 Perfumes
3. ⌚ Watches
4. 👗 Fashion
5. 🏠 Home Decor (ديكور المنزل)
6. 🍳 Kitchen & Dining (المطبخ والطعام)
7. 📱 Mobile Accessories
8. 🧸 Kids Appliances & Toys
9. 📎 Office Utilities
10. 💻 Electronics

---

### 2.2 `products` - Product Inventory ⭐ ENHANCED

| Column | Type | Constraints | Description | Example |
|--------|------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Product ID | Auto-generated UUID |
| `name` | VARCHAR | NOT NULL | Product display name | "Samsung Galaxy S24 Ultra" |
| `sku` | VARCHAR | UNIQUE, NOT NULL | Stock Keeping Unit | "SAM-S24U-512-BLACK" |
| `cash_price` | DECIMAL(10,2) | NOT NULL | Current price (EGP) | 52999.00 |
| `old_price` | DECIMAL(10,2) | NULLABLE | Original price (for discounts) | 59999.00 |
| `stock_qty` | INTEGER | DEFAULT 50 | Available quantity | 50 |
| `brand` | VARCHAR | NOT NULL | Manufacturer/Brand | "Samsung" |
| `category_id` | UUID | FOREIGN KEY, NOT NULL | Links to categories.id | UUID |
| `warranty` | VARCHAR | NULLABLE | Warranty info | "2 Years International" |
| `rating` | DECIMAL(3,2) | DEFAULT 0 | Average rating (0-5) | 4.75 |
| `review_count` | INTEGER | DEFAULT 0 | Number of reviews | 128 |
| `specs` | JSONB | NULLABLE | Product specifications | See below ⬇️ |
| `badges` | JSONB | NULLABLE | Marketing badges | `["0% Interest", "Free Shipping"]` |
| `image_url` | VARCHAR | NOT NULL | Main image path (legacy) | "/uploads/product-main.jpg" |
| **`images`** ✨ | JSONB | NULLABLE | **Array of image filenames** | `["img1.jpg", "img2.jpg", "img3.jpg"]` |
| **`description`** ✨ | TEXT | NULLABLE | **Detailed product description** | Full HTML or markdown text |
| `is_active` | BOOLEAN | DEFAULT true | Product visibility | true / false |
| `created_at` | TIMESTAMP | DEFAULT now() | Product creation | Auto |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Last modification | Auto |

#### **`specs` JSON Format**:
```json
{
  "Screen Size": "6.8 inches",
  "Processor": "Snapdragon 8 Gen 3",
  "RAM": "12GB",
  "Storage": "512GB",
  "Camera": "200MP Main + 50MP Telephoto",
  "Battery": "5000mAh",
  "Color": "Titanium Black"
}
```

#### **`images` JSON Format** ✨ NEW:
```json
[
  "samsung-s24-ultra-front.jpg",
  "samsung-s24-ultra-back.jpg",
  "samsung-s24-ultra-camera.jpg",
  "samsung-s24-ultra-display.jpg"
]
```

#### **`description` Text Example** ✨ NEW:
```
Experience the ultimate flagship with the Samsung Galaxy S24 Ultra. 
Featuring a stunning 6.8" Dynamic AMOLED display, revolutionary 200MP 
camera system, and all-day battery life. Built with premium titanium 
frame and Gorilla Glass Victus 2 for maximum durability.

Perfect for content creators, gamers, and professionals who demand 
the very best in mobile technology.
```

**Relationships**:
- Belongs to one `Category`
- Has many `OrderItems`
- Has many `MarketplaceListings`
- Has many `InventoryLogs`

---

## 3. Installment Plans

### 3.1 `installment_plans` - Payment Plan Configurations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Plan ID |
| `name` | VARCHAR | NOT NULL | Plan display name |
| `duration_months` | INTEGER | NOT NULL | 6, 12, 18, 24 months |
| `interest_rate` | DECIMAL(5,2) | NOT NULL | Annual interest % |
| `min_down_payment` | DECIMAL(5,2) | NOT NULL | Minimum down payment % |
| `is_active` | BOOLEAN | DEFAULT true | Plan availability |
| `applicable_categories` | JSONB | NULLABLE | Category restrictions |
| `promotional_until` | TIMESTAMP | NULLABLE | Promotion end date |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation date |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Last update |

**Current Plans**:
1. Zero Interest - 6 Months (0%, 15% down)
2. Zero Interest - 12 Months (0%, 20% down)
3. Standard - 18 Months (12%, 15% down)
4. Extended - 24 Months (15%, 20% down)

---

## 4. Orders & Transactions

### 4.1 `orders` - Order Headers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Order ID |
| `user_id` | UUID | FOREIGN KEY, NOT NULL | Customer ID |
| `order_number` | VARCHAR | UNIQUE, NOT NULL | ORD-2024-0001 |
| `order_date` | TIMESTAMP | DEFAULT now() | Order creation |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Total order value |
| `status` | VARCHAR | DEFAULT 'Pending' | Pending / Confirmed / Shipped / Delivered / Cancelled |
| `delivery_method` | VARCHAR | NOT NULL | delivery / pickup |
| `delivery_address` | TEXT | NULLABLE | Delivery address |
| `governorate` | VARCHAR | NULLABLE | Delivery governorate |
| `pickup_branch` | VARCHAR | NULLABLE | Branch ID for pickup |
| `payment_method` | VARCHAR | NOT NULL | card / fawry / wallet / installment |
| `source` | VARCHAR | DEFAULT 'saberstore' | saberstore / amazon / noon |
| `created_at` | TIMESTAMP | DEFAULT now() | Order created |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Last update |

---

### 4.2 `order_items` - Order Line Items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Line item ID |
| `order_id` | UUID | FOREIGN KEY, NOT NULL | Links to orders.id |
| `product_id` | UUID | FOREIGN KEY, NOT NULL | Links to products.id |
| `quantity` | INTEGER | NOT NULL | Quantity ordered |
| `price_at_purchase` | DECIMAL(10,2) | NOT NULL | Price frozen at order time |
| `warranty_months` | INTEGER | NOT NULL | Warranty period |
| `created_at` | TIMESTAMP | DEFAULT now() | Line creation |

---

### 4.3 `installment_contracts` - Financing Agreements

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Contract ID |
| `contract_number` | VARCHAR | UNIQUE, NOT NULL | CON-2024-0001 |
| `order_id` | UUID | FOREIGN KEY, UNIQUE | One contract per order |
| `user_id` | UUID | FOREIGN KEY, NOT NULL | Customer ID |
| `installment_plan_id` | UUID | FOREIGN KEY, NOT NULL | Plan ID |
| `total_financed_amount` | DECIMAL(10,2) | NOT NULL | Amount financed |
| `down_payment_amount` | DECIMAL(10,2) | NOT NULL | Down payment paid |
| `monthly_payment_amount` | DECIMAL(10,2) | NOT NULL | Monthly installment |
| `start_date` | DATE | NOT NULL | Contract start |
| `end_date` | DATE | NOT NULL | Contract end |
| `contract_signed_at` | TIMESTAMP | NULLABLE | Digital signature timestamp |
| `otp_verified` | BOOLEAN | DEFAULT false | OTP verification status |
| `otp_code_hash` | VARCHAR | NULLABLE | Hashed OTP for security |
| `phone_number` | VARCHAR | NOT NULL | Contact number |
| `status` | VARCHAR | DEFAULT 'Active' | Active / Completed / Defaulted / Cancelled |
| `created_at` | TIMESTAMP | DEFAULT now() | Created |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Updated |

---

### 4.4 `payment_schedule` - Monthly Payment Tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Schedule ID |
| `contract_id` | UUID | FOREIGN KEY, NOT NULL | Links to contract |
| `installment_number` | INTEGER | NOT NULL | 1, 2, 3... |
| `due_date` | DATE | NOT NULL | Payment due date |
| `amount` | DECIMAL(10,2) | NOT NULL | Payment amount |
| `status` | VARCHAR | DEFAULT 'Pending' | Pending / Paid / Overdue / Late |
| `paid_at` | TIMESTAMP | NULLABLE | Payment timestamp |
| `paid_amount` | DECIMAL(10,2) | NULLABLE | Actual paid amount |
| `late_fee` | DECIMAL(10,2) | NULLABLE | Late payment fee |
| `payment_method` | VARCHAR | NULLABLE | card / fawry / wallet |
| `transaction_id` | VARCHAR | NULLABLE | Payment gateway ID |
| `created_at` | TIMESTAMP | DEFAULT now() | Created |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Updated |

---

## 5. Marketplace Integration

### 5.1 `marketplace_channels` - Sales Channels

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Channel ID |
| `name` | VARCHAR | UNIQUE, NOT NULL | "Amazon Egypt", "Noon" |
| `code` | VARCHAR | UNIQUE, NOT NULL | amazon, noon, instagram |
| `api_key` | VARCHAR | NULLABLE, ENCRYPTED | API credentials |
| `api_secret` | VARCHAR | NULLABLE, ENCRYPTED | API secret |
| `is_active` | BOOLEAN | DEFAULT true | Channel status |
| `last_sync_at` | TIMESTAMP | NULLABLE | Last sync timestamp |
| `config` | JSONB | NULLABLE | Channel-specific settings |
| `created_at` | TIMESTAMP | DEFAULT now() | Created |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Updated |

**Active Channels**:
- ✅ SaberStore (main store)
- ✅ Amazon Egypt (active)
- ⏳ Noon Egypt (pending credentials)
- ⏳ Instagram Shopping (pending setup)

---

### 5.2 `marketplace_listings` - Product-Channel Mapping

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Listing ID |
| `product_id` | UUID | FOREIGN KEY, NOT NULL | Internal product |
| `channel_id` | UUID | FOREIGN KEY, NOT NULL | Marketplace channel |
| `external_sku` | VARCHAR | NOT NULL | Amazon ASIN / Noon SKU |
| `external_url` | VARCHAR | NULLABLE | Product URL on channel |
| `channel_price` | DECIMAL(10,2) | NOT NULL | Price on channel |
| `stock_qty` | INTEGER | NOT NULL | Stock allocated |
| `is_active` | BOOLEAN | DEFAULT true | Listing status |
| `last_sync_at` | TIMESTAMP | NULLABLE | Last sync |
| `created_at` | TIMESTAMP | DEFAULT now() | Created |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Updated |

**Unique Constraint**: (`product_id`, `channel_id`)

---

### 5.3 `marketplace_orders` - External Orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Record ID |
| `channel_id` | UUID | FOREIGN KEY, NOT NULL | Source channel |
| `external_order_id` | VARCHAR | UNIQUE, NOT NULL | Amazon/Noon Order ID |
| `order_id` | UUID | FOREIGN KEY, NULLABLE | Internal order (after import) |
| `status` | VARCHAR | NOT NULL | pending / imported / fulfilled / cancelled |
| `order_data` | JSONB | NOT NULL | Raw API response |
| `imported_at` | TIMESTAMP | NULLABLE | Import timestamp |
| `created_at` | TIMESTAMP | DEFAULT now() | Created |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Updated |

---

### 5.4 `inventory_logs` - Stock Audit Trail

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Log ID |
| `product_id` | UUID | FOREIGN KEY, NOT NULL | Product affected |
| `channel_id` | UUID | FOREIGN KEY, NULLABLE | Related channel |
| `change_qty` | INTEGER | NOT NULL | +/- quantity change |
| `reason` | VARCHAR | NOT NULL | sale / restock / sync / return / adjustment |
| `reference` | VARCHAR | NULLABLE | Order ID, sync ID, note |
| `before_qty` | INTEGER | NOT NULL | Quantity before |
| `after_qty` | INTEGER | NOT NULL | Quantity after |
| `created_by` | UUID | NULLABLE | User ID or 'system' |
| `created_at` | TIMESTAMP | DEFAULT now() | Log timestamp |

---

## 6. Store Operations

### 6.1 `store_branches` - Physical Locations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Branch ID |
| `name` | VARCHAR | NOT NULL | Branch name |
| `city` | VARCHAR | NOT NULL | City name |
| `address` | TEXT | NOT NULL | Full address |
| `phone` | VARCHAR | NOT NULL | Contact number |
| `working_hours` | VARCHAR | NOT NULL | Schedule |
| `latitude` | DECIMAL(10,8) | NULLABLE | GPS latitude |
| `longitude` | DECIMAL(11,8) | NULLABLE | GPS longitude |
| `has_stock` | BOOLEAN | DEFAULT true | Inventory available |
| `is_active` | BOOLEAN | DEFAULT true | Branch status |
| `created_at` | TIMESTAMP | DEFAULT now() | Created |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Updated |

**Current Branches**:
1. SaberStore Cairo - Nasr City
2. SaberStore Giza - Mall of Arabia
3. SaberStore Alexandria - San Stefano

---

## 7. ER Diagram

```
┌─────────┐       ┌─────────┐       ┌──────────────┐
│  users  │──1:1──│profiles │       │credit_limits │
└────┬────┘       └─────────┘       └──────┬───────┘
     │                                      │
     │1:N                                   │1:1
     │                                      │
┌────▼────────┐                    ┌───────▼────────┐
│   orders    │──1:N──┐            │installment_    │
└─────┬───────┘       │            │contracts       │
      │1:N            │            └────────┬───────┘
      │               │                     │1:N
┌─────▼───────┐  ┌───▼──────┐         ┌────▼─────────┐
│order_items  │  │marketplace│         │payment_      │
└─────┬───────┘  │_orders    │         │schedule      │
      │N:1       └───────────┘         └──────────────┘
      │
┌─────▼────────┐       ┌──────────┐
│  products    │──N:1──│categories│
└─────┬────────┘       └──────────┘
      │1:N
┌─────▼──────────────┐
│marketplace_listings│
└────────────────────┘
```

---

## Schema Features Summary

✅ **Egyptian Market Optimized**:
- Phone numbers (01XXXXXXXXX format)
- Governorates (Cairo, Giza, Alexandria, etc.)
- National ID (14 digits, encrypted)
- EGP currency (Decimal precision)

✅ **Multi-Channel E-Commerce**:
- Main SaberStore platform
- Amazon Egypt integration
- Noon marketplace (ready)
- Instagram Shopping (ready)

✅ **Complete Credit System**:
- KYC workflow (Submit → Approve/Reject)
- Credit limit management
- Installment contracts with OTP
- Monthly payment schedules with late fees

✅ **Enhanced Product Management** ⭐:
- Multiple images support (`images` JSON array)
- Detailed descriptions (`description` text field)
- Flexible specifications (JSON)
- Marketing badges
- Default stock quantity (50 units)
- Multi-channel listings

✅ **Audit & Security**:
- Inventory change logs
- Encrypted PII (National IDs, API keys)
- Hashed passwords (Bcrypt)
- OTP verification for contracts
- Created/updated timestamps on all tables

✅ **Scalability**:
- UUID primary keys
- JSONB for flexible data
- Indexed foreign keys
- Supabase PostgreSQL (production-ready)

---

## Total Storage Estimate

| Table | Avg Row Size | Est. Records | Est. Size |
|-------|--------------|--------------|-----------|
| users | 500 bytes | 50,000 | 25 MB |
| products | 2 KB | 10,000 | 20 MB |
| orders | 800 bytes | 100,000 | 80 MB |
| order_items | 400 bytes | 300,000 | 120 MB |
| payment_schedule | 300 bytes | 500,000 | 150 MB |
| inventory_logs | 200 bytes | 1,000,000 | 200 MB |
| **TOTAL** | - | ~2M rows | **~600 MB** |

---

## Quick Reference

**Prisma Commands**:
```bash
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create & apply migration
npx prisma generate        # Regenerate client
npm run seed              # Seed database
```

**Important Files**:
- Schema: `backend/prisma/schema.prisma`
- Seed: `backend/prisma/seed.ts`
- Migrations: `backend/prisma/migrations/`

**Database URL**: Configured in `backend/.env` → `DATABASE_URL`

---

_Last updated: 2026-02-01 | SaberStore v1.0_