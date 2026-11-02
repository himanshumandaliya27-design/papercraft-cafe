/**
 * Atelier Vélin Production Base Seeding Script
 * Run with: npm run seed
 * Populates live Firestore database with clean operational foundation:
 * - Table topology (10 dine-in tables)
 * - Starter menu items (clean catalog)
 * - Default cafe settings
 * NEVER injects fake customers, past orders, fake reviews, or fake revenue into production!
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import {
  SAMPLE_MENU_ITEMS,
  INITIAL_TABLE_STATES,
} from '../packages/shared/src/data/sampleCafeData';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

async function seedProductionBase() {
  console.log('--- ATELIER VÉLIN PRODUCTION BASE INITIALIZATION ---');

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Missing VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID in environment.');
    process.exit(1);
  }

  console.log(`Target Firestore: ${firebaseConfig.projectId}`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const batch = writeBatch(db);

  // 1. Initial Tables
  console.log(`Seeding clean tables (${INITIAL_TABLE_STATES.length})...`);
  INITIAL_TABLE_STATES.forEach((table) => {
    const cleanTable = {
      ...table,
      status: 'free',
      activeOrderId: null,
      lastOccupiedAt: null,
    };
    batch.set(doc(db, 'tables', String(table.number)), cleanTable);
  });

  // 2. Base Menu Catalog
  console.log(`Seeding base menu catalog items (${SAMPLE_MENU_ITEMS.length})...`);
  SAMPLE_MENU_ITEMS.forEach((item) => {
    batch.set(doc(db, 'menuItems', item.id), item);
  });

  // 3. Default General Settings Document
  console.log('Initializing settings/general document...');
  batch.set(
    doc(db, 'settings', 'general'),
    {
      cafeName: 'Atelier Vélin',
      tagline: 'Specialty Coffee & Papercraft Bakery',
      customerSiteUrl: process.env.VITE_CUSTOMER_SITE_URL || '',
      adminSiteUrl: process.env.VITE_ADMIN_PORTAL_URL || '',
      phone: '+91 98200 12345',
      email: 'contact@ateliervelin.coffee',
      address: 'Shop 4, Heritage Arcade, Roastery Lane, Bandra West, Mumbai 400050',
      currency: '₹',
      gstRate: 5,
      serviceChargeRate: 0,
      upiId: 'ateliervelin@okhdfcbank',
      acceptCash: true,
      autoConfirmBookings: false,
      enableWebPush: false,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await batch.commit();
  console.log('✅ Production base records initialized with ZERO fake customers or historical orders!');
}

seedProductionBase().catch((err) => {
  console.error('Seeding base encountered an error:', err);
  process.exit(1);
});
