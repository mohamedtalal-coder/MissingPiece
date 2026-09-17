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
    
    // Replace giant rounded containers
    content = content.replace(/rounded-(?:2xl|3xl|full|xl)/g, 'rounded-md');
    // Replace purple/indigo colors with semantic colors
    content = content.replace(/bg-purple-\d+(?:\/\d+)?/g, 'bg-surface');
    content = content.replace(/bg-indigo-\d+(?:\/\d+)?/g, 'bg-primary');
    content = content.replace(/text-purple-\d+(?:\/\d+)?/g, 'text-primary');
    content = content.replace(/text-indigo-\d+(?:\/\d+)?/g, 'text-primary');
    content = content.replace(/border-purple-\d+(?:\/\d+)?/g, 'border-border');
    content = content.replace(/border-indigo-\d+(?:\/\d+)?/g, 'border-border');
    content = content.replace(/from-purple-\d+/g, 'from-primary');
    content = content.replace(/to-indigo-\d+/g, 'to-primary');
    content = content.replace(/to-purple-\d+/g, 'to-primary');
    content = content.replace(/hover:bg-purple-\d+(?:\/\d+)?/g, 'hover:bg-surfaceHover');
    content = content.replace(/hover:text-purple-\d+(?:\/\d+)?/g, 'hover:text-primaryHover');
    content = content.replace(/shadow-purple-\d+(?:\/\d+)?/g, 'shadow-subtle');
    
    // Remove glow and glassmorphism classes
    content = content.replace(/backdrop-blur-(?:sm|md|lg|xl)/g, '');
    content = content.replace(/purple-glow-card/g, 'bg-surface border border-border shadow-subtle');
    content = content.replace(/text-gradient-purple/g, 'text-primary');
    content = content.replace(/bg-gradient-to-[a-z]+/g, 'bg-primary');
    
    // Other specific replacements
    content = content.replace(/bg-\[\#1a1433\]/g, 'bg-surface');
    content = content.replace(/hover:bg-\[\#231a42\]/g, 'hover:bg-surfaceHover');
    content = content.replace(/border-\[\#7e22ce\](?:\/\d+)?/g, 'border-border');
    content = content.replace(/bg-\[\#130e21\]/g, 'bg-background');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
