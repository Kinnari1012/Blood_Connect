const fs = require('fs');
const files = ['en', 'gu', 'hi'];
const additional = {
  en: { overview: 'Overview' },
  gu: { overview: 'વિહંગાવલોકન' },
  hi: { overview: 'अवलोकन' }
};

files.forEach(lang => {
  const path = `src/i18n/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.dashboard = { ...data.dashboard, ...additional[lang] };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
console.log('Overview translation added.');
