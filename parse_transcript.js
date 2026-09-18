const fs = require('fs');
const lines = fs.readFileSync('/home/mohamedtalal/.gemini/antigravity-ide/brain/99cf48b1-5d41-444a-913a-5a8f5c7c3a5c/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim()) {
    const obj = JSON.parse(line);
    if (obj.type === 'USER_INPUT' && obj.content.includes('MissingPiece — Frontend Production-Readiness Prompt (v3)')) {
      fs.writeFileSync('full_prompt_extracted.md', obj.content);
      console.log('Saved prompt to full_prompt_extracted.md');
      break;
    }
  }
}
