# 🛍️ Multi-Channel Marketplace Integration Guide

## Overview

This guide explains how to integrate SaberStore with Amazon Egypt and Noon to synchronize inventory, prices, and orders in real-time.

---

## 📊 Updated Database Schema

### Additional Models Needed

Add these models to your `backend/prisma/schema.prisma`:

```prisma
// Multi-channel inventory tracking
model MarketplaceChannel {
  id          String   @id @default(uuid())
  name        String   @unique // "Amazon Egypt", "Noon", "SaberStore"
  apiKey      String?  // Encrypted API credentials
  apiSecret   String?  // Encrypted
  isActive    Boolean  @default(true)
  lastSyncAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  listings    MarketplaceListing[]
  orders      MarketplaceOrder[]

  @@map("marketplace_channels")
}

model MarketplaceListing {
  id              String   @id @default(uuid())
  productId       String   @map("product_id")
  channelId       String   @map("channel_id")
  externalSku     String   @map("external_sku") // Amazon ASIN or Noon SKU
  externalUrl     String?  @map("external_url")
  channelPrice    Decimal  @db.Decimal(10, 2) // Price on that marketplace
  stockQty        Int      @map("stock_qty")    // Stock allocated to this channel
  isActive        Boolean  @default(true)
  lastSyncAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  product  Product            @relation(fields: [productId], references: [id], onDelete: Cascade)
  channel  MarketplaceChannel @relation(fields: [channelId], references: [id])

  @@unique([productId, channelId])
  @@map("marketplace_listings")
}

model MarketplaceOrder {
  id               String   @id @default(uuid())
  channelId        String   @map("channel_id")
  externalOrderId  String   @unique @map("external_order_id") // Amazon Order ID
  orderId          String?  @map("order_id") // Internal SaberStore order ID
  status           String   // "pending", "imported", "fulfilled", "cancelled"
  orderData        Json     // Raw order data from marketplace
  importedAt       DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  channel  MarketplaceChannel @relation(fields: [channelId], references: [id])
  order    Order?             @relation(fields: [orderId], references: [id])

  @@map("marketplace_orders")
}

// Update Product model to include marketplace listings
model Product {
  // ... existing fields ...

  marketplaceListings MarketplaceListing[]

  @@map("products")
}

// Update Order model to track marketplace source
model Order {
  // ... existing fields ...

  source              String?  @default("saberstore") // "saberstore", "amazon", "noon"
  marketplaceOrders   MarketplaceOrder[]

  @@map("orders")
}

// Inventory adjustment log
model InventoryLog {
  id          String   @id @default(uuid())
  productId   String   @map("product_id")
  channelId   String?  @map("channel_id")
  changeQty   Int      @map("change_qty")      // +5, -3, etc.
  reason      String   // "sale", "restock", "sync", "return"
  reference   String?  // Order ID or sync ID
  beforeQty   Int      @map("before_qty")
  afterQty    Int      @map("after_qty")
  createdAt   DateTime @default(now())

  product  Product             @relation(fields: [productId], references: [id])
  channel  MarketplaceChannel? @relation(fields: [channelId], references: [id])

  @@map("inventory_logs")
}
```

---

## 🔗 Integration Approach

### Option 1: Amazon SP-API (Selling Partner API) ⭐ Recommended

**What it is:**
Amazon's official API for sellers to manage inventory, orders, and listings.

**Egyptian Market:**
- URL: https://sellercentral.amazon.eg/
- API Endpoint: `https://sellingpartnerapi-eu.amazon.com` (Europe region)
- Documentation: https://developer-docs.amazon.com/sp-api/

**Required Credentials:**
1. AWS Access Key & Secret (from Amazon Seller Central)
2. LWA (Login with Amazon) Client ID & Secret
3. Refresh Token
4. Marketplace ID: `A2VIGQ35RCS4UG` (Egypt)

**Setup Steps:**

```bash
# Install Amazon SP-API SDK
npm install @sp-api-sdk/auth @sp-api-sdk/catalog-items @sp-api-sdk/feeds @sp-api-sdk/orders
```

**Implementation:**

```typescript
// backend/src/services/amazon.service.ts
import { SellingPartnerAPI } from '@sp-api-sdk/auth';

const spApi = new SellingPartnerAPI({
  region: 'eu', // Amazon Egypt uses EU region
  refresh_token: process.env.AMAZON_REFRESH_TOKEN!,
  credentials: {
    SELLING_PARTNER_APP_CLIENT_ID: process.env.AMAZON_CLIENT_ID!,
    SELLING_PARTNER_APP_CLIENT_SECRET: process.env.AMAZON_CLIENT_SECRET!,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// Update inventory on Amazon
export async function updateAmazonInventory(
  sku: string,
  quantity: number
) {
  const feed = {
    feedType: 'POST_INVENTORY_AVAILABILITY_DATA',
    marketplaceIds: ['A2VIGQ35RCS4UG'], // Egypt
    inputFeedDocument: {
      sku,
      available: quantity,
      fulfillment_center_id: 'DEFAULT'
    }
  };

  const result = await spApi.feeds.createFeed(feed);
  return result;
}

// Get Amazon orders
export async function getAmazonOrders(
  createdAfter: Date
) {
  const orders = await spApi.orders.getOrders({
    marketplaceIds: ['A2VIGQ35RCS4UG'],
    createdAfter: createdAfter.toISOString()
  });

  return orders.payload.Orders;
}
```

### Option 2: Noon Partner API

**What it is:**
Noon's API for sellers to manage products and orders.

**Egyptian Market:**
- URL: https://seller.noon.partners/
- API Endpoint: `https://api.noon.partners/v1`
- Documentation: Contact Noon Partner Support for API access

**Required Credentials:**
1. Partner ID
2. API Key
3. Secret Key

**Setup Steps:**

```bash
# Noon doesn't have official SDK, use axios
npm install axios
```

**Implementation:**

```typescript
// backend/src/services/noon.service.ts
import axios from 'axios';
import crypto from 'crypto';

const NOON_API_URL = 'https://api.noon.partners/v1';

function generateSignature(params: any, secretKey: string) {
  const sorted = Object.keys(params).sort().reduce((obj, key) => {
    obj[key] = params[key];
    return obj;
  }, {} as any);

  const queryString = new URLSearchParams(sorted).toString();
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export async function updateNoonInventory(
  sku: string,
  quantity: number
) {
  const params = {
    partner_id: process.env.NOON_PARTNER_ID!,
    sku,
    quantity,
    timestamp: Date.now()
  };

  const signature = generateSignature(params, process.env.NOON_SECRET_KEY!);

  const response = await axios.post(`${NOON_API_URL}/inventory/update`, {
    ...params,
    signature
  }, {
    headers: {
      'X-API-Key': process.env.NOON_API_KEY!
    }
  });

  return response.data;
}

export async function getNoonOrders(fromDate: Date) {
  const params = {
    partner_id: process.env.NOON_PARTNER_ID!,
    from_date: fromDate.toISOString(),
    timestamp: Date.now()
  };

  const signature = generateSignature(params, process.env.NOON_SECRET_KEY!);

  const response = await axios.get(`${NOON_API_URL}/orders`, {
    params: { ...params, signature },
    headers: {
      'X-API-Key': process.env.NOON_API_KEY!
    }
  });

  return response.data.orders;
}
```

---

## 🔄 Inventory Sync Strategy

### Centralized Inventory Management

```typescript
// backend/src/services/inventory.service.ts
import prisma from '../config/database';
import { updateAmazonInventory } from './amazon.service';
import { updateNoonInventory } from './noon.service';

export async function allocateInventory(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { marketplaceListings: true }
  });

  if (!product) throw new Error('Product not found');

  // Calculate total allocated stock
  const totalAllocated = product.marketplaceListings.reduce(
    (sum, listing) => sum + listing.stockQty,
    0
  );

  // Reserve 30% for SaberStore, distribute rest to marketplaces
  const saberStoreStock = Math.floor(product.stockQty * 0.3);
  const marketplaceStock = product.stockQty - saberStoreStock;

  // Distribute to Amazon and Noon (50/50)
  const amazonStock = Math.floor(marketplaceStock / 2);
  const noonStock = marketplaceStock - amazonStock;

  return {
    saberstore: saberStoreStock,
    amazon: amazonStock,
    noon: noonStock
  };
}

export async function syncInventoryToMarketplaces(productId: string) {
  const allocation = await allocateInventory(productId);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { marketplaceListings: true }
  });

  // Update Amazon
  const amazonListing = product.marketplaceListings.find(
    l => l.channel.name === 'Amazon Egypt'
  );

  if (amazonListing) {
    await updateAmazonInventory(amazonListing.externalSku, allocation.amazon);

    await prisma.marketplaceListing.update({
      where: { id: amazonListing.id },
      data: {
        stockQty: allocation.amazon,
        lastSyncAt: new Date()
      }
    });
  }

  // Update Noon
  const noonListing = product.marketplaceListings.find(
    l => l.channel.name === 'Noon'
  );

  if (noonListing) {
    await updateNoonInventory(noonListing.externalSku, allocation.noon);

    await prisma.marketplaceListing.update({
      where: { id: noonListing.id },
      data: {
        stockQty: allocation.noon,
        lastSyncAt: new Date()
      }
    });
  }

  // Log inventory changes
  await prisma.inventoryLog.create({
    data: {
      productId,
      changeQty: 0,
      reason: 'sync',
      beforeQty: product.stockQty,
      afterQty: product.stockQty
    }
  });
}
```

### Real-time Sync on Sale

```typescript
// backend/src/services/order.service.ts
export async function createOrder(orderData: any) {
  // Create order in database
  const order = await prisma.order.create({
    data: orderData,
    include: { items: true }
  });

  // Reduce stock for each product
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stockQty: {
          decrement: item.quantity
        }
      }
    });

    // Sync inventory to marketplaces immediately
    await syncInventoryToMarketplaces(item.productId);
  }

  return order;
}
```

---

## ⏰ Cron Jobs for Sync

```typescript
// backend/src/jobs/marketplaceSync.job.ts
import cron from 'node-cron';
import { getAmazonOrders } from '../services/amazon.service';
import { getNoonOrders } from '../services/noon.service';
import prisma from '../config/database';

// Sync Amazon orders every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('Syncing Amazon orders...');

  const lastSync = await prisma.marketplaceChannel.findUnique({
    where: { name: 'Amazon Egypt' }
  });

  const orders = await getAmazonOrders(
    lastSync?.lastSyncAt || new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  for (const order of orders) {
    // Import order to SaberStore
    await importAmazonOrder(order);
  }

  await prisma.marketplaceChannel.update({
    where: { name: 'Amazon Egypt' },
    data: { lastSyncAt: new Date() }
  });
});

// Sync Noon orders every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('Syncing Noon orders...');

  const lastSync = await prisma.marketplaceChannel.findUnique({
    where: { name: 'Noon' }
  });

  const orders = await getNoonOrders(
    lastSync?.lastSyncAt || new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  for (const order of orders) {
    await importNoonOrder(order);
  }

  await prisma.marketplaceChannel.update({
    where: { name: 'Noon' },
    data: { lastSyncAt: new Date() }
  });
});

// Full inventory sync every hour
cron.schedule('0 * * * *', async () => {
  console.log('Full inventory sync...');

  const products = await prisma.product.findMany({
    where: { stockQty: { gt: 0 } }
  });

  for (const product of products) {
    await syncInventoryToMarketplaces(product.id);
  }
});
```

---

## 🎯 Implementation Roadmap

### Phase 1: Database Update (Week 1)
- [ ] Add marketplace models to Prisma schema
- [ ] Run migrations
- [ ] Seed initial marketplace channels

### Phase 2: Amazon Integration (Week 2)
- [ ] Register for Amazon SP-API
- [ ] Implement authentication
- [ ] Build inventory sync service
- [ ] Build order import service
- [ ] Test with sandbox environment

### Phase 3: Noon Integration (Week 3)
- [ ] Apply for Noon Partner API access
- [ ] Implement authentication
- [ ] Build inventory sync service
- [ ] Build order import service

### Phase 4: Cron Jobs & Automation (Week 4)
- [ ] Setup cron jobs for syncing
- [ ] Implement conflict resolution
- [ ] Add logging and monitoring
- [ ] Test end-to-end flow

### Phase 5: Admin Dashboard (Week 5)
- [ ] Marketplace connection settings
- [ ] Inventory allocation controls
- [ ] Sync status monitoring
- [ ] Manual sync triggers

---

## 🔧 Environment Variables

Add to `backend/.env`:

```env
# Amazon SP-API
AMAZON_CLIENT_ID="amzn1.application-oa2-client..."
AMAZON_CLIENT_SECRET="..."
AMAZON_REFRESH_TOKEN="Atzr|..."
AMAZON_MARKETPLACE_ID="A2VIGQ35RCS4UG"
AMAZON_REGION="eu"

# Noon Partner API
NOON_PARTNER_ID="..."
NOON_API_KEY="..."
NOON_SECRET_KEY="..."

# Inventory allocation
SABERSTORE_STOCK_PERCENTAGE=30
AMAZON_STOCK_PERCENTAGE=35
NOON_STOCK_PERCENTAGE=35
```

---

## 📊 Admin UI Features

Create `src/components/admin/MarketplaceSync.tsx`:

- View sync status for each marketplace
- Manual sync triggers
- Inventory allocation controls
- Marketplace order history
- Error logs and retry mechanisms

---

## 🚨 Important Considerations

### 1. Stock Reservation
- **Problem**: Overselling across channels
- **Solution**: Reserve buffer stock (5-10%) to prevent stockouts

### 2. Price Synchronization
- Each marketplace may have different pricing
- Amazon charges fees (15-20%)
- Noon charges fees (similar)
- Adjust prices accordingly

### 3. Order Fulfillment
- SaberStore orders: Installment plans work
- Marketplace orders: Usually direct payment
- Need separate fulfillment workflows

### 4. SKU Mapping
- SaberStore SKU → Amazon ASIN
- SaberStore SKU → Noon SKU
- Maintain mapping table

---

## 📝 Summary

**Yes, this WILL change your database:**
- ✅ Add 4 new models (MarketplaceChannel, MarketplaceListing, MarketplaceOrder, InventoryLog)
- ✅ Update Product and Order models
- ✅ Add inventory allocation logic
- ✅ Implement real-time sync

**When to implement:**
- **Phase 6 (Week 2-3)**: After basic backend is done
- OR **Phase 12**: As a separate multi-channel feature

**My Recommendation:**
Start with Phase 6 basic backend FIRST, then add marketplace integration as **Phase 12** once your core system is stable.

---

**Last Updated:** 2024-12-24
**Maintained by:** alisoleah
