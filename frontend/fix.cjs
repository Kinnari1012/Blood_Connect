const fs = require('fs');

const pages = ['UsersPage.tsx', 'DonorsPage.tsx', 'BloodRequestsPage.tsx', 'BloodDonationsPage.tsx', 'BloodGroupsPage.tsx', 'LocationsPage.tsx', 'ReportsPage.tsx', 'NotificationsPage.tsx', 'ProfilePage.tsx'];

pages.forEach(file => {
  let p = 'src/pages/shared/' + file;
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/\$\{p\.name\}/g, file.replace('Page.tsx', ''));
  fs.writeFileSync(p, content);
});

console.log('Fixed scaffold pages');
