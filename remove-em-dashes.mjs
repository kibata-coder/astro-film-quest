import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

function removeEmDashes(dir) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      removeEmDashes(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md') || fullPath.endsWith('.html')) {
      let content = readFileSync(fullPath, 'utf8');
      if (content.includes('—')) {
        // Replace em dash with surrounding spaces with a single space
        content = content.replace(/\s*—\s*/g, ' ');
        writeFileSync(fullPath, content);
        console.log(`Removed from ${fullPath}`);
      }
    }
  }
}

removeEmDashes(join(process.cwd(), 'src'));
console.log('Done removing em dashes.');
