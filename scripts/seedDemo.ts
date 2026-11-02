/**
 * Atelier Vélin — Demo Seeding Script (scripts/seedDemo.ts)
 * Run with: npm run seed:demo
 *
 * SAFETY GUARD:
 * Refuses to run against any Firebase project whose ID matches VITE_PRODUCTION_PROJECT_ID
 * unless the flag --force-demo is explicitly passed.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import {
  SAMPLE_MENU_ITEMS,
  INITIAL_TABLE_STATES,
  SAMPLE_CUSTOMERS,
  SAMPLE_ORDERS,
  SAMPLE_BOOKINGS,
  SAMPLE_EXPENSES,
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

const productionProjectId = process.env.VITE_PRODUCTION_PROJECT_ID || '';
const hasForceFlag = process.argv.includes('--force-demo');

async function seedDemoData() {
  console.log('--- ATELIER VÉLIN DEMO DATA SEEDER ---');

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Missing VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID.');
    process.exit(1);
  }

  // Production guard
  if (
    productionProjectId &&
    firebaseConfig.projectId.toLowerCase() === productionProjectId.toLowerCase()
  ) {
    if (!hasForceFlag) {
      console.error('\n🚨 SAFETY GUARD BLOCKED DEMO SEEDING:');
      console.error(
        `Your target Firebase Project ("${firebaseConfig.projectId}") matches VITE_PRODUCTION_PROJECT_ID ("${productionProjectId}").`
      );
      console.error('Fabricated customers, fake orders, and demo revenue must NEVER be injected into a production database.');
      console.error('If you genuinely intend to seed demo data into production, you must rerun with:');
      console.error('  npm run seed:demo -- --force-demo\n');
      process.exit(1);
    } else {
      console.warn('\n⚠️ WARNING: --force-demo flag detected. Overriding production safety guard.\n');
    }
  }

  console.log(`Connecting to Firebase project: ${firebaseConfig.projectId}...`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const batch = writeBatch(db);

  console.log(`Seeding demo menu items (${SAMPLE_MENU_ITEMS.length})...`);
  SAMPLE_MENU_ITEMS.forEach((item) => {
    batch.set(doc(db, 'menuItems', item.id), item);
  });

  console.log(`Seeding demo tables (${INITIAL_TABLE_STATES.length})...`);
  INITIAL_TABLE_STATES.forEach((table) => {
    batch.set(doc(db, 'tables', String(table.number)), table);
  });

  console.log(`Seeding demo customers (${SAMPLE_CUSTOMERS.length})...`);
  SAMPLE_CUSTOMERS.forEach((customer) => {
    batch.set(doc(db, 'customers', customer.id), customer);
  });

  console.log(`Seeding demo historical orders (${SAMPLE_ORDERS.length})...`);
  SAMPLE_ORDERS.forEach((order) => {
    batch.set(doc(db, 'orders', order.id), order);
  });

  console.log(`Seeding demo reservations (${SAMPLE_BOOKINGS.length})...`);
  SAMPLE_BOOKINGS.forEach((booking) => {
    batch.set(doc(db, 'bookings', booking.id), booking);
  });

  console.log(`Seeding demo expenses (${SAMPLE_EXPENSES.length})...`);
  SAMPLE_EXPENSES.forEach((exp) => {
    batch.set(doc(db, 'expenses', exp.id), exp);
  });

  await batch.commit();
  console.log('✅ Demo dataset successfully committed to Firestore database!');
}

seedDemoData().catch((err) => {
  console.error('Demo seeding failed:', err);
  process.exit(1);
});
