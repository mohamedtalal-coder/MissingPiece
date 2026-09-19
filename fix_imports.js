const fs = require('fs');
const files = [
  'frontend/src/features/admin/AdminAuditLogsPage.tsx',
  'frontend/src/features/admin/AdminReviewsPage.tsx',
  'frontend/src/features/admin/AdminFAQPage.tsx',
  'frontend/src/features/admin/AdminUsersPage.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ authFetch \} from '\.\.\/\.\.\/shared\/utils\/authFetch';/g, "import { apiClient } from '../../api/client';");
  // Also replace authFetch usage with apiClient
  content = content.replace(/authFetch\(/g, 'apiClient(');
  content = content.replace(/authFetch\./g, 'apiClient.');
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
