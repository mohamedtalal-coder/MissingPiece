const fs = require('fs');
const path = require('path');

function updateI18n(namespace, enUpdates, arUpdates) {
    const baseDir = path.join(__dirname, 'frontend/src/shared/i18n/locales');
    const enPath = path.join(baseDir, 'en', `${namespace}.json`);
    const arPath = path.join(baseDir, 'ar', `${namespace}.json`);

    const deepMerge = (target, source) => {
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], deepMerge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    };

    if (fs.existsSync(enPath)) {
        let enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        deepMerge(enData, enUpdates);
        fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\n');
    }

    if (fs.existsSync(arPath)) {
        let arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));
        deepMerge(arData, arUpdates);
        fs.writeFileSync(arPath, JSON.stringify(arData, null, 2) + '\n');
    }
}

// Example usage can be added here and executed repeatedly via run_command
module.exports = updateI18n;
