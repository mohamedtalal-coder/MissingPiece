const fs = require('fs');
const path = require('path');

const enDir = path.join(__dirname, 'frontend/src/shared/i18n/locales/en');
const arDir = path.join(__dirname, 'frontend/src/shared/i18n/locales/ar');

const getFiles = (dir) => fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const enFiles = getFiles(enDir);
const arFiles = fs.existsSync(arDir) ? getFiles(arDir) : [];

console.log(`EN Files: ${enFiles.length}`);
console.log(`AR Files: ${arFiles.length}`);

function flattenObject(ob) {
    var toReturn = {};
    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;
        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;
                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

let missingKeys = 0;

for (const file of enFiles) {
    const enContent = JSON.parse(fs.readFileSync(path.join(enDir, file), 'utf8'));
    const enKeys = flattenObject(enContent);
    
    let arKeys = {};
    if (arFiles.includes(file)) {
        const arContent = JSON.parse(fs.readFileSync(path.join(arDir, file), 'utf8'));
        arKeys = flattenObject(arContent);
    }
    
    for (const key of Object.keys(enKeys)) {
        if (!(key in arKeys)) {
            console.log(`Missing in AR [${file}]: ${key}`);
            missingKeys++;
        } else if (arKeys[key] === enKeys[key] && !enKeys[key].match(/^[0-9]+$/)) {
            // Also flag keys where AR == EN (potential missing translation)
            console.log(`Same as EN (untranslated?) [${file}]: ${key}`);
            missingKeys++;
        }
    }
}

console.log(`Total missing/untranslated keys: ${missingKeys}`);
