const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, 'src/features');
const SHARED_COMPONENTS = path.join(__dirname, 'src/shared/components');

// Patterns that indicate user-facing hardcoded text
const PATTERNS = [
  // JSX text nodes (not pure whitespace, not just numbers, not just special chars)
  { name: 'JSX text', regex: />([A-Z][a-zA-Z\s,.'&!?:-]{4,})</g },
  // aria-label with string literal (not expression)
  { name: 'aria-label', regex: /aria-label="([^"]{3,})"/g },
  // placeholder with string literal
  { name: 'placeholder', regex: /placeholder="([^"]{3,})"/g },
  // title with string literal  
  { name: 'title', regex: /title="([^"]{3,})"/g },
  // toast messages with string literals
  { name: 'toast msg', regex: /showToast\(\{[^}]*message:\s*'([^']{5,})'/g },
  // window.confirm with string literal
  { name: 'confirm', regex: /window\.confirm\(['"]([^'"]{5,})['"]\)/g },
  // setError with string literal
  { name: 'setError', regex: /setError\(['"]([^'"]{5,})['"]\)/g },
];

// Files/patterns to ignore
const IGNORE_FILES = [
  'CartContext.tsx', // TypeScript interfaces, not JSX
  'AuthContext.tsx',  // Not user-facing
];
const IGNORE_STRINGS = [
  'SUMMER20',  // code placeholder example
  'Missing Piece', // Brand name - acceptable
  'you@example.com', // already handled
  '••••••••', // password mask
  '∞', // symbol
  'e.g.', // form hint already in JSON
  'Loading', // most skeleton aria-labels
  'loading', // lowercase
];

function checkFile(filePath) {
  const fileName = path.basename(filePath);
  if (IGNORE_FILES.includes(fileName)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(path.join(__dirname, 'src'), filePath);
  
  const issues = [];
  
  for (const { name, regex } of PATTERNS) {
    const re = new RegExp(regex.source, regex.flags);
    let match;
    while ((match = re.exec(content)) !== null) {
      const text = match[1].trim();
      
      // Skip if it contains a template literal or expression
      if (text.includes('${') || text.includes('{')) continue;
      
      // Skip ignored strings
      if (IGNORE_STRINGS.some(s => text.includes(s))) continue;
      
      // Skip skeleton aria-labels (they're fine for accessibility)
      if (name === 'aria-label' && (text.toLowerCase().includes('loading') || text.toLowerCase().includes('skeleton'))) continue;
      
      // Get line number
      const lineNum = content.substring(0, match.index).split('\n').length;
      
      issues.push(`  L${lineNum} [${name}]: ${text.substring(0, 80)}`);
    }
  }
  
  if (issues.length > 0) {
    console.log(`=== ${relPath} ===`);
    issues.forEach(i => console.log(i));
    console.log('');
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.tsx')) {
      checkFile(fullPath);
    }
  }
}

console.log('=== Final Hardcoded String Audit ===\n');
walkDir(FEATURES_DIR);
walkDir(SHARED_COMPONENTS);
console.log('=== Done ===');
