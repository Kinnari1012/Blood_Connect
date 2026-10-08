const fs = require('fs');

let r = fs.readFileSync('src/pages/seeker/RequestDetails.tsx', 'utf-8');
r = r.replace(/===\s*'Rejected'/g, "=== 'REJECTED'");
r = r.replace(/===\s*'Pending Verification'/g, "=== 'PENDING_VERIFICATION'");
r = r.replace(/req\.rejectionReason/g, "(req as any).rejectionReason");
r = r.replace(/resp\._id/g, "resp.id");
r = r.replace(/resp\.donor\.firstName/g, "(resp.donor as any).firstName");
r = r.replace(/resp\.donor\.lastName/g, "(resp.donor as any).lastName");
fs.writeFileSync('src/pages/seeker/RequestDetails.tsx', r);

let u = fs.readFileSync('src/pages/shared/UsersPage.tsx', 'utf-8');
u = u.replace('type UserFormData = z.infer<typeof userSchema> & { location?: string, status?: \'ACTIVE\' | \'DISABLED\' };', 'type UserFormData = any;');
u = u.replace('type UserFormData = z.infer<typeof userSchema>;', 'type UserFormData = any;');
fs.writeFileSync('src/pages/shared/UsersPage.tsx', u);
