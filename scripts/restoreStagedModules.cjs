const fs = require('fs');
const path = require('path');

const nm = path.resolve(__dirname, '../node_modules');
if (!fs.existsSync(nm)) process.exit(0);

const entries = fs.readdirSync(nm, { withFileTypes: true });
let restored = 0;

for (const entry of entries) {
  if (entry.isDirectory() && entry.name.startsWith('.')) {
    const match = entry.name.match(/^\.([a-zA-Z0-9_@.-]+)-[a-zA-Z0-9]{8}$/);
    if (match) {
      const targetName = match[1];
      const srcDir = path.join(nm, entry.name);
      const destDir = path.join(nm, targetName);

      try {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        // Copy files recursively
        fs.cpSync(srcDir, destDir, { recursive: true, force: true });
        restored++;
      } catch (err) {
        console.warn(`Could not restore ${targetName}:`, err.message);
      }
    }
  }
}

console.log(`Successfully restored ${restored} staged packages!`);

