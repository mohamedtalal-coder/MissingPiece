import fs from 'fs';
import path from 'path';

function findTests(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findTests(path.join(dir, file), fileList);
    } else if (file.endsWith('.test.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const tests = findTests('./src');

for (const oldPath of tests) {
  const newPath = oldPath.replace('src', 'tests');
  
  fs.mkdirSync(path.dirname(newPath), { recursive: true });
  
  let content = fs.readFileSync(oldPath, 'utf8');
  
  content = content.replace(/(import\s+.*?from\s+["'])([\.\/]+.*)(["'])/g, (match, p1, p2, p3) => {
    const oldDir = path.dirname(oldPath);
    const targetAbs = path.resolve(oldDir, p2); 
    const newDir = path.resolve(path.dirname(newPath));
    let newRel = path.relative(newDir, targetAbs);
    if (!newRel.startsWith('.')) newRel = './' + newRel;
    newRel = newRel.replace(/\\/g, '/');
    return p1 + newRel + p3;
  });
  
  content = content.replace(/(jest\.mock\s*\(\s*["'])([\.\/]+.*)(["'])/g, (match, p1, p2, p3) => {
    const oldDir = path.dirname(oldPath);
    const targetAbs = path.resolve(oldDir, p2); 
    const newDir = path.resolve(path.dirname(newPath));
    let newRel = path.relative(newDir, targetAbs);
    if (!newRel.startsWith('.')) newRel = './' + newRel;
    newRel = newRel.replace(/\\/g, '/');
    return p1 + newRel + p3;
  });

  fs.writeFileSync(newPath, content);
  fs.unlinkSync(oldPath);
}

const tsconfigPath = './tsconfig.json';
let tsconfig = fs.readFileSync(tsconfigPath, 'utf8');
tsconfig = tsconfig.replace('"include": ["src"]', '"include": ["src", "tests"]');
fs.writeFileSync(tsconfigPath, tsconfig);

console.log("Moved " + tests.length + " test files.");
