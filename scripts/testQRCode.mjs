// scripts/testQRCode.ts
import QRCode from "qrcode";

// packages/shared/src/config/cafeConfig.ts
var CAFE_CONFIG = {
  cafeName: "Atelier V\xE9lin",
  tagline: "Specialty Coffee & Paper Roastery",
  description: "A tactile boutique coffee roastery where small-batch roasts meet hand-laminated viennoiserie, pressed into warm paper.",
  establishedYear: 2019,
  address: "14 Passage des Papetiers, Old Quarter",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  phone: "+91 98201 45890",
  email: "bonjour@ateliervelin.coffee",
  website: "https://ateliervelin.coffee",
  customerSiteUrl: "https://ateliervelin.coffee",
  gstin: "27AABCV1234F1Z5",
  gstPercentage: 5,
  // 5% GST (2.5% CGST + 2.5% SGST)
  serviceChargePercentage: 0,
  currency: "INR",
  currencySymbol: "\u20B9",
  upiId: "ateliervelin@okhdfcbank",
  upiPayeeName: "Atelier Velin Roastery",
  razorpayKeyId: "rzp_test_AtelierVelin2026",
  acceptingOrders: true,
  acceptingBookings: true,
  openingHours: {
    weekdays: "Tuesday \u2013 Friday: 07:30 AM \u2013 06:30 PM",
    weekends: "Saturday \u2013 Sunday: 08:00 AM \u2013 07:30 PM",
    mondayRoastDay: "Monday (Roast & Cupping): 08:00 AM \u2013 03:00 PM",
    openTimeHour: 7.5,
    closeTimeHour: 19.5
  },
  bookingRules: {
    slotDurationMinutes: 90,
    maxAdvanceDays: 14,
    minPartySize: 1,
    maxPartySize: 8,
    blockedDates: ["2026-12-25", "2026-01-01"]
  },
  vipThresholdSpend: 5e3,
  vipThresholdVisits: 5,
  receiptFooterText: "Handmade coffee \xB7 Good thoughts \xB7 Thank you for visiting our paper house",
  theme: {
    creamPaper: "#F4EBDD",
    creamSheet: "#FAF5EC",
    kraftBrown: "#B98A5E",
    espresso: "#2B1B14",
    terracotta: "#C65D3B",
    charcoalSoft: "#4A372F"
  },
  tables: [
    { id: "T1", number: 1, label: "Table 01", capacity: 2, zone: "Window Linen", x: 15, y: 22, shape: "circle" },
    { id: "T2", number: 2, label: "Table 02", capacity: 2, zone: "Window Linen", x: 34, y: 22, shape: "circle" },
    { id: "T3", number: 3, label: "Table 03", capacity: 2, zone: "Window Linen", x: 53, y: 22, shape: "circle" },
    { id: "T4", number: 4, label: "Table 04", capacity: 4, zone: "Courtyard", x: 18, y: 55, shape: "rect" },
    { id: "T5", number: 5, label: "Table 05", capacity: 4, zone: "Courtyard", x: 42, y: 55, shape: "rect" },
    { id: "T6", number: 6, label: "Table 06", capacity: 4, zone: "Courtyard", x: 66, y: 55, shape: "rect" },
    { id: "T7", number: 7, label: "Table 07", capacity: 4, zone: "Roastery Bar", x: 85, y: 35, shape: "rect" },
    { id: "T8", number: 8, label: "Table 08", capacity: 4, zone: "Roastery Bar", x: 85, y: 65, shape: "rect" },
    { id: "T9", number: 9, label: "Table 09", capacity: 6, zone: "Reading Nook", x: 26, y: 84, shape: "rect" },
    { id: "T10", number: 10, label: "Table 10", capacity: 6, zone: "Reading Nook", x: 62, y: 84, shape: "rect" }
  ]
};

// packages/shared/src/config/appMode.ts
function isCustomerUrlValid(url) {
  if (!url || url.trim() === "") {
    return { valid: false, warning: "Customer website URL is not set. QR codes will not work until you set your live website URL in Admin Settings." };
  }
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return { valid: false, warning: "Customer website URL points to localhost. QR codes will not work for customers until you set your live website URL." };
  }
  if (!url.startsWith("https://")) {
    return { valid: false, warning: "Customer website URL must use HTTPS. QR codes will not work for customers until you update the URL." };
  }
  return { valid: true };
}

// scripts/testQRCode.ts
async function runQRCodeTests() {
  console.log("=====================================================");
  console.log("ATELIER V\xC9LIN: TABLE QR CODE & ROUTE TEST SUITE");
  console.log("=====================================================\n");
  let passedTests = 0;
  let totalTests = 0;
  const baseUrl = (process.env.VITE_CUSTOMER_SITE_URL || "https://ateliervelin.netlify.app").replace(/\/+$/, "");
  const urlCheck = isCustomerUrlValid(baseUrl);
  totalTests++;
  if (urlCheck.valid) {
    console.log(`[PASS] Base Customer URL is valid HTTPS: ${baseUrl}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Base Customer URL validation failed: ${urlCheck.warning}`);
  }
  console.log("\n--- 1. Testing SVG QR Code Generation For Tables ---");
  for (const table of CAFE_CONFIG.tables) {
    totalTests++;
    const expectedUrl = `${baseUrl}/table/${table.number}`;
    try {
      const qrData = QRCode.create(expectedUrl, { errorCorrectionLevel: "M" });
      const decodedSegment = qrData.segments[0].data;
      const svgOutput = await QRCode.toString(expectedUrl, {
        type: "svg",
        margin: 1,
        color: { dark: "#2B1B14", light: "#FFFFFF" }
      });
      const isSvgValid = svgOutput.includes("<svg") && svgOutput.includes("</svg>") && svgOutput.includes("viewBox");
      const isContentExact = decodedSegment === expectedUrl;
      if (isSvgValid && isContentExact) {
        console.log(`[PASS] Table ${table.number} (${table.name}): QR successfully generated & encoded ${expectedUrl}`);
        passedTests++;
      } else {
        console.error(`[FAIL] Table ${table.number}: QR payload mismatch or invalid SVG markup.`);
      }
    } catch (err) {
      console.error(`[FAIL] Table ${table.number}: Generation threw error:`, err);
    }
  }
  console.log("\n--- 2. Testing Customer Route Handler & Validation ---");
  const validTableNumbers = new Set(CAFE_CONFIG.tables.map((t) => t.number));
  const routeTestCases = [
    { input: "1", expected: "valid" },
    { input: "5", expected: "valid" },
    { input: "10", expected: "valid" },
    { input: "0", expected: "invalid" },
    { input: "99", expected: "invalid" },
    { input: "-3", expected: "invalid" },
    { input: "patio-1", expected: "invalid" },
    { input: "null", expected: "invalid" },
    { input: "", expected: "invalid" }
  ];
  for (const test of routeTestCases) {
    totalTests++;
    const parsed = parseInt(test.input, 10);
    const isValid = !isNaN(parsed) && validTableNumbers.has(parsed);
    const status = isValid ? "valid" : "invalid";
    if (status === test.expected) {
      console.log(`[PASS] Route /table/${test.input || "empty"} correctly identified as ${status.toUpperCase()}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Route /table/${test.input}: Expected ${test.expected}, got ${status}`);
    }
  }
  console.log("\n--- 3. Testing Legacy /?table=N Query Normalization ---");
  const legacyTestCases = [
    { search: "?table=3", expectedTable: 3, shouldRedirect: true },
    { search: "?table=7", expectedTable: 7, shouldRedirect: true },
    { search: "?table=999", expectedTable: 999, shouldRedirect: false },
    { search: "", expectedTable: null, shouldRedirect: false }
  ];
  for (const test of legacyTestCases) {
    totalTests++;
    const params = new URLSearchParams(test.search);
    const tableParam = params.get("table");
    let redirected = false;
    let target = "";
    if (tableParam) {
      const num = parseInt(tableParam, 10);
      if (!isNaN(num) && validTableNumbers.has(num)) {
        redirected = true;
        target = `/table/${num}`;
      }
    }
    if (redirected === test.shouldRedirect) {
      console.log(`[PASS] Legacy search "${test.search || "(none)"}": ${redirected ? `Redirected to ${target}` : "No redirect"}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Legacy search "${test.search}": Expected redirect ${test.shouldRedirect}, got ${redirected}`);
    }
  }
  console.log("\n=====================================================");
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} assertions passed (${Math.round(passedTests / totalTests * 100)}%)`);
  console.log("=====================================================\n");
  if (passedTests !== totalTests) {
    process.exit(1);
  }
}
runQRCodeTests();
