# Product Import Guide - How Data Maps to Database

## Overview

This document shows how product data from `Products_info.txt` is parsed and inserted into the database.

---

## Product Data Mapping

### ✅ PRODUCT 1: AURA Watch

**Source Data (Products_info.txt)**:
```
ALL BLACK | AURA Minimalist Analog Watch | Arabic Numerals 
List Price: EGP200
الساعات (Watches)

About this item:
- DESIGN: Sleek matte black timepiece featuring a minimalist Arabic numeral dial
- CONSTRUCTION: Stylish bracelet with integrated design
- DISPLAY: Modern monochromatic dial with seamless hands
...
```

**Database Record**:
```typescript
{
  name: "ALL BLACK | AURA Minimalist Analog Watch | Arabic Numerals",
  sku: "AURA-BLACK-WATCH-001",                    // ✨ Auto-generated
  brand: "AURA",                                   // ✨ Extracted from name
  categoryId: "watches-uuid",                      // ✨ Mapped from "الساعات"
  cashPrice: 200.00,                               // FROM: List Price
  oldPrice: null,                                  // No discount
  stockQty: 50,                                    // DEFAULT
  warranty: "1 Year",                              // ✨ Standard for watches
  rating: 0,                                       // NEW product
  reviewCount: 0,
  
  description: "Make a bold statement with this sophisticated...",  // FROM: Product description
  
  specs: {                                         // FROM: About this item
    "Design": "Sleek matte black timepiece...",
    "Construction": "Stylish bracelet...",
    "Display": "Modern monochromatic dial...",
    "Bracelet": "Solid fiber bracelet...",
    "Movement": "Precise quartz movement",
    "Water Resistance": "Water-resistant construction"
  },
  
  badges: ["0% Interest", "Modern Design", "Water Resistant"],
  
  imageUrl: "/uploads/products/GenericWatch_1.jpg",    // ✨ Main image
  images: [                                            // ✨ All images
    "/uploads/products/GenericWatch_1.jpg",
    "/uploads/products/GenericWatch_2.jpg"
  ]
}
```

**Images Found**:
- ✅ GenericWatch_1.jpg (Main)
- ✅ GenericWatch_2.jpg

---

### ✅ PRODUCT 2: Philips Shaver

**Source Data**:
```
Philips Shaver 1000 Series Wet & Dry Electric Shaver S1151/00, 2 Years Warranty
List Price: EGP2,297.10
اجهزة العناية الشخصية (Personal Care)

Brand Name: Philips
Model Name: S1151/00
Battery Life: 40 minutes
Color: Blue
Blade Material: Stainless Steel
Customer Reviews: 4.4 out of 5 stars (3,410)
...
```

**Database Record**:
```typescript
{
  name: "Philips Shaver 1000 Series Wet & Dry Electric Shaver S1151/00",
  sku: "PHILIPS-S1151-00",
  brand: "Philips",                                // FROM: Brand Name
  categoryId: "personal-health-care-uuid",         // FROM: اجهزة العناية الشخصية
  cashPrice: 2297.10,                              // FROM: List Price
  oldPrice: null,
  stockQty: 50,
  warranty: "2 Years",                             // FROM: Title
  rating: 4.40,                                    // FROM: Customer Reviews
  reviewCount: 3410,                               // FROM: Customer Reviews
  
  description: "Philips Shaver 1000 Series gives you a fast...",
  
  specs: {                                         // FROM: Product information
    "Model": "S1151/00",
    "Blades": "27 Self-sharpening ComfortCut blades",
    "Heads": "3D Floating Heads",
    "Usage": "Wet and Dry",
    "Power Source": "Battery Powered - Lithium-Ion",
    "Battery Life": "40 minutes",
    "Number of Blades": "3",
    "Blade Material": "Stainless Steel",
    "Weight": "360 Grams",
    "Color": "Blue",
    "Dimensions": "8 x 10 x 19 cm"
  },
  
  badges: ["0% Interest", "2 Year Warranty", "Best Seller", "Top Rated"],
  
  imageUrl: "/uploads/products/PhilipsShaver_1.jpg",
  images: [
    "/uploads/products/PhilipsShaver_1.jpg",
    "/uploads/products/PhilipsShaver_2.jpg",
    "/uploads/products/PhilipsShaver_3.jpg",
    "/uploads/products/PhilipsShaver_4.jpg"
  ]
}
```

**Images Found**:
- ✅ PhilipsShaver_1.jpg
- ✅ PhilipsShaver_2.jpg
- ✅ PhilipsShaver_3.jpg
- ✅ PhilipsShaver_4.jpg

---

### ✅ PRODUCT 3: Gold Frame Mirror

**Source Data**:
```
Full Length Mirror – Gold Frame – Large Floor Standing or Wall Mounted...
ديكور المنزل (Home Decor)
EGP2,900.00

Brand Name: Generic
Item Dimensions: 170L x 50W centimeters
Frame Material: Metal
Customer Reviews: 2.9 out of 5 stars (4)
...
```

**Database Record**:
```typescript
{
  name: "Full Length Mirror – Gold Frame – Large Floor Standing or Wall Mounted Dressing Mirror",
  sku: "MIRROR-GOLD-170X50",
  brand: "Generic",
  categoryId: "home-decor-uuid",                   // FROM: ديكور المنزل
  cashPrice: 2900.00,                              // FROM: Price
  oldPrice: null,
  stockQty: 50,
  warranty: null,
  rating: 2.90,                                    // FROM: Customer Reviews
  reviewCount: 4,
  
  description: "Add elegance and functionality to your home...",
  
  specs: {
    "Dimensions": "170L x 50W centimeters",
    "Shape": "Rectangular",
    "Frame Material": "Metal",
    "Finish": "Gold Plated",
    "Mounting Type": "Floor Mount / Wall Mount",
    "Weight": "17 Kilograms",
    "Material": "Glass, Metal",
    "Room Type": "Living Room, Bedroom, Hallway, Closet"
  },
  
  badges: ["Free Shipping", "Elegant Design", "Versatile"],
  
  imageUrl: "/uploads/products/mirror_1.jpg",
  images: ["/uploads/products/mirror_1.jpg"]
}
```

**Images Found**:
- ✅ mirror_1.jpg

---

### ✅ PRODUCT 4: Lattafa Perfume

**Source Data**:
```
Lattafa Asad Edp 100Ml
Brand: Lattafa
EGP 1,248.98
العطور (Perfumes)

Item Volume: 101.44 Milliliters
Scent: Amber Wood, Wood
Top Notes: Black Pepper, Pinapple, Tobacco
Heart Notes: Coffee, Patchouli, Iris
...
```

**Database Record**:
```typescript
{
  name: "Lattafa Asad Eau de Parfum 100ml",
  sku: "LATTAFA-ASAD-100ML",
  brand: "Lattafa",
  categoryId: "perfumes-uuid",                     // FROM: العطور
  cashPrice: 1248.98,
  oldPrice: null,
  stockQty: 50,
  warranty: null,
  rating: 0,
  reviewCount: 0,
  
  description: "Lattafa Asad Is A Vanilla Fragrance...",
  
  specs: {
    "Volume": "100ml",
    "Form": "Liquid",
    "Concentration": "Eau de Parfum",
    "Scent": "Amber Wood, Vanilla",
    "Gender": "Unisex",
    "Top Notes": "Black Pepper, Pineapple, Tobacco",
    "Heart Notes": "Coffee, Patchouli, Iris"
  },
  
  badges: ["Unisex", "Long Lasting", "Signature Scent"],
  
  imageUrl: "/uploads/products/lattafa_placeholder.jpg",
  images: []                                       // ⚠️ NO IMAGES FOUND
}
```

**Images Found**:
- ❌ No images available (need to add)

---

### ✅ PRODUCT 5: BLACK+DECKER Food Processor

**Source Data**:
```
Brand Name: BLACK+DECKER
EGP4,124.00
Kitchen & Dining (المطبخ والطعام)

Special Features: Safety Lock
Wattage: 800 watts
Bowl Capacity: 2 Liters
Material: Stainless Steel
...
```

**Database Record**:
```typescript
{
  name: "BLACK+DECKER 800W Food Processor with Blender - 2L Bowl",
  sku: "BD-FX822-B5",
  brand: "BLACK+DECKER",
  categoryId: "kitchen-dining-uuid",               // FROM: المطبخ والطعام
  cashPrice: 4124.00,
  oldPrice: null,
  stockQty: 50,
  warranty: "2 Years",
  rating: 0,
  reviewCount: 0,
  
  description: "800W high performance motor for smooth processing...",
  
  specs: {
    "Model": "FX822-B5",
    "Power": "800 watts",
    "Bowl Capacity": "2 Liters (1.5L working)",
    "Blender Jar": "1.5L",
    "Speeds": "2 Speed + Pulse",
    "Material": "Stainless Steel",
    "Color": "Red",
    "Weight": "2.94 Kilograms",
    "Features": "Safety Lock, Dishwashable"
  },
  
  badges: ["0% Interest", "Family Size", "Dishwasher Safe", "Multi-Function"],
  
  imageUrl: "/uploads/products/Black&Decker_1.jpg",
  images: [
    "/uploads/products/Black&Decker_1.jpg",
    "/uploads/products/Black&Decker_2.jpg",
    "/uploads/products/Black&Decker_3.jpg",
    "/uploads/products/Black&Decker_4.jpg"
  ]
}
```

**Images Found**:
- ✅ Black&Decker_1.jpg
- ✅ Black&Decker_2.jpg
- ✅ Black&Decker_3.jpg
- ✅ Black&Decker_4.jpg

---

### ✅ PRODUCT 6: Anker Charger

**Source Data**:
```
Anker Zolo 1C Wall Charger Type-C 30W Fast Charging...
EGP 519.00
electronics - accessories

Brand Name: Anker
Connector Type: USB Type C
Customer Reviews: 4.5 out of 5 stars (389)
Warranty Description: 18 Months
...
```

**Database Record**:
```typescript
{
  name: "Anker Zolo 1C Wall Charger Type-C 30W Fast Charging - Black",
  sku: "ANKER-A2698L11",
  brand: "Anker",
  categoryId: "mobile-accessories-uuid",           // FROM: electronics - accessories
  cashPrice: 519.00,
  oldPrice: null,
  stockQty: 50,
  warranty: "18 Months",
  rating: 4.50,
  reviewCount: 389,
  
  description: "High-speed charging with a USB-C power port...",
  
  specs: {
    "Model": "A2698L11",
    "Power": "30 watts",
    "Connector Type": "USB Type C",
    "Technology": "GaN II",
    "Cable Included": "1.8m USB-C Cable",
    "Color": "Black",
    "Weight": "30 Grams",
    "Compatible Devices": "iPhone, iPad, Samsung, Pixel"
  },
  
  badges: ["0% Interest", "Best Seller", "#1 in Chargers", "Fast Charging"],
  
  imageUrl: "/uploads/products/Charger_1.jpg",
  images: [
    "/uploads/products/Charger_1.jpg",
    "/uploads/products/Charger_2.jpg",
    "/uploads/products/Charger_3.jpg",
    "/uploads/products/Charger_4.jpg"
  ]
}
```

**Images Found**:
- ✅ Charger_1.jpg
- ✅ Charger_2.jpg
- ✅ Charger_3.jpg
- ✅ Charger_4.jpg

---

## Category Mapping

| Text File Category (Arabic) | Database Category | ID Field |
|----------------------------|-------------------|----------|
| الساعات | Watches | ⌚ |
| اجهزة العناية الشخصية | Personal & Health Care | 🧴 |
| ديكور المنزل | Home Decor | 🏠 |
| العطور | Perfumes | 🌸 |
| المطبخ والطعام | Kitchen & Dining | 🍳 |
| electronics - accessories | Mobile Accessories | 📱 |

---

## Data Extraction Rules

### 1. **Name**
- ✅ Use full product title from first line
- ✅ Clean up extra spaces and formatting

### 2. **SKU** (Stock Keeping Unit)
- ✨ **Auto-generated** based on:
  - Brand name (first word/letters)
  - Model number (if available)
  - Unique identifier
- Examples:
  - `PHILIPS-S1151-00` (from model)
  - `AURA-BLACK-WATCH-001` (descriptive)

### 3. **Brand**
- ✅ Extract from "Brand Name:" field
- ✅ Or extract from product title

### 4. **Price**
- ✅ Extract from "List Price:" or standalone price
- ✅ Parse "EGP2,297.10" → `2297.10`
- ✅ Remove commas, currency symbols

### 5. **Category**
- ✅ Map Arabic category name to English
- ✅ Look up category ID from database

### 6. **Specs** (JSON Object)
- ✅ Extract from "About this item" bullets
- ✅ Extract from product information table
- ✅ Format as key-value pairs

### 7. **Description**
- ✅ Use "Product description" section
- ✅ Full paragraph text

### 8. **Images** (JSON Array)
- ✅ Match filename patterns:
  - `PhilipsShaver_1.jpg`, `PhilipsShaver_2.jpg`, etc.
  - `Charger_1.jpg`, `Charger_2.jpg`, etc.
- ✅ Store relative paths: `/uploads/products/filename.jpg`
- ✅ First image = `imageUrl` (main)
- ✅ All images = `images` array

### 9. **Rating & Reviews**
- ✅ Extract from "Customer Reviews: 4.5 out of 5 stars (389)"
- ✅ Rating: `4.5` (Decimal)
- ✅ Review Count: `389` (Integer)

### 10. **Warranty**
- ✅ Extract from title or warranty field
- ✅ Examples: "2 Years", "18 Months"

### 11. **Badges**
- ✨ **Auto-assigned** based on:
  - All products: "0% Interest" (if eligible)
  - High rating (>4.0): "Top Rated"
  - High reviews (>100): "Best Seller"
  - Special features: "Fast Charging", "Dishwasher Safe"

---

## Image Naming Convention

**Pattern**: `{ProductIdentifier}_{Number}.jpg`

Examples:
- `PhilipsShaver_1.jpg` → Philips Shaver (Image 1)
- `Charger_3.jpg` → Anker Charger (Image 3)
- `Black&Decker_2.jpg` → Food Processor (Image 2)

**Matching Logic**:
1. Look for files starting with product identifier
2. Sort by number suffix
3. Assign to `images` array in order

---

## Summary

**Total Products**: 6
**Total Images**: 15 images
**Categories Used**: 6 categories

**Breakdown by Category**:
- ⌚ Watches: 1 product (2 images)
- 🧴 Personal & Health Care: 1 product (4 images)
- 🏠 Home Decor: 1 product (1 image)
- 🌸 Perfumes: 1 product (0 images) ⚠️
- 🍳 Kitchen & Dining: 1 product (4 images)
- 📱 Mobile Accessories: 1 product (4 images)

**Missing Images**:
- ⚠️ Lattafa Asad Perfume (no images found)

---

## Running the Import

```bash
cd backend
npx ts-node prisma/seed-products.ts
```

**Expected Output**:
```
🛍️  Starting product seeding from Products_info.txt...

✅ Created: ALL BLACK | AURA Minimalist Analog Watch
   SKU: AURA-BLACK-WATCH-001 | Price: 200 EGP
   Images: 2 image(s)

✅ Created: Philips Shaver 1000 Series...
   SKU: PHILIPS-S1151-00 | Price: 2297.1 EGP
   Images: 4 image(s)

✅ Created: Full Length Mirror – Gold Frame...
   SKU: MIRROR-GOLD-170X50 | Price: 2900 EGP
   Images: 1 image(s)

✅ Created: Lattafa Asad Eau de Parfum 100ml
   SKU: LATTAFA-ASAD-100ML | Price: 1248.98 EGP
   Images: 0 image(s)

✅ Created: BLACK+DECKER 800W Food Processor...
   SKU: BD-FX822-B5 | Price: 4124 EGP
   Images: 4 image(s)

✅ Created: Anker Zolo 1C Wall Charger...
   SKU: ANKER-A2698L11 | Price: 519 EGP
   Images: 4 image(s)

📊 Summary:
   ✅ Successfully created: 6 products
   ❌ Failed: 0 products
   📦 Total: 6 products
```

---

_Generated: 2026-02-01 | SaberStore Product Import_
