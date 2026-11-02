/**
 * Automated Accessibility Audit Test Suite using axe-core and JSDOM
 * Tests target routes:
 *   1. / (Home)
 *   2. /menu (Artisan Digital Menu)
 *   3. /cart (Tasting Tray & Checkout)
 *   4. /book (Table Reservation)
 *   5. /login (Admin Authentication Portal)
 *   6. /dashboard (Daily Counter Dashboard)
 */

import { JSDOM } from 'jsdom';
import axeCore from 'axe-core';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const runAxe = (axeCore as any).run || (axeCore as any).default?.run || axeCore;

// Import Pages
import { HomePage } from '../apps/customer-site/src/pages/HomePage';
import { MenuPage } from '../apps/customer-site/src/pages/MenuPage';
import { CartPage } from '../apps/customer-site/src/pages/CartPage';
import { BookTablePage } from '../apps/customer-site/src/pages/BookTablePage';
import { LoginPage } from '../apps/admin-site/src/pages/LoginPage';
import { DashboardPage } from '../apps/admin-site/src/pages/DashboardPage';
import { SAMPLE_MENU_ITEMS } from '../packages/shared/src/data/sampleCafeData';

interface AuditRoute {
  path: string;
  name: string;
  component: React.ReactElement;
}

const mockCartItems = [
  {
    id: 'cart-1',
    menuItemId: 'c-01',
    editionId: 'ed-1',
    name: 'Pour-Over Ratnagiri Estate #12',
    editionName: 'Standard 240ml',
    quantity: 2,
    basePrice: 280,
    itemTotal: 560,
  },
];

const routesToTest: AuditRoute[] = [
  {
    path: '/',
    name: 'Home Page (/)',
    component: (
      <MemoryRouter initialEntries={['/']}>
        <HomePage onAddToCart={() => {}} />
      </MemoryRouter>
    ),
  },
  {
    path: '/menu',
    name: 'Artisan Menu (/menu)',
    component: (
      <MemoryRouter initialEntries={['/menu']}>
        <MenuPage
          menuItems={SAMPLE_MENU_ITEMS}
          cartItems={mockCartItems}
          onAddToCart={() => {}}
          onOpenCart={() => {}}
        />
      </MemoryRouter>
    ),
  },
  {
    path: '/cart',
    name: 'Tasting Tray & Cart (/cart)',
    component: (
      <MemoryRouter initialEntries={['/cart']}>
        <CartPage
          cartItems={mockCartItems}
          onUpdateQty={() => {}}
          onRemoveItem={() => {}}
          onClearCart={() => {}}
        />
      </MemoryRouter>
    ),
  },
  {
    path: '/book',
    name: 'Reserve a Table (/book)',
    component: (
      <MemoryRouter initialEntries={['/book']}>
        <BookTablePage />
      </MemoryRouter>
    ),
  },
  {
    path: '/login',
    name: 'Admin Login (/login)',
    component: (
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage onLoginSuccess={() => {}} />
      </MemoryRouter>
    ),
  },
  {
    path: '/dashboard',
    name: 'Daily Counter Dashboard (/dashboard)',
    component: (
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    ),
  },
];

async function runAccessibilityAudit() {
  console.log('===============================================================');
  console.log('     ATELIER VÉLIN - AUTOMATED ACCESSIBILITY AUDIT (AXE-CORE)   ');
  console.log('===============================================================\n');

  let allPassed = true;
  const auditResults: Array<{
    path: string;
    name: string;
    violationsCount: number;
    passesCount: number;
    score: number;
    violations: string[];
  }> = [];

  for (const route of routesToTest) {
    const htmlString = renderToString(route.component);
    const pageHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>${route.name} - Atelier Vélin</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body class="bg-[#F4EBDD] text-[#2B1B14]">
          <main id="main-content">
            ${htmlString}
          </main>
        </body>
      </html>
    `;

    const dom = new JSDOM(pageHtml, {
      runScripts: 'outside-only',
      pretendToBeVisual: true,
    });

    const { window } = dom;

    // Run axe against the DOM
    const axeResults = await runAxe(window.document.documentElement, {
      rules: {
        // Color-contrast rules in JSDOM cannot compute true CSS layout/font rendering without headless browser
        'color-contrast': { enabled: false },
      },
    });

    const passesCount = axeResults.passes.length;
    const violationsCount = axeResults.violations.length;
    // Score based on passes vs violations
    const totalRules = passesCount + violationsCount;
    const score = totalRules > 0 ? Math.round((passesCount / totalRules) * 100) : 100;

    const violationDetails = axeResults.violations.map(
      (v: any) => `[${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} occurrences)\n        Node: ${v.nodes.map((n: any) => n.html.slice(0, 120)).join('\n        Node: ')}`
    );

    auditResults.push({
      path: route.path,
      name: route.name,
      violationsCount,
      passesCount,
      score,
      violations: violationDetails,
    });

    if (violationsCount > 0) {
      allPassed = false;
    }
  }

  console.log('Route Accessibility Audit Breakdown:');
  console.log('---------------------------------------------------------------');
  for (const res of auditResults) {
    const status = res.violationsCount === 0 ? '✓ PASS' : '✗ FAIL';
    console.log(
      `${status} | Route: ${res.path.padEnd(12)} | Score: ${String(res.score).padStart(3)}/100 | Passes: ${res.passesCount} | Violations: ${res.violationsCount}`
    );
    if (res.violations.length > 0) {
      res.violations.forEach((v) => console.log(`      -> ${v}`));
    }
  }
  console.log('---------------------------------------------------------------');

  const avgScore = Math.round(
    auditResults.reduce((sum, r) => sum + r.score, 0) / auditResults.length
  );
  console.log(`\nOverall Accessibility Score: ${avgScore}/100 across all 6 key routes.`);

  if (!allPassed) {
    console.error('Audit completed with accessibility violations to address.');
    process.exit(1);
  } else {
    console.log('All 6 audited routes verified 100% compliant with zero open violations!\n');
  }
}

runAccessibilityAudit().catch((err) => {
  console.error('Audit execution failed:', err);
  process.exit(1);
});
