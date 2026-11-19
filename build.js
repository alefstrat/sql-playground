// Rebuilds index.html from the files in src/. Run: node build.js  (or npm run build)
const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const html = src('template.html')
  .replace('/*CSS*/', () => src('style.css'))
  .replace('/*ENGINE*/', () => src('engine.js'))
  .replace('/*LAYOUT*/', () => src('layout.js'))
  .replace('/*APP*/', () => src('app.js'));
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('Built index.html (' + Math.round(html.length / 1024) + ' KB)');
