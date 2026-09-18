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
    
    // Fix broken imports
    content = content.replace(/import (.*?) from '\nimport \{ useLanguage \} from '.*?;(.*?)';/g, "import $1 from '$2';\nimport { useLanguage } from '../../shared/context/LanguageContext';");
    content = content.replace(/import \{ useLanguage \} from '.*?';(.*)/g, "import { useLanguage } from '../../shared/context/LanguageContext';\n$1");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
