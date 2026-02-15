# 🔐 Admin Dashboard Access Guide

## How to Access Admin Page

### Method 1: Footer Link (Easiest)

1. **Start the frontend:**
```bash
npm run dev
```

2. **Open in browser:**
```
http://localhost:5173
```

3. **Scroll to bottom of page**

4. **Look for the footer**

5. **Click the "Admin" link** (has a Shield icon 🛡️)
   - Located in footer next to "Privacy Policy"
   - Bottom-right corner

6. **You're now on the Admin Dashboard!**

---

### Method 2: Direct URL

Simply navigate to:
```
http://localhost:5173/#admin
```

Or modify the URL state (the app uses state-based routing, not URL routing)

---

## 📊 Admin Dashboard Features

Once you're on the admin page, you'll see:

### Tab 1: KYC Applications
- **Stats Bar:** Total, Pending, Approved, Rejected counts
- **Filter:** View All / Pending Only
- **KYC Cards:**
  - User information
  - National ID
  - Monthly salary
  - Suggested credit limit (10x salary, max 100k EGP)
  - Documents (ID photo, utility bill)
  - Approve/Reject buttons

**Actions:**
- Click "View Documents" to see uploaded files
- Click "Review" to approve/reject
- Set custom credit limit
- Applications update in real-time

### Tab 2: Interest Rate Config
- **Create New Plans:**
  - Plan name
  - Duration (6, 12, 18, 24 months)
  - Interest rate (0-30%)
  - Min down payment (0-50%)

- **Manage Existing Plans:**
  - Toggle active/inactive
  - View applicable categories
  - See promotional periods

- **Category-Specific Rates:**
  - View which categories have special plans
  - See plan counts per category

---

## 🎨 Admin Dashboard UI

### Current Design (From Your Code):

**Header:**
```
┌─────────────────────────────────────────┐
│ 📊 SaberStore Admin Dashboard          │
│                                         │
│ [KYC Applications] [Interest Rates]    │
└─────────────────────────────────────────┘
```

**KYC Tab:**
```
┌─────────────────────────────────────────┐
│ Stats:                                  │
│ Total: 3 | Pending: 2 | Approved: 1    │
│                                         │
│ [Filter: All ▼]                        │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ 👤 Ahmed Mohamed                │   │
│ │ 📱 01012345678                  │   │
│ │ 💼 Vodafone Egypt               │   │
│ │ 💰 Salary: 12,000 EGP           │   │
│ │ 📊 Suggested: 100,000 EGP       │   │
│ │                                  │   │
│ │ [View Documents] [Review]       │   │
│ └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Interest Rate Tab:**
```
┌─────────────────────────────────────────┐
│ Interest Rate Configuration             │
│                            [+ New Plan]  │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ Zero Interest - 6 Months        │   │
│ │ 📅 6 months | 💳 0% | 💰 20%  │   │
│ │                      [Active ✓] │   │
│ └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔒 Security Notes

### Current State (Development):
- ❌ **No authentication required** - Anyone can access admin
- ⚠️ This is fine for development
- ⚠️ DO NOT deploy to production without authentication

### Future Implementation (Phase 6 Week 1):
Once backend authentication is ready:
```typescript
// Will add admin route protection
if (currentUser?.role !== 'admin') {
  return <Navigate to="/" />;
}
```

---

## 🧪 Test Data (Mock KYC Applications)

Your admin dashboard currently shows **mock data** from `src/data/mockData.ts`:

### Application 1: Ahmed Mohamed
- **Phone:** 01012345678
- **National ID:** 29501011234567
- **Employer:** Vodafone Egypt
- **Salary:** 12,000 EGP/month
- **Status:** Pending
- **Suggested Limit:** 100,000 EGP

### Application 2: Fatima Hassan
- **Phone:** 01123456789
- **National ID:** 29205151234568
- **Employer:** Banque Misr
- **Salary:** 15,000 EGP/month
- **Status:** Approved
- **Credit Limit:** 100,000 EGP

### Application 3: Omar Khalil
- **Phone:** 01234567890
- **National ID:** 28812011234569
- **Employer:** Etisalat Egypt
- **Salary:** 8,500 EGP/month
- **Status:** Pending
- **Suggested Limit:** 85,000 EGP

---

## 🚀 Making It Work With Real Backend

Once backend is ready (Phase 6 Week 3):

1. **Replace mock data with API calls:**
```typescript
// In AdminDashboard.tsx
const [applications, setApplications] = useState([]);

useEffect(() => {
  fetch('http://localhost:3000/api/admin/kyc/pending')
    .then(res => res.json())
    .then(data => setApplications(data));
}, []);
```

2. **Add real approve/reject functions:**
```typescript
const handleApprove = async (userId: string, creditLimit: number) => {
  await fetch(`http://localhost:3000/api/admin/kyc/approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, creditLimit })
  });
  // Refresh list
};
```

3. **Add authentication check:**
```typescript
// Check if logged-in user is admin
if (!currentUser || currentUser.role !== 'admin') {
  navigate('/');
}
```

---

## 📸 Screenshots Reference

**Footer Admin Link:**
```
┌──────────────────────────────────────────────┐
│ © 2024 SaberStore Egypt. All rights reserved.│
│                                              │
│ [Terms] [Privacy] [🛡️ Admin]              │
└──────────────────────────────────────────────┘
```

**Color Scheme:**
- Background: `#003366` (Navy Blue)
- Accent: `#FF6600` (Orange)
- Success: `#00C851` (Green)
- Text: White/Gray

---

## 🎯 Quick Test

1. Start frontend: `npm run dev`
2. Open: `http://localhost:5173`
3. Scroll to footer
4. Click "Admin" (with Shield icon)
5. You should see:
   - KYC Applications tab
   - 3 mock applications
   - Stats showing: Total: 3, Pending: 2, Approved: 1

**If you don't see the Admin link:**
- Check `src/App.tsx` line 309: `{currentPage !== 'admin' && <Footer onAdminClick={() => setCurrentPage('admin')} />}`
- The footer passes `onAdminClick` which changes page to 'admin'

---

## 🐛 Troubleshooting

### "I don't see the Admin link in footer"
- Make sure you're on the home page
- Scroll all the way to bottom
- Look for a small Shield icon next to Privacy Policy

### "Clicking Admin does nothing"
- Check browser console for errors (F12)
- Verify `src/components/Footer.tsx` has the Admin button
- Check `src/App.tsx` has `{currentPage === 'admin' && <AdminDashboard />}`

### "Admin page is blank"
- Check if `src/pages/AdminDashboard.tsx` exists
- Look for import errors in browser console
- Verify all admin components are in `src/components/admin/`

---

## 💡 Pro Tip

**Keyboard Shortcut (Future):**
You could add this to `src/App.tsx`:
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Press Ctrl+Shift+A to open admin
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      setCurrentPage('admin');
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

**Last Updated:** 2024-12-24
**Your Frontend:** All admin features are ready!
**Your Backend:** Setting up now (Phase 6 Week 1)
