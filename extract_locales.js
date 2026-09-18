const fs = require('fs');
const path = require('path');

const tsFilePath = './frontend/src/shared/i18n/translations.ts';
let tsContent = fs.readFileSync(tsFilePath, 'utf8');
tsContent = tsContent.replace(/export type.*$/gm, '');

const translations = eval(`
  const module = {};
  ${tsContent.replace('export const translations =', 'module.exports =')}
  module.exports;
`);

const localesDir = './frontend/src/shared/i18n/locales';

for (const lang of ['en', 'ar']) {
  const langDir = path.join(localesDir, lang);
  fs.mkdirSync(langDir, { recursive: true });

  const data = translations[lang];
  for (const [key, value] of Object.entries(data)) {
    fs.writeFileSync(path.join(langDir, `${key}.json`), JSON.stringify(value, null, 2));
  }
}
