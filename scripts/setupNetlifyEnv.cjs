const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    }
  });
}

const token = 'nfp_G2VyR662zL6sx1TfekscXFRYUXY3tmBn76a8';
const accountId = '6a59616c37f94fd2f54d3e34';

const customerSiteId = '04aed8ed-3c1a-4ea8-bcf1-fe3c4afcfa6f';
const adminSiteId = 'b1a00e99-ca5a-4819-8b45-13af9f827c81';

const commonEnv = {
  NODE_VERSION: '20',
  NPM_FLAGS: '--legacy-peer-deps',
  VITE_APP_MODE: 'production',
  VITE_CUSTOMER_SITE_URL: 'https://atelier-velin-customer.netlify.app',
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || '',
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || '',
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || ''
};

function deleteEnv(siteId, key) {
  return new Promise((resolve) => {
    const req = https.request('https://api.netlify.com/api/v1/accounts/' + accountId + '/env/' + key + '?site_id=' + siteId, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ key, status: res.statusCode }));
    });
    req.end();
  });
}

function setEnv(siteId, key, value) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify([{
      key: key,
      scopes: ['builds', 'functions', 'runtime', 'post_processing'],
      values: [{ context: 'all', value: value }]
    }]);

    const req = https.request('https://api.netlify.com/api/v1/accounts/' + accountId + '/env?site_id=' + siteId, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function configureSite(siteName, siteId) {
  console.log(`\nConfiguring environment variables for ${siteName} (${siteId})...`);
  for (const [key, val] of Object.entries(commonEnv)) {
    try {
      await deleteEnv(siteId, key);
      const res = await setEnv(siteId, key, val);
      console.log(`  - [${res.status}] ${key} = ${val.slice(0, 15)}...`);
    } catch (err) {
      console.error(`  - Failed to set ${key}:`, err.message);
    }
  }
}

async function run() {
  await configureSite('Customer Site', customerSiteId);
  await configureSite('Admin Site', adminSiteId);
  console.log('\nAll Netlify environment variables successfully synchronized!');
}

run();
