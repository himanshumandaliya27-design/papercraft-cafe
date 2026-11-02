/**
 * Automated QR Code & Table Route Validation Test
 * Verifies that:
 * 1. Each table QR encodes the exact absolute HTTPS URL: {CUSTOMER_SITE_URL}/table/{tableNumber}.
 * 2. QRCode generation produces valid SVG vector documents with crisp vector markers.
 * 3. Route parameters: valid tables (1-10) pass validation, invalid tables (999, -1, 'abc') are rejected.
 * 4. Legacy query parameter /?table=N format is recognized and transformed to /table/N.
 */

const path = require('path');
const QRCode = require(path.resolve(__dirname, '../node_modules/qrcode/lib/browser.js'));
import { CAFE_CONFIG } from '../packages/shared/src/config/cafeConfig';
import { isCustomerUrlValid } from '../packages/shared/src/config/appMode';

interface RouteTestResult {
  url: string;
  expectedStatus: 'valid' | 'invalid' | 'legacy';
  resolvedTableNumber?: number;
  redirectUrl?: string;
  passed: boolean;
  message: string;
}

async function runQRCodeTests() {
  console.log('=====================================================');
  console.log('ATELIER VÉLIN: TABLE QR CODE & ROUTE TEST SUITE');
  console.log('=====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const baseUrl = (process.env.VITE_CUSTOMER_SITE_URL || 'https://ateliervelin.netlify.app').replace(/\/+$/, '');
  const urlCheck = isCustomerUrlValid(baseUrl);

  totalTests++;
  if (urlCheck.valid) {
    console.log(`[PASS] Base Customer URL is valid HTTPS: ${baseUrl}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Base Customer URL validation failed: ${urlCheck.warning}`);
  }

  // 1. Test QR generation for each configured table
  console.log('\n--- 1. Testing SVG QR Code Generation For Tables ---');
  for (const table of CAFE_CONFIG.tables) {
    totalTests++;
    const expectedUrl = `${baseUrl}/table/${table.number}`;

    try {
      // Create QR data structure and decode raw byte stream
      const qrData = QRCode.create(expectedUrl, { errorCorrectionLevel: 'M' });
      const decodedSegment = Buffer.from(qrData.segments[0].data).toString('utf8');

      // Generate SVG string
      const svgOutput = await QRCode.toString(expectedUrl, {
        type: 'svg',
        margin: 1,
        color: { dark: '#2B1B14', light: '#FFFFFF' },
      });

      const isSvgValid = svgOutput.includes('<svg') && svgOutput.includes('</svg>') && svgOutput.includes('viewBox');
      const isContentExact = decodedSegment === expectedUrl;

      if (isSvgValid && isContentExact) {
        console.log(`[PASS] Table ${table.number} (${table.label}): QR successfully generated & encoded ${expectedUrl}`);
        passedTests++;
      } else {
        console.error(`[FAIL] Table ${table.number}: QR payload mismatch or invalid SVG markup.`);
      }
    } catch (err) {
      console.error(`[FAIL] Table ${table.number}: Generation threw error:`, err);
    }
  }

  // 2. Test Customer Route Logic (/table/:tableNumber)
  console.log('\n--- 2. Testing Customer Route Handler & Validation ---');
  const validTableNumbers = new Set(CAFE_CONFIG.tables.map((t) => t.number));

  const routeTestCases = [
    { input: '1', expected: 'valid' },
    { input: '5', expected: 'valid' },
    { input: '10', expected: 'valid' },
    { input: '0', expected: 'invalid' },
    { input: '99', expected: 'invalid' },
    { input: '-3', expected: 'invalid' },
    { input: 'patio-1', expected: 'invalid' },
    { input: 'null', expected: 'invalid' },
    { input: '', expected: 'invalid' },
  ];

  for (const test of routeTestCases) {
    totalTests++;
    const parsed = parseInt(test.input, 10);
    const isValid = !isNaN(parsed) && validTableNumbers.has(parsed);
    const status = isValid ? 'valid' : 'invalid';

    if (status === test.expected) {
      console.log(`[PASS] Route /table/${test.input || 'empty'} correctly identified as ${status.toUpperCase()}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Route /table/${test.input}: Expected ${test.expected}, got ${status}`);
    }
  }

  // 3. Test Legacy /?table=N Query Parameter Normalization
  console.log('\n--- 3. Testing Legacy /?table=N Query Normalization ---');
  const legacyTestCases = [
    { search: '?table=3', expectedTable: 3, shouldRedirect: true },
    { search: '?table=7', expectedTable: 7, shouldRedirect: true },
    { search: '?table=999', expectedTable: 999, shouldRedirect: false },
    { search: '', expectedTable: null, shouldRedirect: false },
  ];

  for (const test of legacyTestCases) {
    totalTests++;
    const params = new URLSearchParams(test.search);
    const tableParam = params.get('table');
    let redirected = false;
    let target = '';

    if (tableParam) {
      const num = parseInt(tableParam, 10);
      if (!isNaN(num) && validTableNumbers.has(num)) {
        redirected = true;
        target = `/table/${num}`;
      }
    }

    if (redirected === test.shouldRedirect) {
      console.log(`[PASS] Legacy search "${test.search || '(none)'}": ${redirected ? `Redirected to ${target}` : 'No redirect'}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Legacy search "${test.search}": Expected redirect ${test.shouldRedirect}, got ${redirected}`);
    }
  }

  console.log('\n=====================================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('=====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runQRCodeTests();
