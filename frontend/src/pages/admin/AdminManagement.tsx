import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { ShieldCheck, UserPlus, Search, Edit2, ShieldOff, CheckCircle } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export function AdminManagement() {
  const [activeTab, setActiveTab] = useState('all');
  
  const admins = [
    { id: 'ADM-001', name: 'Kinnari Patel', email: 'kinnari@bloodconnect.com', role: 'Regional Admin', status: 'Active', login: '2 mins ago' },
    { id: 'ADM-002', name: 'Rahul Shah', email: 'rahul@bloodconnect.com', role: 'Verification Admin', status: 'Active', login: '1 hour ago' },
    { id: 'ADM-003', name: 'Amit Desai', email: 'amit@bloodconnect.com', role: 'Support Admin', status: 'Inactive', login: '2 days ago' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Admin account created successfully! Audit log updated.');
    setActiveTab('all');
  };

  const handleAction = (id: string, act: string) => {
    toast.success(`Admin ${id} ${act} successfully.`);
  };

  const filtered = activeTab === 'active' ? admins.filter(a => a.status === 'Active') 
                 : activeTab === 'inactive' ? admins.filter(a => a.status === 'Inactive') 
                 : admins;

  return (
    <PageLayout title="Admin Management" subtitle="Create, monitor, and manage administrator access">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-full md:w-auto overflow-x-auto">
            {['all', 'active', 'inactive', 'add'].map(t => (
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
              <input type="text" placeholder="Search admins..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          {activeTab === 'add' ? (
            <div className="max-w-2xl mx-auto p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><UserPlus size={20} className="text-primary" /> Create New Admin</h2>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <Input label="Full Name" required />
                  <Input label="Email Address" type="email" required />
                  <Input label="Mobile Number" required />
                  <Select label="Role/Department" options={[{label:'Regional Admin', value:'1'}, {label:'Verification Admin', value:'2'}]} />
                  <Input label="Password" type="password" required />
                  <Input label="Confirm Password" type="password" required />
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setActiveTab('all')} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl">Create Admin</button>
                </div>
              </form>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Administrator</th>
                  <th className="px-6 py-4 font-bold">Role / Dept</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Last Login</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">{a.name.charAt(0)}</div>
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
                    <td className="px-6 py-4 text-gray-500 text-xs">{a.login}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleAction(a.id, 'edited')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        {a.status === 'Active' ? (
                          <button onClick={() => handleAction(a.id, 'deactivated')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate"><ShieldOff size={16}/></button>
                        ) : (
                          <button onClick={() => handleAction(a.id, 'activated')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Activate"><CheckCircle size={16}/></button>
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
