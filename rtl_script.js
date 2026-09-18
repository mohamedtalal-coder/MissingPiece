const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('./frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace left/right margins
    content = content.replace(/(?<![a-z\-])ml-(\d+|auto|px|\[\d+px\])/g, 'ms-$1');
    content = content.replace(/(?<![a-z\-])mr-(\d+|auto|px|\[\d+px\])/g, 'me-$1');
    content = content.replace(/(?<![a-z\-])-ml-(\d+|auto|px|\[\d+px\])/g, '-ms-$1');
    content = content.replace(/(?<![a-z\-])-mr-(\d+|auto|px|\[\d+px\])/g, '-me-$1');
    
    // Replace left/right paddings
    content = content.replace(/(?<![a-z\-])pl-(\d+|px|\[\d+px\])/g, 'ps-$1');
    content = content.replace(/(?<![a-z\-])pr-(\d+|px|\[\d+px\])/g, 'pe-$1');
    
    // Check directional arrows and add rtl:rotate-180 class
    // We will look for lucide icons like ChevronRight, ChevronLeft, ArrowRight, ArrowLeft
    content = content.replace(/<(ChevronRight|ChevronLeft|ArrowRight|ArrowLeft|MoveRight|MoveLeft)(\s+[^>]*)?className="([^"]+)"/g, function(match, name, p2, p3) {
      if (!p3.includes('rtl:rotate-180') && !p3.includes('rtl:-scale-x-100')) {
        return `<${name}${p2 || ''}className="${p3} rtl:rotate-180"`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
