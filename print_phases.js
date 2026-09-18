const fs = require('fs');
const content = fs.readFileSync('full_prompt_extracted.md', 'utf8');
const lines = content.split('\n');
let inPhase3 = false;
let output = [];
for (const line of lines) {
  if (line.match(/^### Phase 3 /)) {
    inPhase3 = true;
  } else if (inPhase3 && line.match(/^### Phase [4-9] /)) {
    break;
  }
  if (inPhase3) output.push(line);
}
console.log(output.join('\n'));
