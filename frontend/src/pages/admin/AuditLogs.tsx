import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Database, Search, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../services/api';

export function AuditLogs() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', search],
    queryFn: async () => {
      const res = await auditApi.getLogs({ action: search.trim() || undefined });
      return res.data?.data || [];
    },
  });

  const logs = Array.isArray(data) ? data : [];

  return (
    <PageLayout title="System Audit Logs" subtitle="Secure, read-only record of all critical system events and security trails">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Database size={20} className="text-primary"/> Security Audit Trail
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by action, e.g. LOGIN, USER..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-gray-400">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <p className="text-sm font-medium">Loading audit events...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Unable to fetch system audit logs</p>
              <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold">Retry</button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <p className="text-base font-semibold text-gray-700">No audit logs found</p>
              <p className="text-xs text-gray-400 mt-1">System actions and admin events will appear here</p>
            </div>
          ) : (
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
                {logs.map((l: any, i: number) => {
                  const eventId = `AUD-${(l._id || l.id || `${i}`).slice(-6).toUpperCase()}`;
                  return (
                    <tr key={l._id || l.id || i} className="hover:bg-gray-50 transition-colors text-gray-700">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{eventId}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{l.admin || 'System'}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {l.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{l.ip || '127.0.0.1'}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{l.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
