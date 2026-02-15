# Saber Store - Remaining Implementation Steps

## ✅ Phase 1: Navigation Improvements (COMPLETED)
- [x] Fixed back navigation in CheckoutFlow component
- [x] Added breadcrumbs navigation to App.tsx
- [x] Implemented mobile hamburger menu in Header

---

## 🔥 Phase 2: Missing PRD Features (HIGH PRIORITY)

### 2.1 Budget Filter (US-1.2)
**What:** Allow users to filter products by their monthly budget
**Where:** Header.tsx or create new FilterBar component
**Implementation:**
```tsx
// Add to product browsing
<div className="flex items-center gap-2 mb-6">
  <label className="text-[#1A1A1A]">Monthly Budget:</label>
  <select
    onChange={(e) => filterByBudget(Number(e.target.value))}
    className="px-4 py-2 border-2 border-[#F0F4F8] rounded-lg"
  >
    <option value={0}>All Products</option>
    <option value={300}>Under 300 EGP/mo</option>
    <option value={500}>300-500 EGP/mo</option>
    <option value={1000}>500-1000 EGP/mo</option>
    <option value={2000}>1000-2000 EGP/mo</option>
  </select>
</div>
```

### 2.2 Product Comparison (US-1.3)
**What:** Side-by-side comparison of products focusing on warranty and installment plans
**Where:** Create new `ProductComparison.tsx` component
**Features:**
- Select 2-3 products to compare
- Show warranty terms side-by-side
- Compare installment options (6, 12, 18, 24 months)
- Highlight best value option

**Files to create:**
- `src/components/ProductComparison.tsx`
- `src/components/CompareCheckbox.tsx` (add to ProductCard)

### 2.3 SMS OTP Verification (US-2.3)
**What:** Digital signature for installment contracts via SMS OTP
**Where:** CheckoutFlow.tsx - add between payment and confirmation steps
**Implementation:**
```tsx
// Add new step for OTP verification when installment is selected
{step === 2.5 && paymentMethod === 'installment' && (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-[#003366] mb-4">Verify Your Contract</h2>
    <p className="text-[#666666] mb-4">
      Enter the OTP sent to your phone: {userPhone}
    </p>
    <input
      type="text"
      maxLength={6}
      placeholder="000000"
      className="w-full px-4 py-3 text-center text-2xl border-2 rounded-lg"
    />
    <button className="w-full bg-[#FF6600] text-white py-3 rounded-lg mt-4">
      Verify & Sign Contract
    </button>
  </div>
)}
```

---

## 📊 Phase 3: Complete ERD Implementation (MEDIUM PRIORITY)

### 3.1 Add Missing TypeScript Interfaces
**File:** `src/types/index.ts`

Add these interfaces per the ERD:

```typescript
export interface Profile {
  userId: string;
  nationalId: string;
  scannedIdUrl?: string;
  utilityBillUrl?: string;
  monthlySalary: number;
  employer: string;
  address: string;
  governorate: string;
  kycStatus: 'Pending' | 'Approved' | 'Rejected';
  kycSubmittedAt?: Date;
  kycApprovedAt?: Date;
}

export interface CreditLimit {
  userId: string;
  totalLimit: number;
  currentBalance: number;
  remainingLimit: number;
  status: 'Active' | 'Frozen' | 'Suspended';
  approvedBy?: string;
  approvedAt?: Date;
}

export interface InstallmentPlan {
  id: string;
  name: string; // e.g., "Zero Interest 12M", "Standard 24M"
  durationMonths: number;
  interestRate: number; // Percentage
  minDownPayment: number; // Percentage (e.g., 10 = 10%)
  isActive: boolean;
  applicableCategories?: string[]; // Product categories this plan applies to
}

export interface Order {
  id: string;
  userId: string;
  orderDate: Date;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  pickupBranch?: string;
  paymentMethod: 'card' | 'fawry' | 'wallet' | 'installment';
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  warrantyMonths: number;
}

export interface InstallmentContract {
  id: string;
  orderId: string;
  userId: string;
  installmentPlanId: string;
  totalFinancedAmount: number;
  downPaymentAmount: number;
  monthlyPaymentAmount: number;
  startDate: Date;
  endDate: Date;
  contractSignedAt?: Date;
  otpVerified: boolean;
  status: 'Active' | 'Completed' | 'Defaulted' | 'Cancelled';
}

export interface PaymentSchedule {
  id: string;
  contractId: string;
  installmentNumber: number; // 1, 2, 3... up to duration
  dueDate: Date;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Late';
  paidAt?: Date;
  paidAmount?: number;
  lateFee?: number;
}
```

### 3.2 Create Mock Data
**File:** `src/data/mockData.ts`

Add mock installment plans:
```typescript
export const mockInstallmentPlans: InstallmentPlan[] = [
  {
    id: '1',
    name: 'Zero Interest - 6 Months',
    durationMonths: 6,
    interestRate: 0,
    minDownPayment: 20,
    isActive: true,
    applicableCategories: ['Mobiles', 'Small Appliances']
  },
  {
    id: '2',
    name: 'Zero Interest - 12 Months',
    durationMonths: 12,
    interestRate: 0,
    minDownPayment: 15,
    isActive: true
  },
  {
    id: '3',
    name: 'Standard - 24 Months',
    durationMonths: 24,
    interestRate: 20,
    minDownPayment: 10,
    isActive: true
  }
];
```

---

## 👨‍💼 Phase 4: Admin Dashboard (MEDIUM PRIORITY)

### 4.1 Credit Officer Dashboard (US-4.2)
**What:** Admin panel to review and approve KYC documents
**Files to create:**
- `src/pages/AdminDashboard.tsx`
- `src/components/admin/KYCReviewCard.tsx`
- `src/components/admin/CreditApprovalModal.tsx`

**Features:**
- View pending KYC applications
- Review uploaded ID and utility bill images
- Approve/Reject with credit limit assignment
- Set user credit limits manually

### 4.2 Interest Rate Management (US-4.1)
**What:** Configure interest rates per product category
**Component:** `src/components/admin/InterestRateConfig.tsx`

**Features:**
- Set different rates for different categories
- Schedule promotional periods (0% interest)
- Set min/max down payment requirements

---

## 🏪 Phase 5: Store Pickup & Payment Features (MEDIUM PRIORITY)

### 5.1 Store Pickup Selection (US-3.1)
**Status:** Partially implemented in CheckoutFlow
**Enhancement needed:**
- Add branch details (address, working hours, phone)
- Show map integration (Google Maps)
- Real-time branch availability status

**Data structure:**
```typescript
export interface StoreBranch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  workingHours: string;
  mapUrl: string;
  hasStock: boolean;
}
```

### 5.2 Down Payment Only (US-3.2)
**What:** Pay only down payment online, rest as installments
**Where:** CheckoutFlow.tsx payment step
**Current:** Shows concept, needs full implementation
**Enhancement:**
- Calculate exact down payment based on selected plan
- Show payment schedule breakdown
- Generate installment contract preview

---

## 🎨 Phase 6: Design & UX Polish (LOW PRIORITY)

### 6.1 Accessibility Improvements
- [ ] Add ARIA labels to all interactive elements
- [ ] Improve alt text for images (include brand, model, price)
- [ ] Keyboard navigation support
- [ ] Screen reader testing

**Example:**
```tsx
// Better alt text
<img
  src={product.image}
  alt={`${product.brand} ${product.name} - ${product.price.toLocaleString()} EGP`}
/>

// ARIA labels
<button
  onClick={() => setShowCart(true)}
  aria-label={`Shopping cart with ${cartItemCount} items`}
>
  <ShoppingCart />
</button>
```

### 6.2 Loading States & Error Boundaries
- [ ] Add loading spinners for async operations
- [ ] Create error boundary component
- [ ] Add skeleton screens for product loading
- [ ] Handle network errors gracefully

### 6.3 Consistent Spacing System
**File:** `src/index.css`

```css
/* Add utility classes */
.section-spacing {
  @apply py-12 md:py-16 lg:py-20;
}

.card-shadow {
  @apply shadow-md hover:shadow-xl transition-shadow duration-300;
}

.input-base {
  @apply w-full px-4 py-2 border-2 border-[#F0F4F8] rounded-lg outline-none focus:border-[#003366];
}
```

---

## ⚡ Phase 7: Performance Optimization (LOW PRIORITY)

### 7.1 Code Splitting & Lazy Loading
**File:** `src/App.tsx`

```tsx
import { lazy, Suspense } from 'react';

const CheckoutFlow = lazy(() => import('./components/CheckoutFlow'));
const CreditLimitChecker = lazy(() => import('./components/CreditLimitChecker'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  {currentPage === 'checkout' && <CheckoutFlow {...props} />}
</Suspense>
```

### 7.2 Image Optimization
- [ ] Convert images to WebP format
- [ ] Implement lazy loading for product images
- [ ] Add image CDN integration
- [ ] Responsive image sizes

### 7.3 Memoization
```tsx
// Memoize expensive calculations
const monthlyPayment = useMemo(() => {
  return calculateInstallment(product.price, selectedPlan);
}, [product.price, selectedPlan]);

// Memoize product filtering
const filteredProducts = useMemo(() => {
  return products.filter(p => matchesBudget(p, budgetFilter));
}, [products, budgetFilter]);
```

---

## 🔐 Phase 8: Security & Validation (IMPORTANT)

### 8.1 Input Validation
- [ ] Validate phone numbers (Egyptian format)
- [ ] Validate National ID (14 digits)
- [ ] Sanitize user inputs
- [ ] Validate credit card inputs (Luhn algorithm)

### 8.2 File Upload Security
- [ ] Validate file types (only images for KYC)
- [ ] Limit file sizes (max 5MB)
- [ ] Scan for malware before storage
- [ ] Use secure storage URLs

---

## 📱 Phase 9: Additional Features (OPTIONAL)

### 9.1 User Account Management
- [ ] User profile page
- [ ] Order history
- [ ] Payment history & upcoming installments
- [ ] Update personal information

### 9.2 Notifications System
- [ ] Payment reminders (3 days before due date)
- [ ] Order status updates
- [ ] KYC approval notifications
- [ ] Promotional offers

### 9.3 Advanced Search & Filters
- [ ] Search autocomplete
- [ ] Filter by brand
- [ ] Filter by price range
- [ ] Filter by warranty duration
- [ ] Sort by: price, popularity, newest

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run TypeScript type checking: `npm run type-check`
- [ ] Run linter: `npm run lint`
- [ ] Run tests: `npm test`
- [ ] Build production: `npm run build`
- [ ] Test production build locally

### Environment Variables
```env
VITE_API_URL=https://api.saberstore.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_MAPS_KEY=...
VITE_SMS_GATEWAY_KEY=...
```

### Backend Requirements
- [ ] User authentication API
- [ ] Product catalog API
- [ ] Order management API
- [ ] Payment gateway integration
- [ ] KYC document storage (S3 or similar)
- [ ] SMS gateway for OTP
- [ ] Cron jobs for payment reminders

---

## 📊 Success Metrics

Track these KPIs after deployment:
- Conversion rate (visitors to purchasers)
- Average order value
- Installment plan adoption rate
- KYC approval time
- Cart abandonment rate
- Mobile vs desktop usage

---

## 🛠️ Quick Reference

### File Structure
```
saber_store/Saberstore/src/
├── components/
│   ├── Header.tsx ✅
│   ├── CheckoutFlow.tsx ✅
│   ├── ProductCard.tsx
│   ├── ProductComparison.tsx ❌ (Phase 2.2)
│   ├── admin/
│   │   ├── KYCReviewCard.tsx ❌ (Phase 4.1)
│   │   └── InterestRateConfig.tsx ❌ (Phase 4.2)
├── pages/
│   └── AdminDashboard.tsx ❌ (Phase 4)
├── types/
│   └── index.ts ⚠️ (needs Phase 3 additions)
├── data/
│   └── mockData.ts ⚠️ (needs installment plans)
└── App.tsx ✅
```

### Priority Order
1. **Phase 2** - Missing PRD features (critical for MVP)
2. **Phase 3** - Complete data model (foundation for backend)
3. **Phase 4** - Admin dashboard (operational necessity)
4. **Phase 5** - Enhanced checkout features
5. **Phase 6-9** - Polish & optimization

---

**Last Updated:** 2025-12-24
**Version:** 1.0
**Maintained by:** alisoleah
