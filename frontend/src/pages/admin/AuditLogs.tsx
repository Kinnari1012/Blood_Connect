import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Database, Search } from 'lucide-react';

export function AuditLogs() {
  const logs = [
    { id: 'AUD-001', admin: 'Kinnari (SuperAdmin)', action: 'Deactivated User USR-092', ip: '192.168.1.1', time: '10 mins ago' },
    { id: 'AUD-002', admin: 'Rahul (Admin)', action: 'Verified Request REQ-082', ip: '10.0.0.5', time: '1 hour ago' },
    { id: 'AUD-003', admin: 'System', action: 'Automated Backup Completed', ip: 'localhost', time: '5 hours ago' },
  ];

  return (
    <PageLayout title="System Audit Logs" subtitle="Secure, read-only record of all critical system events">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Database size={20} className="text-primary"/> Security Audit Trail</h2>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search by Action or Admin..." className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all" />
          </div>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold">Event ID</th>
                <th className="px-6 py-4 font-bold">Actor</th>
                <th className="px-6 py-4 font-bold">Action</th>
                <th className="px-6 py-4 font-bold">IP Address</th>
                <th className="px-6 py-4 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors text-gray-700">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{l.id}</td>
                  <td className="px-6 py-4 font-bold">{l.admin}</td>
                  <td className="px-6 py-4">{l.action}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{l.ip}</td>
                  <td className="px-6 py-4 text-xs">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
