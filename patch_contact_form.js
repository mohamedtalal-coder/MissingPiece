const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/static/ContactForm.tsx', 'utf8');

content = content.replace(
  "const [email, setEmail] = useState('');",
  "const [email, setEmail] = useState('');\n  const [subject, setSubject] = useState('');"
);

content = content.replace(
  "if (!name || !email || !message) {",
  "if (!name || !email || !subject || !message) {"
);

content = content.replace(
  "await staticApi.sendMessage({ name, email, message });",
  "await staticApi.sendMessage({ name, email, subject, message });"
);

content = content.replace(
  "setEmail('');",
  "setEmail('');\n      setSubject('');"
);

const emailField = `<div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-main)]">
          {t.contact.email}
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.contact.emailPlaceholder}
          className="w-full bg-[var(--bg-main)] border border-border rounded-md px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-border"
          required
        />
      </div>`;

const subjectField = `\n\n      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-main)]">
          Subject
        </label>

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What is this regarding?"
          className="w-full bg-[var(--bg-main)] border border-border rounded-md px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-border"
          required
        />
      </div>`;

content = content.replace(emailField, emailField + subjectField);

fs.writeFileSync('frontend/src/features/static/ContactForm.tsx', content);
