# 🧶 KnitNations - Modern Clothing E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-FDC82F?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**KnitNations** is a full-stack e-commerce platform built with Next.js 14 (App Router), Firebase backend, and Redux state management. It offers a seamless shopping experience for men's and women's clothing, featuring product catalogs, secure payments, user authentication with OTP, order management, and admin tools for bulk product uploads.

Live Demo: knit-nation.vercel.app/home (after setup)

## ✨ Features

- **User Authentication**: Phone/OTP-based login & registration with Firebase Auth
- **Product Catalog**: Browse men's/women's collections (cargo pants, bootcut, straight-fit, etc.) with subcategory filtering
- **Product Details**: Rich previews, image sliders, size charts, add-to-cart
- **Shopping Cart & Orders**: Persistent cart (Redux), order history, success tracking
- **Payments**: Integrated Cashfree/Razorpay with verification
- **Address Management**: Form-based address selection
- **Admin Dashboard**: Add single/bulk products via Excel upload (XLSX parsing)
- **Responsive UI**: TailwindCSS + Framer Motion animations, Lucide icons, Slick carousels
- **PWA Ready**: Optimized images, fonts, SEO-friendly
- **Backend**: Firestore (products in `mens`/`womens`), Firebase Storage (images), Cloud Functions

## 📱 Screenshots

| Home Page | Product Collection |
|-----------|--------------------|
| ![Home](https://via.placeholder.com/600x300?text=Home+Page) <!-- Replace with public/home-screenshot.png --> | ![Collection](https://via.placeholder.com/600x300?text=Women%27s+Collection) |

| Product Details | Cart/Checkout |
|-----------------|---------------|
| ![Product](https://via.placeholder.com/600x300?text=Product+Details) | ![Cart](https://via.placeholder.com/600x300?text=Cart+%26+Checkout) |

*(Add actual screenshots to `/public/` and update links)*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Firebase Project](https://console.firebase.google.com) (enable Auth, Firestore, Storage)
- Cashfree/Razorpay sandbox accounts for payments

### Setup
1. Clone/Download the repo:
   ```bash
   git clone <your-repo> knitnations
   cd knitnations
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` (copy from below & fill your values):
   ```env
   # Firebase (from Project Settings > Web App)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=yourproject
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
   NEXT_PUBLIC_OWNER_UID=your_admin_uid

   # Payments
   CASHFREE_APP_ID=your_cashfree_app_id
   CASHFREE_SECRET_KEY=your_cashfree_secret_key
   ```

4. Run locally:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🔥 Deployment

1. Build & Deploy to Firebase:
   ```bash
   npm run deploy
   ```

2. Or deploy to Vercel/Netlify (update env vars):
   ```bash
   npm run build
   # Deploy via CLI/GUI
   ```

**Note**: Update `firebase.json` with your hosting site if multi-site.

## 🛠️ Tech Stack

| Frontend | Backend | Tools |
|----------|---------|-------|
| Next.js 14, React 18 | Firebase (Auth/Firestore/Storage/Functions) | TailwindCSS, Redux Toolkit |
| Framer Motion, GSAP | Razorpay/Cashfree | Lucide React, React Slick |
| Headless UI (Radix) | API Routes | ESLint, Prettier |

## 📂 Project Structure
```
knitnations/
├── app/              # App Router pages & API routes
├── components/       # Reusable UI (ProductDetails, Cart, etc.)
├── redux/            # State management
├── public/           # Static assets (images, logo)
├── functions/        # Firebase Cloud Functions
├── lib/utils.js      # Shadcn/UI utils
└── styles/           # CSS modules
```

## 🤝 Contributing
1. Fork & PR
2. Follow ESLint/Prettier
3. Add tests for new features
4. Update README

## 📄 License
MIT - See [LICENSE](LICENSE) (add if needed)

## 🙌 Support
Issues/PRs welcome! ⭐ Star on GitHub.

**Built with ❤️ by [Your Name]**

