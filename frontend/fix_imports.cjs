const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove duplicate ReportsPage import
c = c.replace("import { ReportsPage } from './pages/shared/ReportsPage';\nimport { ReportsPage } from './pages/shared/ReportsPage';", "import { ReportsPage } from './pages/shared/ReportsPage';");

// Add AdminDashboard and SuperAdminDashboard imports
c = c.replace("import { RequestManagement } from './pages/admin/RequestManagement';", "import { RequestManagement } from './pages/admin/RequestManagement';\nimport { AdminDashboard } from './pages/admin/AdminDashboard';\nimport { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';");

// Remove the remaining duplicate ReportsPage import if the previous replace didn't catch it
let lines = c.split('\n');
let seen = new Set();
let newLines = [];
for (let line of lines) {
  if (line.trim().startsWith('import')) {
    if (seen.has(line.trim())) {
      continue;
    }
    seen.add(line.trim());
  }
  newLines.push(line);
}
c = newLines.join('\n');

fs.writeFileSync('src/App.tsx', c);

// Also fix Sidebar Database missing import
let s = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');
if (!s.includes('import { Database }')) {
  s = s.replace("ClipboardList, Bell, BarChart2, Settings, Home, LogOut, Heart, ShieldCheck, HelpCircle", "ClipboardList, Bell, BarChart2, Settings, Home, LogOut, Heart, ShieldCheck, HelpCircle, Database");
}
fs.writeFileSync('src/components/layout/Sidebar.tsx', s);
