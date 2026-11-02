# Atelier Vélin — Specialty Cafe & Roastery Management System

A production-grade, tactile paper-crafted Cafe & Roastery Management Suite designed for specialty coffee roasteries, artisanal bakeries, and high-volume boutique cafes.

---

## 🌟 Architecture Overview

Atelier Vélin is structured as a clean, modular TypeScript monorepo powered by Vite, React 19, and Tailwind CSS v4:

```
├── apps/
│   ├── customer-site/        # Guest Ordering & Table QR Portal (Port 3001 / Netlify Site 1)
│   └── admin-site/           # Staff POS, KDS & Owner Management Suite (Port 3002 / Netlify Site 2)
├── packages/
│   └── shared/               # Universal core domain types, config, formatters, and reactive store
├── scripts/                  # Production provisioning, seeding, rules verification & E2E tests
├── firestore.rules           # Production RBAC security rules (no wildcard bypasses)
├── firestore.indexes.json    # Composite query indexes for orders, bills & bookings
└── netlify.toml              # Multi-site deployment configuration
```

---

## 🚀 Quick Start (Local Demo Simulation)

The system includes a reactive in-memory and `localStorage` state synchronizer that works immediately with zero external dependencies:

```bash
# 1. Install dependencies
npm install

# 2. Start unified dev server (Port 3000)
npm run dev

# Or run individual sub-applications:
npm --prefix apps/customer-site run dev    # Customer portal on http://localhost:3001
npm --prefix apps/admin-site run dev       # Admin POS on http://localhost:3002
```

- **Customer Experience:** `http://localhost:3000` (or `:3001`)
- **Admin & Kitchen Workspace:** `http://localhost:3000/dashboard` (or `:3002`)
- **Demo Quick-Switch:** On `/login`, toggle between **Owner** (`Clara`), **Manager** (`Arjun`), and **Kitchen** (`Julian`) with 1 click.

---

## 🔥 Real Firebase Cloud Production Setup

To transition from the local demo sandbox to production cloud synchronization across counter terminals, kitchen tablets, and guest smartphones:

### 1. Create Firebase Project & Database
1. Navigate to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project** (e.g., `ateliervelin-pos`).
2. Navigate to **Build → Firestore Database**:
   - Click **Create Database**.
   - Choose **Start in production mode** (our audited `firestore.rules` will govern access).
   - Select your preferred cloud region (e.g., `asia-south1` for Mumbai).

### 2. Enable Authentication Providers
Navigate to **Build → Authentication → Sign-in method** and activate:
- **Email/Password:** For Owner, Manager, and Counter Terminal accounts.
- **Anonymous:** For frictionless table-side guest sessions.
- **Phone:** For guest VIP loyalty recognition and order OTP verification.

### 3. Configure Firebase App Check (Recommended for Production)
1. Go to **Build → App Check**.
2. Register your web application domain with **reCAPTCHA v3** or **Enterprise**.
3. Enforce App Check on Firestore to block scrapers and unauthorized client requests.

### 4. Deploy Security Rules & Composite Indexes
Install the Firebase CLI and authenticate:
```bash
npm install -g firebase-tools
firebase login
firebase use --add <your-firebase-project-id>

# Deploy audited RBAC security rules and compound indexes:
firebase deploy --only firestore:rules,firestore:indexes
```

### 5. Create the Initial Owner Account
Execute the automated provisioning script to seed the primary Owner with custom authentication claims:
```bash
# Set your service account or environment keys, then run:
npm run create-owner
```
*Creates Owner: `clara@ateliervelin.coffee` with role claim `owner` and password credentials.*

### 6. Seed Initial Menu Catalog & Tables
Populate the 6 artisan menu categories, item customizations, and 10 dining tables:
```bash
npm run seed
```

---

## 🌐 Environment Variables for Production (Netlify)

Both applications deploy independently as static Single Page Applications (SPAs).

### Customer Site (`apps/customer-site`):
Configure in **Netlify Site Settings → Environment Variables**:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="ateliervelin-pos.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ateliervelin-pos"
VITE_FIREBASE_STORAGE_BUCKET="ateliervelin-pos.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="808993518956"
VITE_FIREBASE_APP_ID="1:808993518956:web:15467..."
VITE_ADMIN_PORTAL_URL="https://admin.ateliervelin.coffee"
```

### Admin Site (`apps/admin-site`):
Configure in **Netlify Site Settings → Environment Variables**:
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="ateliervelin-pos.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ateliervelin-pos"
VITE_FIREBASE_STORAGE_BUCKET="ateliervelin-pos.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="808993518956"
VITE_FIREBASE_APP_ID="1:808993518956:web:15467..."
VITE_CUSTOMER_PORTAL_URL="https://ateliervelin.coffee"
```

Both sites include automated SPA routing redirect rules (`_redirects`):
```text
/*    /index.html   200
```

---

## 🧪 Comprehensive Verification & Test Suites

The codebase includes an exhaustive automated test battery covering end-to-end user journeys, security rules, accessibility, and QR code generation:

### 1. Playwright Dual-Origin End-to-End Proof (`npm run test:e2e`)
Runs the customer app (port 5173) and admin portal (port 5174) concurrently and asserts all 8 production lifecycle scenarios:
```bash
npm run test:e2e
```
- **Scenario 1:** Order placed on customer site appears on admin Live Orders board without refresh.
- **Scenario 2:** Admin status advancement updates customer tracker live via reactive synchronizer.
- **Scenario 3:** Marking paid creates the bill, updates customer CRM lifetime metrics, and refreshes KPIs.
- **Scenario 4:** Concurrency stress test: 2 simultaneous booking attempts for the same slot yield exactly 1 success.
- **Scenario 5:** Anti-tampering engine rejects price alterations, negative quantities, and 86'd out-of-stock items.
- **Scenario 6:** RBAC route guards: Staff user is barred from `/settings`, `/staff`, `/reports`, and `/customers`.
- **Scenario 7:** Cross-tenant order isolation: Guests cannot read tickets of other customers.
- **Scenario 8:** Master switch enforcement: Order submission fails when `acceptingOrders` is disabled.

### 2. Firestore Security Rules Unit Matrix (`npm run test:rules`)
Validates all 12 collections across 5 roles (Anonymous, Customer, Staff, Manager, Owner) over all 4 CRUD operations (240 assertions):
```bash
npm run test:rules
```

### 3. QR Code Encoding & Routing Test (`npm run test:qr`)
Validates high-density QR payload generation and deep linking for all tables 01 through 10:
```bash
npm run test:qr
```

### 4. Axe-Core Accessibility Audit (`npm run test:a11y`)
Executes automated WCAG 2.1 AA accessibility checks across all primary routes:
```bash
npm run test:a11y
```

### 5. Type Checking & Production Compilation
```bash
npx tsc --noEmit                                    # 0 TypeScript errors
npm run build                                       # Root bundle
npm --prefix apps/customer-site run build           # Customer SPA
npm --prefix apps/admin-site run build              # Admin SPA
npm audit                                           # 0 vulnerabilities
```

---

## ☕ License & Attribution

Designed and engineered for **Atelier Vélin Speciality Roasters**. Crafted with authentic paper aesthetics, brass counter service chimes, and enterprise-grade operational resilience.
