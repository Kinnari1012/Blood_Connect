const fs = require('fs');

const pages = [
  { name: 'Users', path: 'UsersPage.tsx', route: '/users' },
  { name: 'Donors', path: 'DonorsPage.tsx', route: '/donors' },
  { name: 'Blood Requests', path: 'BloodRequestsPage.tsx', route: '/blood-requests' },
  { name: 'Blood Donations', path: 'BloodDonationsPage.tsx', route: '/blood-donations' },
  { name: 'Blood Groups', path: 'BloodGroupsPage.tsx', route: '/blood-groups' },
  { name: 'Locations', path: 'LocationsPage.tsx', route: '/locations' },
  { name: 'Reports', path: 'ReportsPage.tsx', route: '/reports' },
  { name: 'Notifications', path: 'NotificationsPage.tsx', route: '/notifications' },
  { name: 'Profile', path: 'ProfilePage.tsx', route: '/profile' }
];

pages.forEach(p => {
  const content = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';

export function ${p.name.replace(/ /g, '')}Page() {
  return (
    <PageLayout>
      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4">{p.name} Data</h2>
        <p className="text-gray-600">This is a dedicated page for ${p.name}. Relevant data will be displayed here.</p>
      </div>
    </PageLayout>
  );
}
`;
  fs.writeFileSync('src/pages/shared/' + p.path, content);
});
console.log('Mock pages created.');
