const fs = require('fs');
const path = require('path');

const dir = '/home/mohamedtalal/Documents/MissingPiece/frontend/src/shared/i18n/locales/ar';

const replacements = [
  { from: /مجموعة بازل ماستر/g, to: 'المجموعة الاحترافية' },
  { from: /بازل ماستر/g, to: 'مجموعة احترافية' },
  { from: /بازل الصور/g, to: 'أحجية الصور المقطوعة' },
  { from: /بازل ثلاثي الأبعاد/g, to: 'أحجيات ثلاثية الأبعاد' },
  { from: /البازل الخشبي/g, to: 'الأحجيات الخشبية' },
  { from: /ورشة البازل الخشبي الحرفي/g, to: 'ورشة الأحجيات الخشبية الحرفية' },
  { from: /بازل الغموض/g, to: 'أحجيات الغموض' },
  { from: /بازل كلاسيكي/g, to: 'أحجيات كلاسيكية' },
  { from: /بازل الماندالا الخشبي/g, to: 'أحجية الماندالا الخشبية' },
  { from: /بازل مرج الغروب/g, to: 'أحجية مرج الغروب' },
  { from: /بازل مصاحب/g, to: 'أحجية مصاحبة' },
  { from: /عن البازل المخصص/g, to: 'عن الأحجيات المخصصة' },
  { from: /ألعاب البازل/g, to: 'الأحجيات' },
  { from: /لعب البازل/g, to: 'الأحجيات' },
  { from: /منتجات البازل/g, to: 'الأحجيات' },
  { from: /طلبات البازل/g, to: 'طلبات الأحجيات' },
  { from: /مجموعات البازل/g, to: 'مجموعات الأحجيات' },
  { from: /عشاق البازل/g, to: 'عشاق الأحجيات' },
  { from: /فن البازل/g, to: 'فن الأحجيات' },
  { from: /البازل ليس مجرد لعبة/g, to: 'الأحجية ليست مجرد لعبة' },
  { from: /طلب البازل الخاص بك/g, to: 'طلب الأحجية الخاص بك' },
  { from: /مجموعة البازل/g, to: 'مجموعة الأحجيات' },
  { from: /عن البازل/g, to: 'عن الأحجية' },
  { from: /كل بازل/g, to: 'كل أحجية' },
  { from: /بازل خشبي/g, to: 'أحجية خشبية' },
  { from: /البازل/g, to: 'الأحجية' },
  { from: /بازل/g, to: 'أحجية' }
];

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const { from, to } of replacements) {
    if (content.match(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
