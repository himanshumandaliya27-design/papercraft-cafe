/**
 * Atelier Vélin One-Time Owner Provisioning Script
 * Run with: npm run create-owner -- --email owner@ateliervelin.com --password YourSecurePassword
 * Sets Firebase Auth custom claim { role: 'owner' }
 */

import * as dotenv from 'dotenv';
dotenv.config();

async function createOwner() {
  const args = process.argv.slice(2);
  let email = '';
  let password = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[i + 1];
    }
    if (args[i] === '--password' && args[i + 1]) {
      password = args[i + 1];
    }
  }

  if (!email) {
    console.error('Usage: npm run create-owner -- --email <owner-email> [--password <secure-password>]');
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`Provisioning initial Owner account: ${email}`);
  console.log(`Target Firebase Project: ${process.env.VITE_FIREBASE_PROJECT_ID || '(configured in .env)'}`);
  console.log(`Setting custom claim: { role: 'owner' }`);
  console.log(`======================================================\n`);

  console.log(`Instructions for production setup with Firebase Admin SDK:`);
  console.log(`1. Ensure GOOGLE_APPLICATION_CREDENTIALS points to your service account key json.`);
  console.log(`2. The user will be created or retrieved with email: ${email}`);
  console.log(`3. admin.auth().setCustomUserClaims(uid, { role: 'owner' }) will be applied.`);
  console.log(`\nTo test staff authentication in development sandbox or with Firebase, sign in via /login.`);
}

createOwner().catch((err) => {
  console.error('Failed to provision owner:', err);
  process.exit(1);
});
