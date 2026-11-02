const { buildSync } = require('esbuild');
const path = require('path');
const fs = require('fs');

console.log('=====================================================');
console.log('VERIFYING PRODUCTION BUILD INTEGRITY (ESBUILD)');
console.log('=====================================================\n');

let failed = false;
const tempOutDir = path.resolve(__dirname, '.temp_bundle');
if (!fs.existsSync(tempOutDir)) {
  fs.mkdirSync(tempOutDir, { recursive: true });
}

// 1. Verify Customer Site Build
try {
  console.log('1. Testing bundling for apps/customer-site/src/main.tsx...');
  const resultCustomer = buildSync({
    entryPoints: [path.resolve(__dirname, '../apps/customer-site/src/main.tsx')],
    bundle: true,
    outdir: tempOutDir,
    platform: 'browser',
    format: 'esm',
    jsx: 'automatic',
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.webp': 'dataurl',
      '.svg': 'text',
      '.css': 'css',
    },
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'firebase',
      'firebase/*',
      'canvas-confetti',
      'lucide-react',
      'motion',
      'jspdf',
      'tailwindcss',
      'qrcode',
    ],
  });

  console.log('[PASS] Customer site bundled successfully with zero syntax/import errors!');
} catch (err) {
  console.error('[FAIL] Customer site build failed:', err.message);
  failed = true;
}

// 2. Verify Admin Site Build
try {
  console.log('\n2. Testing bundling for apps/admin-site/src/main.tsx...');
  const resultAdmin = buildSync({
    entryPoints: [path.resolve(__dirname, '../apps/admin-site/src/main.tsx')],
    bundle: true,
    outdir: tempOutDir,
    platform: 'browser',
    format: 'esm',
    jsx: 'automatic',
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.webp': 'dataurl',
      '.svg': 'text',
      '.css': 'css',
    },
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'firebase',
      'firebase/*',
      'canvas-confetti',
      'lucide-react',
      'motion',
      'qrcode',
      'jspdf',
      'tailwindcss',
    ],
  });

  console.log('[PASS] Admin site bundled successfully with zero syntax/import errors!');
} catch (err) {
  console.error('[FAIL] Admin site build failed:', err.message);
  failed = true;
}

// Cleanup temp bundle
try {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
} catch (e) {}

console.log('\n=====================================================');
if (failed) {
  console.log('BUILD VERIFICATION FAILED');
  process.exit(1);
} else {
  console.log('ALL MONOREPO SITES PASSED PRODUCTION BUNDLE VERIFICATION');
}
console.log('=====================================================\n');

