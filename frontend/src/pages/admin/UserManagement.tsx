import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Search, Edit2, UserX, CheckCircle, SearchX, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

export function UserManagement() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');

  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users-mgmt', search, activeTab],
    queryFn: async () => {
      const res = await adminApi.getUsers({
        search: search.trim() || undefined,
        status: activeTab === 'active' ? 'ACTIVE' : activeTab === 'inactive' ? 'DISABLED' : undefined,
      });
      return res.data?.data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) => {
      return await adminApi.updateUserStatus(id, { status });
    },
    onSuccess: (_, vars) => {
      toast.success(`User status updated to ${vars.status === 'ACTIVE' ? 'Active' : 'Disabled'}`);
      qc.invalidateQueries({ queryKey: ['admin-users-mgmt'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    },
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'DISABLED' : 'ACTIVE';
    if (window.confirm(`Are you sure you want to ${nextStatus === 'ACTIVE' ? 'activate' : 'deactivate'} this user?`)) {
      updateStatusMutation.mutate({ id, status: nextStatus });
    }
  };

  const rawUsers = Array.isArray(data) ? data : [];
  const users = rawUsers.map((u: any) => ({
    id: u._id || u.id,
    name: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
    email: u.email,
    mobile: u.phone || 'N/A',
    bg: u.bloodGroup || 'N/A',
    city: u.city || 'Gujarat',
    status: u.status === 'DISABLED' ? 'Inactive' : 'Active',
    rawStatus: u.status || 'ACTIVE',
  }));

  return (
    <PageLayout title="User Management" subtitle="Manage and monitor platform users and donor accounts">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['all', 'active', 'inactive'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap ${
                  activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {t} Users
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-gray-400">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <p className="text-sm font-medium">Loading platform users...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Unable to fetch users</p>
              <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold">Retry</button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
              <SearchX size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-bold">No users found</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">Blood Group</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{u.email}</p>
                      <p className="text-xs text-gray-500">{u.mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-md border border-red-100">
                        {u.bg}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.city}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          disabled={updateStatusMutation.isPending}
                          className={`p-2 rounded-lg transition-colors ${
                            u.status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.status === 'Active' ? <UserX size={16}/> : <CheckCircle size={16}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
