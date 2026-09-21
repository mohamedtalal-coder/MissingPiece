const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.tsx')) {
            callback(dirPath);
        }
    });
}

const ignorePaths = ['tests'];

walkDir(path.join(__dirname, 'frontend/src'), function(filePath) {
    if (ignorePaths.some(i => filePath.includes(i))) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        // match "> text <" where text has at least one letter and no { or } inside it
        if (/>[^<{]*[A-Za-z][^<{]*</.test(line)) {
            let text = line.match(/>([^<{]*[A-Za-z][^<{]*)</)[1].trim();
            if (text.length > 1) {
                console.log(`[${path.basename(filePath)}:${index + 1}] ${text}`);
            }
        }
    });
});
