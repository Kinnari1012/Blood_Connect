import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Users, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState, Alert } from '../../components/ui/Alert';

const createUserSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  dateOfBirth: z.string(),
  age: z.coerce.number().min(18),
  weight: z.coerce.number().min(45),
  address: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  availability: z.boolean().default(true),
  status: z.enum(['ACTIVE', 'DISABLED']).default('ACTIVE'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiError, setApiError] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminApi.getUsers({ search }).then(r => r.data),
  });

  const createUser = useMutation({
    mutationFn: (data: CreateUserForm) => adminApi.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setIsModalOpen(false);
      toast.success('User created successfully');
    },
    onError: (e: any) => setApiError(e?.response?.data?.error?.message || 'Failed to create user'),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateUserStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { status: 'ACTIVE', availability: true },
  });

  const users = usersData?.data || [];

  return (
    <PageLayout title="Users Directory" subtitle="Manage all registered platform users">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <h2 className="text-lg font-bold text-gray-900">All Users</h2>
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search users..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
               />
             </div>
             <button onClick={() => { setIsModalOpen(true); reset(); setApiError(''); }} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 focus:outline-none transition-colors">
               Add User
             </button>
           </div>
        </div>
        
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-500">
             <Users size={48} className="text-gray-300 mb-4" />
             <p className="text-lg font-medium text-gray-900">No users found</p>
             <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Name & Email</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Blood Group</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.phone}</td>
                    <td className="px-6 py-4 font-medium text-red-600">{u.bloodGroup || u.donorProfile?.bloodGroup || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.city || u.donorProfile?.city || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN' && (
                        u.status === 'ACTIVE' ? (
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateStatus.mutate({ id: u.id, status: 'DISABLED' })}>
                            Disable
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateStatus.mutate({ id: u.id, status: 'ACTIVE' })}>
                            Enable
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button form="create-user-form" type="submit" loading={isSubmitting}>Create User</Button>
          </>
        }
      >
        {apiError && <Alert type="error" className="mb-3">{apiError}</Alert>}
        <form id="create-user-form" onSubmit={handleSubmit(d => createUser.mutate(d))} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" error={errors.firstName?.message} required {...register('firstName')} />
            <Input label="Last Name" error={errors.lastName?.message} required {...register('lastName')} />
          </div>
          <Input label="Email" type="email" error={errors.email?.message} required {...register('email')} />
          <Input label="Phone Number" error={errors.phone?.message} required {...register('phone')} />
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="Password" type="password" error={errors.password?.message} required {...register('password')} />
            <Input label="Confirm Password" type="password" error={errors.confirmPassword?.message} required {...register('confirmPassword')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
              <select className="w-full h-11 px-3 rounded-xl border border-gray-200" {...register('bloodGroup')}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <Input label="Date of Birth" type="date" error={errors.dateOfBirth?.message} required {...register('dateOfBirth')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Age" type="number" error={errors.age?.message} required {...register('age')} />
            <Input label="Weight (kg)" type="number" error={errors.weight?.message} required {...register('weight')} />
          </div>

          <Input label="Address" error={errors.address?.message} {...register('address')} />
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" error={errors.city?.message} required {...register('city')} />
            <Input label="State" error={errors.state?.message} {...register('state')} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="Country" error={errors.country?.message} {...register('country')} />
            <Input label="Location (Map URL or Text)" error={errors.location?.message} {...register('location')} />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select className="w-full h-11 px-3 rounded-xl border border-gray-200" {...register('status')}>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary" {...register('availability')} />
                <span className="text-sm font-medium text-gray-700">Available to Donate</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
