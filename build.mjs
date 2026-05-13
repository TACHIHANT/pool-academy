import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const partials = {
  head:       readFileSync(resolve(__dirname, 'partials/head.html'), 'utf-8'),
  header:     readFileSync(resolve(__dirname, 'partials/header.html'), 'utf-8'),
  shareBar:   readFileSync(resolve(__dirname, 'partials/share-bar.html'), 'utf-8'),
  footer:     readFileSync(resolve(__dirname, 'partials/footer.html'), 'utf-8'),
  scripts:    readFileSync(resolve(__dirname, 'partials/scripts.html'), 'utf-8'),
};

const sections = [
  { start: '<!--HEADER-->',   end: '<!--END-HEADER-->',   content: partials.header },
  { start: '<!--FOOTER-->',   end: '<!--END-FOOTER-->',   content: partials.footer },
  { start: '<!--SHARE-BAR-->',end: '<!--END-SHARE-BAR-->',content: partials.shareBar },
  { start: '<!--SCRIPTS-->',  end: '<!--END-SCRIPTS-->',  content: partials.scripts },
  { start: '<!--HEAD-->',     end: '<!--END-HEAD-->',     content: partials.head },
];

const pages = readdirSync(resolve(__dirname))
  .filter(f => f.endsWith('.html') && f !== 'merci.html' && f !== 'free-guide.html');

let updated = 0;
for (const page of pages) {
  const filePath = resolve(__dirname, page);
  let html = readFileSync(filePath, 'utf-8');
  let changed = false;

  for (const sec of sections) {
    const startIdx = html.indexOf(sec.start);
    const endIdx = html.indexOf(sec.end);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const before = html.slice(0, startIdx + sec.start.length);
      const after = html.slice(endIdx);
      html = before + '\n' + sec.content + '\n' + after;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(filePath, html, 'utf-8');
    updated++;
    console.log(`  ✓ ${page}`);
  }
}

console.log(`\nTerminé : ${updated} page(s) mise(s) à jour.`);
