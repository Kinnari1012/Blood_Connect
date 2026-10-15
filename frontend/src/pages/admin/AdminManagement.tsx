import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { ShieldCheck, UserPlus, Search, Edit2, ShieldOff, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

export function AdminManagement() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'add'>('all');
  const [search, setSearch] = useState('');

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admins-list'],
    queryFn: async () => {
      const res = await adminApi.getAdmins();
      return res.data?.data || [];
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      return await adminApi.createAdmin({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
      });
    },
    onSuccess: () => {
      toast.success('Admin account created successfully! Audit log updated.');
      qc.invalidateQueries({ queryKey: ['admins-list'] });
      setActiveTab('all');
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) => {
      return await adminApi.updateAdminStatus(id, status);
    },
    onSuccess: (_, vars) => {
      toast.success(`Admin account ${vars.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully.`);
      qc.invalidateQueries({ queryKey: ['admins-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update admin status');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    createAdminMutation.mutate(form);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    if (window.confirm(`Are you sure you want to ${nextStatus === 'ACTIVE' ? 'activate' : 'deactivate'} this admin?`)) {
      updateStatusMutation.mutate({ id, status: nextStatus });
    }
  };

  const rawAdmins = Array.isArray(data) ? data : [];
  const admins = rawAdmins.map((a: any) => ({
    id: a._id || a.id,
    name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Admin User',
    email: a.email,
    phone: a.phone,
    role: a.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'System Admin',
    isSuperAdmin: a.role === 'SUPER_ADMIN',
    status: a.status === 'DISABLED' ? 'Inactive' : 'Active',
    rawStatus: a.status || 'ACTIVE',
    login: a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : 'Active',
  }));

  const filtered = admins.filter((a: any) => {
    if (activeTab === 'active' && a.status !== 'Active') return false;
    if (activeTab === 'inactive' && a.status !== 'Inactive') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <PageLayout title="Admin Management" subtitle="Create, monitor, and manage administrator access and security privileges">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-full md:w-auto overflow-x-auto">
            {(['all', 'active', 'inactive', 'add'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap ${
                  activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {t === 'add' ? '+ Add Admin' : `${t} Admins`}
              </button>
            ))}
          </div>
          {activeTab !== 'add' && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search admins..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          {activeTab === 'add' ? (
            <div className="max-w-2xl mx-auto p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <UserPlus size={20} className="text-primary" /> Create New Admin
              </h2>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="First Name"
                    required
                    value={form.firstName}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    placeholder="e.g. Rahul"
                  />
                  <Input
                    label="Last Name"
                    required
                    value={form.lastName}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    placeholder="e.g. Patel"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="admin@lifelink.org"
                  />
                  <Input
                    label="Mobile Number"
                    required
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                  <Input
                    label="Password (min 8 chars)"
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword: e.target.value})}
                  />
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAdminMutation.isPending}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
                  >
                    {createAdminMutation.isPending ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-gray-400">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <p className="text-sm font-medium">Loading platform administrators...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Failed to fetch administrator accounts</p>
              <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <p className="text-base font-semibold text-gray-700">No administrators found</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Administrator</th>
                  <th className="px-6 py-4 font-bold">Role / Dept</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Contact Phone</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          {a.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{a.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${a.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{a.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!a.isSuperAdmin && (
                          <button
                            onClick={() => handleToggleStatus(a.id, a.rawStatus)}
                            disabled={updateStatusMutation.isPending}
                            className={`p-2 rounded-lg transition-colors ${
                              a.status === 'Active'
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={a.status === 'Active' ? 'Deactivate Admin' : 'Activate Admin'}
                          >
                            {a.status === 'Active' ? <ShieldOff size={16}/> : <CheckCircle size={16}/>}
                          </button>
                        )}
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
