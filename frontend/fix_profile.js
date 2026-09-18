const fs = require('fs');
const file = 'src/features/account/ProfilePage.tsx';
let content = fs.readFileSync(file, 'utf8');

const loadProfileFuncRegex = /(const loadProfile = async \(\) => \{[\s\S]*?^  \};\n)/m;
const match = content.match(loadProfileFuncRegex);
if (match) {
  content = content.replace(match[1], ''); // remove from current position
  content = content.replace(
    'useEffect(() => {',
    match[1] + '\n  useEffect(() => {'
  );
  fs.writeFileSync(file, content);
}
