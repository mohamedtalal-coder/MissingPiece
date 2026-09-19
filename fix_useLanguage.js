const fs = require('fs');

const filesToFix = [
  'frontend/src/features/orders/AdminOrdersPage.tsx',
  'frontend/src/features/orders/OrderDetailPage.tsx',
  'frontend/src/features/static/AdminMessagesPage.tsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('useLanguage')) {
    // Add import after the last import
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    const importStatement = "\nimport { useLanguage } from '../../shared/context/LanguageContext';";
    content = content.slice(0, endOfLastImport) + importStatement + content.slice(endOfLastImport);
    fs.writeFileSync(file, content);
    console.log(`Fixed useLanguage in ${file}`);
  } else {
    // If it's already there but useLanguage is not imported from LanguageContext
    if (!content.includes('shared/context/LanguageContext')) {
      const lastImportIndex = content.lastIndexOf('import ');
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      const importStatement = "\nimport { useLanguage } from '../../shared/context/LanguageContext';";
      content = content.slice(0, endOfLastImport) + importStatement + content.slice(endOfLastImport);
      fs.writeFileSync(file, content);
      console.log(`Fixed useLanguage in ${file}`);
    }
  }
});
