const fs = require('fs');
const file = 'frontend/src/shared/MyOrdersPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const loadFuncRegex = /(const loadOrders = async \(\) => \{[\s\S]*?^  \};\n)/m;
const match = content.match(loadFuncRegex);
if (match) {
  content = content.replace(match[1], ''); // remove from current position
  content = content.replace(
    'useEffect(() => {',
    match[1] + '\n  useEffect(() => {'
  );
  fs.writeFileSync(file, content);
}
