const fs = require('fs');
const path = require('path');

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles('frontend/src', /\.tsx?$/);
let changedFiles = 0;

files.forEach(file => {
  const original = fs.readFileSync(file, 'utf8');
  let content = original;
  
  const replacements = [
    { from: /\bml-(\d+|auto|px|0\.5|1\.5|2\.5|3\.5)\b/g, to: 'ms-$1' },
    { from: /\bmr-(\d+|auto|px|0\.5|1\.5|2\.5|3\.5)\b/g, to: 'me-$1' },
    { from: /\bpl-(\d+|px|0\.5|1\.5|2\.5|3\.5)\b/g, to: 'ps-$1' },
    { from: /\bpr-(\d+|px|0\.5|1\.5|2\.5|3\.5)\b/g, to: 'pe-$1' },
    { from: /\bleft-(\d+|auto|px|1\/2|full|0\.5|1\.5|2\.5|3\.5)\b/g, to: 'start-$1' },
    { from: /\bright-(\d+|auto|px|1\/2|full|0\.5|1\.5|2\.5|3\.5)\b/g, to: 'end-$1' },
    { from: /\B-ml-(\d+|px|0\.5|1\.5|2\.5|3\.5)\b/g, to: '-ms-$1' },
    { from: /\B-mr-(\d+|px|0\.5|1\.5|2\.5|3\.5)\b/g, to: '-me-$1' },
    { from: /\B-left-(\d+|px|1\/2|full|0\.5|1\.5|2\.5|3\.5)\b/g, to: '-start-$1' },
    { from: /\B-right-(\d+|px|1\/2|full|0\.5|1\.5|2\.5|3\.5)\b/g, to: '-end-$1' },
    { from: /\bborder-l(-\d+)?\b/g, to: 'border-s$1' },
    { from: /\bborder-r(-\d+)?\b/g, to: 'border-e$1' },
    { from: /\brounded-l(-[a-z]+)?\b/g, to: 'rounded-s$1' },
    { from: /\brounded-r(-[a-z]+)?\b/g, to: 'rounded-e$1' }
  ];

  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${changedFiles} files`);
