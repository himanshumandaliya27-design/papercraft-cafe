# Atelier Vélin — Production Deployment Guide for Netlify

This guide documents the end-to-end procedure for deploying **Atelier Vélin** (both the Customer Digital Ordering Site and the Staff Admin POS/KDS Site) to Netlify using the unified Firebase Firestore/Storage backend.

---

## 1. System Architecture

```
                  ┌──────────────────────────────────────────┐
                  │          Google Firebase Cloud           │
                  │  (Firestore, Auth, Storage, Security)    │
                  └─────────────▲───────────────▲────────────┘
                                │               │
                  Realtime Sync │               │ Realtime Sync
               (onSnapshot, TLS)│               │ (onSnapshot, TLS)
                                │               │
   ┌────────────────────────────┴─┐   ┌─────────┴──────────────────┐
   │    Netlify Site 1: Customer   │   │     Netlify Site 2: Admin  │
   │  Base: apps/customer-site    │   │  Base: apps/admin-site     │
   │  Publish: dist/              │   │  Publish: dist/            │
   │  https://cafe.yourdomain.com │   │  https://pos.yourdomain.com│
   └──────────────▲───────────────┘   └─────────────▲──────────────┘
                  │                                 │
                  └────── Shared Business Logic ────┘
                          (/packages/shared)
```

- **Customer Site** (`apps/customer-site`): Dine-in QR ordering, takeaway pre-ordering, table booking, live order tracking, and receipt generation.
- **Admin POS & KDS** (`apps/admin-site`): Real-time counter POS, live order kanban, fullscreen Kitchen Display (KDS), bill settlement, menu management, 6-per-A4 table QR sheet printing, and first-time setup wizard.
- **Shared Workspace** (`packages/shared`): Unified data models, Indian currency/tax formatters, synthesizer sound alerts, image compression, and Firestore services.

---

## 2. Prerequisites

1. **Node.js**: Version 20 LTS or higher (`.nvmrc` is pinned to Node 20).
2. **Firebase Project**:
   - Cloud Firestore in Production Mode (rules applied from `firestore.rules`).
   - Firebase Authentication with Email/Password enabled.
   - Firebase Storage with rules applied from `storage.rules`.
3. **Netlify Account**: Free or Pro tier.

---

## 3. Step-by-Step Deployment Instructions

### Site 1: Customer Ordering Portal

1. Log in to the [Netlify Dashboard](https://app.netlify.com) and click **"Add new site"** > **"Import an existing project"**.
2. Connect your Git repository.
3. Configure the build settings:
   - **Site Name**: `ateliervelin` (or custom name)
   - **Base directory**: `apps/customer-site`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/customer-site/dist`
4. Add Environment Variables under **Site Configuration** > **Environment variables**:

| Variable | Value | Description |
|---|---|---|
| `VITE_APP_MODE` | `production` | Enables production mode with zero fake data |
| `VITE_CUSTOMER_SITE_URL` | `https://your-customer-site.netlify.app` | Base URL used for customer routes |
| `VITE_FIREBASE_API_KEY` | *(From Firebase console)* | Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` | Cloud project ID |
| `VITE_FIREBASE_STORAGE_BUCKET`| `your-project.firebasestorage.app` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| *(From Firebase console)* | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | *(From Firebase console)* | Firebase App ID |
| `NODE_VERSION` | `20` | Pins Netlify build environment to Node 20 |

5. Click **"Deploy site"**.

---

### Site 2: Admin POS & Kitchen Management Portal

1. In Netlify, click **"Add new site"** > **"Import an existing project"** (select the **same Git repository**).
2. Configure the build settings:
   - **Site Name**: `ateliervelin-admin`
   - **Base directory**: `apps/admin-site`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/admin-site/dist`
3. Add Environment Variables under **Site Configuration** > **Environment variables**:

| Variable | Value | Description |
|---|---|---|
| `VITE_APP_MODE` | `production` | Enforces production data integrity |
| `VITE_CUSTOMER_SITE_URL` | `https://your-customer-site.netlify.app` | The public customer domain for QR codes |
| `VITE_FIREBASE_API_KEY` | *(From Firebase console)* | Same Firebase project as customer app |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` | Cloud project ID |
| `VITE_FIREBASE_STORAGE_BUCKET`| `your-project.firebasestorage.app` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| *(From Firebase console)* | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | *(From Firebase console)* | Firebase App ID |
| `NODE_VERSION` | `20` | Pins Netlify build environment to Node 20 |

4. Click **"Deploy site"**.

---

## 4. Single-Page Application (SPA) Deep Link Routing

Both sites include two layers of SPA fallback redirect configuration:
1. `_redirects` file located in the `public/` directory:
   ```text
   /*    /index.html   200
   ```
2. `netlify.toml` file located in each site's root directory:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

This ensures deep links like `/table/3`, `/orders`, or `/reports` resolve directly on page refreshes and direct QR scans without returning HTTP 404 errors.

---

## 5. Security Headers & Content Security Policy (CSP)

Pre-configured in `netlify.toml` for both applications:
- **`X-Frame-Options: DENY`**: Protects against clickjacking.
- **`X-Content-Type-Options: nosniff`**: Prevents MIME-sniffing.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Protects privacy.
- **`Content-Security-Policy`**: Permits connections only to Firebase endpoints (`*.firebaseio.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `*.firebasestorage.app`), Google Fonts, and self-hosted assets.

---

## 6. First-Time Launch & Initialization Checklist

1. **Deploy Rules**:
   - Apply Firestore rules: `firebase deploy --only firestore:rules`
   - Apply Storage rules: `firebase deploy --only storage`
2. **Bootstrap Operational Foundation**:
   - Run the zero-fake-data operational foundation seeder:
     ```bash
     npm run seed
     ```
   - This creates default seating tables, menu categories, tax configuration, and initial admin credentials without fake orders or fake customers.
3. **Log In as Owner**:
   - Navigate to your deployed Admin POS URL (`https://your-admin.netlify.app/login`).
   - Sign in with owner credentials.
4. **Complete Setup Wizard**:
   - The 7-step wizard will automatically open on first login.
   - Enter cafe legal name, address, phone (+91 format), and Merchant UPI ID.
   - Enter your public customer website URL (`https://your-customer.netlify.app`).
5. **Print Table QR Stands**:
   - Go to **Tables** > **Generate Table QR Sheets**.
   - Verify that the test links open your customer domain at `/table/1`.
   - Print or save the 6-per-page A4 cut-sheet on heavy cardstock.

---

## 7. Rollback & Troubleshooting Guide

| Issue | Root Cause | Solution |
|---|---|---|
| White screen on production load | Missing Firebase environment variables | Verify `VITE_FIREBASE_*` variables in Netlify UI. The app will render a diagnostic `MissingConfigScreen` instead of crashing. |
| QR codes open localhost or 404 | Deployed URL not set in Admin Settings | Open Admin **Settings** > **Customer Website Public URL**, input `https://your-customer-site.netlify.app`, and save. |
| Offline badge appears in admin header | Lost internet or Firestore connection | Check Wi-Fi. The admin app automatically queues edits locally and shows a warning banner until connectivity resumes. |
| Audio alert chime silent on new orders | Browser blocked autoplay before first gesture | Click anywhere on the POS interface or toggle the bell icon once to unlock the Web Audio context. |
| Build fails on Netlify: case mismatch | File imported with incorrect uppercase/lowercase | Run `npm run check:case-sensitivity` locally to identify and fix casing mismatches. |
| Need immediate version rollback | Flawed deployment or bug introduced | In Netlify Dashboard, navigate to **Deploys**, select the last stable deploy, and click **"Publish deploy"**. Instant 0-downtime rollback. |

