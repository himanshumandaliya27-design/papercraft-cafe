const { buildSync } = require('esbuild');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const scriptName = process.argv[2];
if (!scriptName) {
  console.error('Usage: node scripts/runCheck.cjs <script-file.ts>');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), scriptName.startsWith('scripts') ? scriptName : path.join('scripts', scriptName));
const tempOut = path.resolve(process.cwd(), `scripts/.temp_${Date.now()}.cjs`);

try {
  buildSync({
    entryPoints: [inputPath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: tempOut,
    external: ['qrcode', 'qrcode/*', 'firebase', 'firebase/*'],
  });

  execSync(`node "${tempOut}"`, { stdio: 'inherit' });
} catch (err) {
  process.exit(1);
} finally {
  try {
    if (fs.existsSync(tempOut)) {
      fs.unlinkSync(tempOut);
    }
  } catch (e) {}
}
