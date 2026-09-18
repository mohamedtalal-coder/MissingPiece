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
    
    // Calculate correct relative path to LanguageContext
    // The context is at frontend/src/shared/context/LanguageContext
    const contextPathDir = path.resolve('./frontend/src/shared/context');
    const fileDir = path.resolve(path.dirname(filePath));
    let relPath = path.relative(fileDir, contextPathDir);
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    relPath += '/LanguageContext';

    content = content.replace(/import \{ useLanguage \} from '.*LanguageContext';/g, `import { useLanguage } from '${relPath}';`);

    // Remove rogue const { t } = useLanguage() outside of components
    content = content.replace(/^  const \{ t \} = useLanguage\(\);\n/gm, '');

    // Add it properly inside the components
    content = content.replace(/(export (?:default )?function \w+\([^)]*\)\s*\{|const \w+ = \([^)]*\) =>\s*\{)/g, (match) => {
        return match + '\n  const { t } = useLanguage();';
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
