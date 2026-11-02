/**
 * Atelier Vélin — Production Real Data Audit Script (check:no-fake-data)
 *
 * Scans production source files for banned placeholder / fabricated patterns:
 * - Lorem Ipsum text
 * - Generic fake customer names ("John Doe", "Jane Doe")
 * - Placeholder phone numbers ("9999999999", "1234567890", "555-0199")
 * - Placeholder web domains ("example.com", "mycafe.com", "fakeurl.com")
 * - Math.random() usage in production metrics / analytics calculations
 * - Overinflated marketing claims ("10,000+ customers")
 */

import fs from 'fs';
import path from 'path';

interface BannedPattern {
  name: string;
  regex: RegExp;
  description: string;
}

const BANNED_PATTERNS: BannedPattern[] = [
  {
    name: 'Lorem Ipsum',
    regex: /lorem\s+ipsum/i,
    description: 'Fabricated placeholder Latin text found in production UI',
  },
  {
    name: 'Placeholder Customer Name',
    regex: /\b(john\s+doe|jane\s+doe)\b/i,
    description: 'Generic placeholder person name',
  },
  {
    name: 'Placeholder Phone Number',
    regex: /\b(9999999999|9876543210|1234567890|555[-.]?01\d\d)\b/,
    description: 'Fabricated placeholder phone number in production code',
  },
  {
    name: 'Placeholder Domain',
    regex: /\b(example\.com|mycafe\.com|placeholder\.com)\b/i,
    description: 'Fabricated placeholder web domain instead of dynamic setting',
  },
  {
    name: 'Fake Metrics Math.random',
    regex: /Math\.random\s*\(\)\s*\*\s*\d+/i,
    description: 'Random number generation used for fake business metrics or revenue',
  },
  {
    name: 'Inflated Marketing Claim',
    regex: /\b10,?000\+\s*customers\b/i,
    description: 'Fabricated customer count marketing claim',
  },
];

interface Finding {
  file: string;
  line: number;
  pattern: string;
  snippet: string;
  description: string;
}

const findings: Finding[] = [];
let scannedCount = 0;

// Whitelisted files (e.g. test files, demo seeder, or check script itself)
const EXCLUDED_PATHS = [
  'node_modules',
  'dist',
  '.git',
  'scripts/checkNoFakeData.ts',
  'scripts/seedDemo.ts',
  'packages/shared/src/data/sampleCafeData.ts',
  'packages/shared/src/services/localDemoService.ts',
];

function isExcluded(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return EXCLUDED_PATHS.some((ex) => normalized.includes(ex));
}

function checkFile(filePath: string) {
  if (isExcluded(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  scannedCount++;
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Skip comment lines in scripts or tests
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    for (const pattern of BANNED_PATTERNS) {
      if (pattern.regex.test(line)) {
        findings.push({
          file: path.relative(process.cwd(), filePath),
          line: idx + 1,
          pattern: pattern.name,
          snippet: line.trim().slice(0, 100),
          description: pattern.description,
        });
      }
    }
  });
}

function walk(targetPath: string) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    checkFile(targetPath);
    return;
  }
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && !entry.name.startsWith('.')) {
        walk(fullPath);
      }
    } else if (
      entry.name.endsWith('.ts') ||
      entry.name.endsWith('.tsx') ||
      entry.name.endsWith('.html') ||
      entry.name.endsWith('.json')
    ) {
      checkFile(fullPath);
    }
  }
}

console.log('🛡️ Running Production Real-Data Audit (check:no-fake-data)...\n');

walk(path.resolve(process.cwd(), 'apps/customer-site/src'));
walk(path.resolve(process.cwd(), 'apps/admin-site/src'));
walk(path.resolve(process.cwd(), 'packages/shared/src/services'));
walk(path.resolve(process.cwd(), 'packages/shared/src/config'));
walk(path.resolve(process.cwd(), 'packages/shared/src/utils'));

console.log(`Audited ${scannedCount} production source files.`);

if (findings.length === 0) {
  console.log('✅ PASS: Zero fabricated data or banned placeholder patterns detected in production code.\n');
  process.exit(0);
} else {
  console.error(`❌ FAILED: Found ${findings.length} instance(s) of fake/placeholder data:\n`);
  findings.forEach((f) => {
    console.error(`  [${f.pattern}] ${f.file}:${f.line}`);
    console.error(`    Line: "${f.snippet}"`);
    console.error(`    Issue: ${f.description}\n`);
  });
  process.exit(1);
}
