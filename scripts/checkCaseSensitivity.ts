/**
 * Case-Sensitivity Checker for Linux / Netlify Deployments
 * Recursively scans TypeScript and JavaScript files, parses relative import statements,
 * and verifies that the imported file exists with exact character casing on disk.
 */

import fs from 'fs';
import path from 'path';

interface Mismatch {
  sourceFile: string;
  importPath: string;
  expected: string;
  actual: string;
}

const mismatches: Mismatch[] = [];
let filesScanned = 0;
let importsChecked = 0;

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json'];

function checkCase(filePath: string) {
  const code = fs.readFileSync(filePath, 'utf-8');
  filesScanned++;

  // Match relative imports and exports: import ... from './path' or export ... from './path'
  const importRegex = /(?:import|export)\s+(?:[\s\S]*?from\s+)?['"](\.[^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(code)) !== null) {
    const importSpecifier = match[1];
    importsChecked++;

    const dir = path.dirname(filePath);
    const resolvedPath = path.resolve(dir, importSpecifier);

    // Try finding the real file with matching extension
    let targetFile = '';
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
      targetFile = resolvedPath;
    } else {
      for (const ext of EXTENSIONS) {
        if (fs.existsSync(resolvedPath + ext)) {
          targetFile = resolvedPath + ext;
          break;
        }
        if (fs.existsSync(path.join(resolvedPath, 'index' + ext))) {
          targetFile = path.join(resolvedPath, 'index' + ext);
          break;
        }
      }
    }

    if (targetFile) {
      // Verify casing segment by segment
      const relative = path.relative(dir, targetFile);
      const segments = relative.split(/[\\/]/);
      let currentDir = dir;

      for (const segment of segments) {
        if (segment === '.' || segment === '..') {
          currentDir = path.resolve(currentDir, segment);
          continue;
        }
        const entries = fs.readdirSync(currentDir);
        const exactMatch = entries.find((e) => e === segment);
        const caseInsensitiveMatch = entries.find((e) => e.toLowerCase() === segment.toLowerCase());

        if (caseInsensitiveMatch && exactMatch !== caseInsensitiveMatch) {
          mismatches.push({
            sourceFile: path.relative(process.cwd(), filePath),
            importPath: importSpecifier,
            expected: caseInsensitiveMatch,
            actual: segment,
          });
        }
        currentDir = path.resolve(currentDir, segment);
      }
    }
  }
}

function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === '.git' ||
      entry.name.startsWith('.')
    ) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (
      entry.name.endsWith('.ts') ||
      entry.name.endsWith('.tsx') ||
      entry.name.endsWith('.js')
    ) {
      checkCase(fullPath);
    }
  }
}

console.log('🔍 Checking case-sensitivity of all imports across the monorepo...\n');
scanDir(path.resolve(process.cwd(), 'apps'));
scanDir(path.resolve(process.cwd(), 'packages'));
scanDir(path.resolve(process.cwd(), 'src'));
scanDir(path.resolve(process.cwd(), 'scripts'));

console.log(`Scanned ${filesScanned} source files, verified ${importsChecked} relative imports.`);

if (mismatches.length === 0) {
  console.log('✅ PASS: All imports match exact disk casing. Safe for Linux/Netlify builds!\n');
  process.exit(0);
} else {
  console.error(`❌ FAILED: Found ${mismatches.length} case-sensitivity mismatch(es):\n`);
  for (const m of mismatches) {
    console.error(`  - In ${m.sourceFile}:`);
    console.error(`    Import "${m.importPath}" uses "${m.actual}", but real file is "${m.expected}"`);
  }
  process.exit(1);
}
