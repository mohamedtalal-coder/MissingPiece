const fs = require('fs');
const lines = fs.readFileSync('/home/mohamedtalal/.gemini/antigravity-ide/brain/99cf48b1-5d41-444a-913a-5a8f5c7c3a5c/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (line.trim()) {
    const obj = JSON.parse(line);
    if (obj.content && obj.content.includes('MissingPiece — Frontend Production-Readiness Prompt')) {
      fs.writeFileSync('full_prompt_found.md', obj.content);
      break;
    }
  }
}
