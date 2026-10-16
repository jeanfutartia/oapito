const fs = require('fs');
const path = require('path');

const outputFile = 'PROJETO_COMPLETO_VALIDACAO.md';
let output = '# PROJETO: O APITO - CODIGO COMPLETO\n\n';

if (fs.existsSync('package.json')) {
  output += '## package.json\n```json\n' + fs.readFileSync('package.json', 'utf8') + '\n```\n\n';
}

function scan(dir) {
  const entries = fs.readdirSync(dir);
  for (const item of entries) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      scan(full);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.css')) {
      const lang = item.endsWith('.css') ? 'css' : 'typescript';
      output += '### Arquivo: ' + full.split(path.sep).join('/') + '\n```' + lang + '\n' + fs.readFileSync(full, 'utf8') + '\n```\n\n';
    }
  }
}

if (fs.existsSync('src')) {
  scan('src');
}

fs.writeFileSync(outputFile, output, 'utf8');
console.log('SUCESSO! Arquivo consolidado gerado na raiz: ' + outputFile);
