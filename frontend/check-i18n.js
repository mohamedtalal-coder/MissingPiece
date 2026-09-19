import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enDir = path.join(__dirname, 'src/shared/i18n/locales/en');
const arDir = path.join(__dirname, 'src/shared/i18n/locales/ar');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const enFiles = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));

let hasError = false;

for (const file of enFiles) {
  const enContent = JSON.parse(fs.readFileSync(path.join(enDir, file), 'utf8'));
  let arContent = {};
  if (fs.existsSync(path.join(arDir, file))) {
    arContent = JSON.parse(fs.readFileSync(path.join(arDir, file), 'utf8'));
  } else {
    console.log(`Missing file in AR: ${file}`);
    hasError = true;
    continue;
  }

  const enKeys = getKeys(enContent);
  const arKeys = getKeys(arContent);

  for (const key of enKeys) {
    if (!arKeys.includes(key)) {
      console.log(`Missing key in AR (${file}): ${key}`);
      hasError = true;
    }
  }

  for (const key of arKeys) {
    if (!enKeys.includes(key)) {
      console.log(`Extra key in AR (${file}): ${key}`);
    }
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('All keys match!');
}
