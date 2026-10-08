const fs = require('fs');
const files = [
  'src/pages/admin/UserManagement.tsx', 
  'src/pages/admin/AdminManagement.tsx', 
  'src/pages/admin/RequestManagement.tsx', 
  'src/pages/admin/AuditLogs.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf-8');
    
    // Replace old class with the new lighter focus ring class
    c = c.replace(/className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"/g, 'className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"');
    
    fs.writeFileSync(f, c);
    console.log('Updated ' + f);
  }
});
