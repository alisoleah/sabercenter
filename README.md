# 🛒 SaberStore Egypt - E-Commerce Platform

> Flexible installment shopping for Egyptian consumers - "Saber Installments"

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://saberstore.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Overview

SaberStore is a modern e-commerce platform designed specifically for the Egyptian market, offering electronics and home appliances with flexible 0% interest installment plans. Similar to B.TECH MiniCash, we make premium products accessible through "Saber Installments" - a comprehensive KYC-based credit system.

### Key Features

- ✅ **Flexible Installments**: 6, 12, 18, and 24-month payment plans with 0% interest options
- ✅ **Budget-Based Shopping**: Filter products by monthly payment budget (EGP)
- ✅ **Product Comparison**: Side-by-side comparison of warranty and installment details
- ✅ **KYC Integration**: Digital credit limit approval with document upload
- ✅ **SMS OTP Verification**: Digital contract signing via Egyptian phone numbers
- ✅ **Admin Dashboard**: Complete KYC approval and interest rate management
- ✅ **Egyptian Localization**: EGP currency, local phone formats, real store locations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/alisoleah/Saberstore.git
cd Saberstore

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useMemo)

### Planned Backend (Phase 6)
- **Framework**: Node.js + Express / NestJS
- **Database**: PostgreSQL + Redis
- **ORM**: Prisma
- **Authentication**: JWT
- **File Storage**: AWS S3 / Cloudinary
- **SMS**: Twilio / Egyptian SMS provider
- **Payment Gateway**: Paymob / Fawry / Accept Payment

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Main navigation
│   ├── Footer.tsx              # Footer with admin access
│   ├── LoginModal.tsx          # User authentication
│   ├── ProductCard.tsx         # Product display card
│   ├── BudgetFilter.tsx        # Budget-based filtering
│   ├── ProductComparison.tsx   # Side-by-side comparison
│   ├── CheckoutFlow.tsx        # Multi-step checkout
│   ├── CartModal.tsx           # Shopping cart
│   ├── SMSOTPVerification.tsx  # OTP contract signing
│   ├── CreditLimitChecker.tsx  # KYC submission
│   └── admin/
│       ├── KYCReviewCard.tsx   # KYC document review
│       └── InterestRateConfig.tsx # Rate management
├── pages/
│   └── AdminDashboard.tsx      # Admin control panel
├── data/
│   └── mockData.ts             # Sample data
├── types/
│   └── index.ts                # TypeScript interfaces
├── utils/
│   └── installmentCalculator.ts # Payment calculations
└── App.tsx                     # Main app component
```

## 🎯 Features in Detail

### 1. Saber Installments

Users can purchase products with flexible payment plans:

- **6 months** - 20% down payment, 0% interest
- **12 months** - 15% down payment, 0% interest
- **18 months** - 12% down payment, 15% interest
- **24 months** - 10% down payment, 20% interest

**Example:**
- Samsung Galaxy S24 Ultra: **45,999 EGP**
- Monthly payment (24 months): **1,917 EGP/month**

### 2. Budget Filter

Filter products by your monthly budget:
- Under 300 EGP/month
- 300-500 EGP/month
- 500-1,000 EGP/month
- 1,000-2,000 EGP/month
- 2,000-5,000 EGP/month

### 3. Product Comparison

Compare up to 3 products side-by-side:
- Price comparison (cash & old price)
- Warranty details
- Customer ratings
- Installment plans for all durations
- Detailed specifications

### 4. KYC Process

Digital credit limit application:
1. Submit National ID (14 digits)
2. Upload scanned ID photo
3. Upload utility bill
4. Provide employment details
5. Admin reviews and approves
6. Receive credit limit (up to 100,000 EGP)

### 5. SMS OTP Contract Signing

Secure installment contract verification:
- 6-digit OTP sent to Egyptian phone (01XXXXXXXXX)
- 60-second validation window
- Digital signature binding
- Legal contract generation

### 6. Admin Dashboard

Complete administrative control:
- **KYC Review**: Approve/reject applications with credit limits
- **Interest Rate Config**: Create custom installment plans
- **Analytics**: Track pending, approved, rejected applications
- **Category Management**: Set rates per product category

## 🌍 Egyptian Market Features

### Currency
- All prices in Egyptian Pounds (EGP)
- Proper EGP formatting with comma separators

### Phone Numbers
- Egyptian format: 01XXXXXXXXX (11 digits)
- Operators: Vodafone, Orange, Etisalat, WE

### Store Locations
- **Cairo**: Nasr City Branch (15 Mostafa El-Nahas St)
- **Giza**: 6th October Branch (Mall of Arabia)
- **Alexandria**: City Center Branch (Alexandria City Center)

### Governorates
- Cairo, Giza, Alexandria, Dakahlia, Sharqia, Qalyubia

## 📊 Demo Credentials

### Login
- **Demo Mode**: Any phone number + any password works
- **Test Phone**: 01012345678
- **OTP Code**: 123456

### Admin Access
- Click **Admin** link in footer (Shield icon)
- Review KYC applications
- Configure installment plans

## 🚧 Roadmap

### ✅ Phase 1-5 (Completed)
- [x] Navigation improvements
- [x] Budget filter and comparison
- [x] SMS OTP verification
- [x] Admin dashboard
- [x] Login/register system

### 🔄 Phase 6 (In Progress) - Backend & Database
- [ ] PostgreSQL database with Prisma ORM
- [ ] RESTful API with Express.js
- [ ] JWT authentication
- [ ] SMS gateway integration (Twilio)
- [ ] Payment gateway integration (Paymob)
- [ ] File storage for KYC documents (AWS S3)
- [ ] Cron jobs for payment reminders

### 📅 Phase 7 - Enhanced Checkout
- [ ] Down payment split logic
- [ ] Google Maps store locator
- [ ] Real-time stock availability

### 🎨 Phase 8-11 - Polish & Features
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] User account management
- [ ] Payment tracking dashboard
- [ ] SMS notifications

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend (when backend is ready)
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_KEY=your_key
```

### Vercel Deployment

The project is configured for Vercel with `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "vite"
}
```

## 📚 Documentation

- **[PRD & ERD](PRD&ERD)**: Complete project requirements and database schema
- **[NEXT_STEPS.md](NEXT_STEPS.md)**: Detailed implementation roadmap
- **[Analysis.md](Analysis.md)**: Technical analysis and architecture

## 🤝 Contributing

This is a personal project for the Egyptian market. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Ali Soleah**
- GitHub: [@alisoleah](https://github.com/alisoleah)
- Email: ali.soleah@gmail.com

## 🙏 Acknowledgments

- Design inspiration from B.TECH Egypt's MiniCash system
- Original Figma design: [Product Requirements Document](https://www.figma.com/design/FIufOCoA5WNWgnJJvP3YRh/Product-Requirements-Document)
- Egyptian e-commerce market research

## 📈 Project Status

**Current Version**: 2.0 (Frontend MVP)

**Status**: ✅ Frontend Complete | 🚧 Backend In Progress

**Next Milestone**: Phase 6 - Backend & Database Implementation

---

**Built with ❤️ for the Egyptian market**

*Last Updated: December 24, 2024*
