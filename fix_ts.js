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
    
    content = content.replace(/\{t\./g, '{(t as any).');
    
    // Fix the broken imports properly if there are any left. The previous head command showed it was fixed, but maybe some files were missed.
    content = content.replace(/from '\nimport \{ useLanguage \} from '.*?';(.*?)';/g, "from '$1';\nimport { useLanguage } from '../../shared/context/LanguageContext';");
    content = content.replace(/from "\nimport \{ useLanguage \} from '.*?';(.*?)\";/g, "from \"$1\";\nimport { useLanguage } from '../../shared/context/LanguageContext';");

    // Fix missing 't' in components by ensuring it's in the component body
    if (content.includes('useLanguage') && !content.includes('const { t } = useLanguage()')) {
       content = content.replace(/(export (?:default )?function \w+\([^)]*\)\s*\{|const \w+ = \([^)]*\) =>\s*\{)/, '$1\n  const { t } = useLanguage();\n');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
