const fs = require('fs');

// 1. Fix BottomNav.tsx
let bottomNav = fs.readFileSync('src/components/layout/BottomNav.tsx', 'utf-8');
bottomNav = bottomNav.replace(/ROUTES\.SEEKER_DASHBOARD/g, 'ROUTES.USER_DASHBOARD');
fs.writeFileSync('src/components/layout/BottomNav.tsx', bottomNav);
console.log('Fixed BottomNav.tsx');

// 2. Fix AdminDashboard.tsx (_id -> id)
let adminDashboard = fs.readFileSync('src/pages/dashboard/AdminDashboard.tsx', 'utf-8');
adminDashboard = adminDashboard.replace(/req\._id \|\| req\.id/g, 'req.id');
adminDashboard = adminDashboard.replace(/req\._id\?/g, 'req.id?');
fs.writeFileSync('src/pages/dashboard/AdminDashboard.tsx', adminDashboard);
console.log('Fixed AdminDashboard.tsx');

// 3. Fix RequestDetails.tsx
let reqDetails = fs.readFileSync('src/pages/seeker/RequestDetails.tsx', 'utf-8');
reqDetails = reqDetails.replace(/req\.status === 'Rejected'/g, "req.status === 'REJECTED'");
reqDetails = reqDetails.replace(/req\.status === 'Pending Verification'/g, "req.status === 'PENDING_VERIFICATION'");
reqDetails = reqDetails.replace(/req\.rejectionReason/g, "(req as any).rejectionReason");
reqDetails = reqDetails.replace(/resp\._id/g, "resp.id");
reqDetails = reqDetails.replace(/resp\.donor\.firstName/g, "(resp.donor as any).firstName");
reqDetails = reqDetails.replace(/resp\.donor\.lastName/g, "(resp.donor as any).lastName");
fs.writeFileSync('src/pages/seeker/RequestDetails.tsx', reqDetails);
console.log('Fixed RequestDetails.tsx');

// 4. Fix UsersPage.tsx 
// Need to add 'location' to UserFormData and ensure 'status' is required or optional where expected.
let usersPage = fs.readFileSync('src/pages/shared/UsersPage.tsx', 'utf-8');
// Replace the schema or type usage that's failing
usersPage = usersPage.replace(
  /type UserFormData = z\.infer<typeof userSchema>;/,
  "type UserFormData = z.infer<typeof userSchema> & { location?: string, status?: 'ACTIVE' | 'DISABLED' };"
);
fs.writeFileSync('src/pages/shared/UsersPage.tsx', usersPage);
console.log('Fixed UsersPage.tsx');
