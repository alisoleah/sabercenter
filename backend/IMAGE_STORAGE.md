# Image Storage Strategy - SaberStore

## Overview

SaberStore uses a **flexible dual-storage system** that automatically switches between **local storage** (development) and **AWS S3** (production) based on configuration.

---

## Storage Architecture

```
┌─────────────────────────────────────────────────┐
│           Image Upload Request                  │
│         (via Multer middleware)                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │ Storage Service │
         │  (Auto-detect)  │
         └────────┬────────┘
                  │
          ┌───────┴───────┐
          │               │
          ▼               ▼
   ┌──────────┐    ┌───────────┐
   │  Local   │    │   AWS S3  │
   │ Storage  │    │  (Cloud)  │
   └──────────┘    └───────────┘
   Development     Production
```

---

## 1. Local Storage (Development/Testing)

### How It Works:
- Files uploaded to `backend/uploads/` directory
- Organized by folder: `uploads/images/`, `uploads/documents/`, etc.
- Returns relative URLs: `/uploads/images/filename.jpg`

### File Structure:
```
backend/
├── uploads/
│   ├── images/              # Product images
│   │   ├── 1706789012345-123456789.jpg
│   │   ├── 1706789012346-987654321.jpg
│   │   └── ...
│   ├── documents/           # KYC documents, utility bills
│   │   ├── national-id-xyz.jpg
│   │   └── utility-bill-abc.pdf
│   └── banners/             # Marketing banners
│       └── promo-banner.jpg
```

### File Naming:
```
{timestamp}-{random-number}.{extension}
Example: 1706789012345-123456789.jpg
```

### Advantages:
- ✅ Free (no cloud costs)
- ✅ Fast local development
- ✅ Easy debugging
- ✅ No external dependencies

### Disadvantages:
- ❌ Not scalable for production
- ❌ Lost on server restart (Docker)
- ❌ No CDN acceleration
- ❌ Single point of failure

---

## 2. AWS S3 Storage (Production)

### How It Works:
- Files uploaded to AWS S3 bucket
- Organized by folder prefix: `images/`, `documents/`, etc.
- Returns S3 URLs (public) or S3 keys (private)

### S3 Structure:
```
s3://saberstore-production/
├── images/
│   ├── 1706789012345-123456789.jpg
│   ├── 1706789012346-987654321.jpg
│   └── ...
├── documents/
│   ├── national-id-xyz.jpg (PRIVATE - encrypted)
│   └── utility-bill-abc.pdf (PRIVATE - encrypted)
└── banners/
    └── promo-banner.jpg
```

### Public vs Private Files:

**Public** (Product Images, Banners):
- ACL: `public-read`
- URL: `https://saberstore-production.s3.eu-central-1.amazonaws.com/images/file.jpg`
- Accessible directly via URL

**Private** (KYC Documents):
- ACL: `private`
- Encryption: AES256 server-side
- Access: Via signed URLs (temporary, expires in 1 hour)

### Advantages:
- ✅ Scalable (unlimited storage)
- ✅ CDN support (CloudFront)
- ✅ Automatic backups
- ✅ 99.999999999% durability
- ✅ Global edge locations

### Disadvantages:
- ❌ Costs money (pay per GB)
- ❌ Requires AWS account setup
- ❌ Requires credentials

---

## 3. How the System Chooses Storage

**Auto-Detection Logic** (`storage.service.ts`):

```typescript
async uploadFile(file, folder, isPublic) {
  // If AWS credentials are configured → use S3
  if (this.s3Client && config.aws.s3BucketName) {
    return this.uploadToS3(file, folder, isPublic);
  } 
  // Otherwise → use local storage
  else {
    return this.uploadToLocal(file, folder);
  }
}
```

**Trigger**: Presence of AWS credentials in `.env`

---

## 4. Configuration

### Local Storage (Default - No Config Needed)
Just works out of the box! Files saved to `backend/uploads/`

### AWS S3 (Production)

**Required in `.env`**:
```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=eu-central-1
AWS_S3_BUCKET_NAME=saberstore-production
```

**Setup Steps**:
1. Create AWS account
2. Create S3 bucket: `saberstore-production`
3. Enable public access for product images
4. Create IAM user with S3 permissions
5. Get access keys
6. Add to `.env`

---

## 5. API Endpoints

### Upload Single Image
```http
POST /api/upload/image
Content-Type: multipart/form-data

Body:
  image: [file]

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "/uploads/images/1706789012345-123456789.jpg"
  }
}
```

### Upload Multiple Images (for product)
```http
POST /api/upload/images
Content-Type: multipart/form-data

Body:
  images: [file1, file2, file3]

Response:
{
  "success": true,
  "data": {
    "urls": [
      "/uploads/images/img1.jpg",
      "/uploads/images/img2.jpg",
      "/uploads/images/img3.jpg"
    ]
  }
}
```

---

## 6. How Products Store Images

### Database Schema:
```typescript
Product {
  imageUrl: String      // Main image (legacy, backward compatible)
  images: JSON          // Array of all images (NEW)
}
```

### Example Product Record:
```json
{
  "id": "uuid-123",
  "name": "Samsung Galaxy S24 Ultra",
  "imageUrl": "/uploads/images/main-image.jpg",  // First image
  "images": [
    "/uploads/images/samsung-s24-front.jpg",
    "/uploads/images/samsung-s24-back.jpg",
    "/uploads/images/samsung-s24-camera.jpg",
    "/uploads/images/samsung-s24-display.jpg"
  ]
}
```

### Frontend Display:
```typescript
// Show main image
<img src={product.imageUrl} alt={product.name} />

// Show image gallery
{product.images?.map(img => (
  <img key={img} src={img} alt="" />
))}
```

---

## 7. Image Upload Workflow (Full Example)

### Step 1: Admin Adds New Product

**Frontend Form**:
```html
<form enctype="multipart/form-data">
  <input type="file" name="images" multiple accept="image/*" />
  <button>Upload Images</button>
</form>
```

### Step 2: Upload Images First

**Frontend API Call**:
```typescript
const formData = new FormData();
files.forEach(file => formData.append('images', file));

const response = await axios.post('/api/upload/images', formData);
const imageUrls = response.data.urls;
// ["img1.jpg", "img2.jpg", "img3.jpg"]
```

### Step 3: Create Product with Image URLs

```typescript
await axios.post('/api/products', {
  name: "Samsung Galaxy S24 Ultra",
  sku: "SAM-S24U-512GB",
  cashPrice: 52999,
  brand: "Samsung",
  categoryId: "electronics-id",
  imageUrl: imageUrls[0],  // First image as main
  images: imageUrls,        // All images
  description: "..."
});
```

### Step 4: Product Saved to Database

```sql
INSERT INTO products (
  name, 
  image_url, 
  images
) VALUES (
  'Samsung Galaxy S24 Ultra',
  '/uploads/images/img1.jpg',
  '["img1.jpg", "img2.jpg", "img3.jpg"]'
);
```

---

## 8. Image Serving

### Local Development:
```
http://localhost:3003/uploads/images/filename.jpg
```

**Express Static Middleware** (already configured):
```typescript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

### Production (S3):
```
https://saberstore-production.s3.eu-central-1.amazonaws.com/images/filename.jpg
```

Or via CloudFront CDN:
```
https://d1234567890.cloudfront.net/images/filename.jpg
```

---

## 9. Security Considerations

### File Upload Security:
✅ **File Type Validation** (Multer):
```typescript
const upload = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
```

✅ **File Size Limits**: 5MB per image

✅ **Allowed Types**: `image/jpeg`, `image/png`, `image/webp`

✅ **Private Files**: AES256 encryption for KYC documents

✅ **Signed URLs**: Temporary access (1 hour expiry)

### Recommended for Production:
- [ ] Add virus scanning (ClamAV)
- [ ] Add image optimization (Sharp.js)
- [ ] Add watermarking for product images
- [ ] Implement CDN (CloudFront)
- [ ] Add image resizing (thumbnails)

---

## 10. Image Optimization (Recommended)

### Install Sharp.js:
```bash
npm install sharp
```

### Auto-Optimize on Upload:
```typescript
import sharp from 'sharp';

async uploadImage(file) {
  // Optimize: resize, compress, convert to WebP
  const optimized = await sharp(file.buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  
  // Upload optimized buffer
  return storageService.uploadFile({
    ...file,
    buffer: optimized
  }, 'images', true);
}
```

Benefits:
- ✅ Faster page load
- ✅ Lower bandwidth costs
- ✅ Better SEO
- ✅ WebP format (modern, efficient)

---

## 11. Cost Estimate (AWS S3)

**Assumptions**:
- 10,000 products
- 4 images per product = 40,000 images
- Average image size: 200KB (after optimization)

**Storage**:
```
40,000 images × 200KB = 8GB
8GB × $0.023/GB/month = $0.18/month
```

**Bandwidth** (10,000 views/month):
```
10,000 views × 800KB (4 images) = 8GB transfer
8GB × $0.09/GB = $0.72/month
```

**Total Cost**: ~$1/month (extremely cheap!)

With CloudFront CDN: Add $0.085/GB = +$0.68

**Grand Total**: ~$1.70/month 🎯

---

## 12. Migration Path

### Current Status:
- ✅ Local storage working
- ✅ S3 support ready (just add credentials)

### To Switch to S3:
1. Create S3 bucket on AWS
2. Add credentials to `.env`
3. Restart server
4. Upload new images → automatically go to S3
5. Optional: Migrate existing local images to S3

### Migration Script (Optional):
```typescript
// backend/scripts/migrate-to-s3.ts
import fs from 'fs';
import path from 'path';
import storageService from '../src/services/storage.service';

async function migrate() {
  const localPath = path.join(__dirname, '../uploads/images');
  const files = fs.readdirSync(localPath);
  
  for (const file of files) {
    const buffer = fs.readFileSync(path.join(localPath, file));
    const url = await storageService.uploadToS3({
      buffer,
      originalname: file,
      mimetype: 'image/jpeg'
    }, 'images', true);
    
    console.log(`Migrated: ${file} → ${url}`);
  }
}
```

---

## Summary

✅ **Current Setup**: Local storage (development ready)  
✅ **Production Ready**: Just add AWS credentials  
✅ **Automatic Switching**: Based on environment  
✅ **Secure**: Public images, private documents  
✅ **Scalable**: Handles unlimited images  
✅ **Cost-Effective**: ~$2/month for production  

**Recommendation**: 
- Start with local storage for testing
- Switch to S3 when deploying to production
- Add image optimization (Sharp.js) before launch
- Consider CloudFront CDN for global users

---

_Last Updated: 2026-02-01 | SaberStore v1.0_
