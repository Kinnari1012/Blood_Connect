import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Bell, Heart, AlertCircle, Info, CheckCircle, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Request Received', title: 'New Blood Request Match', message: 'Rahul Patel requires B+ blood at Shalby Hospital urgently.', time: '2 hours ago', read: false, icon: AlertCircle, color: 'text-red-600 bg-red-100' },
    { id: 2, type: 'Request Accepted', title: 'Request Accepted', message: 'Amit Shah has accepted your blood request (BC-REQ-002).', time: '1 day ago', read: true, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    { id: 3, type: 'Donation Reminder', title: 'Eligibility Reminder', message: 'You are now eligible to donate blood again! Consider saving a life.', time: '3 days ago', read: true, icon: Heart, color: 'text-primary bg-primary/10' },
    { id: 4, type: 'System', title: 'Profile Updated', message: 'Your address and location preferences have been successfully updated.', time: '1 week ago', read: true, icon: Info, color: 'text-blue-600 bg-blue-100' },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
    toast.success('All notifications marked as read');
  };

  const deleteNotif = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <PageLayout title="Notifications" subtitle="View and manage your alerts and updates">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">All Notifications ({notifications.filter(n => !n.read).length} unread)</h3>
          <button onClick={markAllRead} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
            <Check size={16} /> Mark all as read
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {notifications.map(n => (
            <div key={n.id} className={`p-5 flex gap-4 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-primary/5' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                <n.icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm ${!n.read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>{n.title}</h4>
                  <span className="text-xs font-semibold text-gray-400">{n.time}</span>
                </div>
                <p className={`text-sm mb-2 ${!n.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{n.message}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{n.type}</span>
                  {(n.type === 'Request Received' || n.type === 'Request Accepted') && (
                    <button className="text-xs font-bold text-primary hover:underline">Open Request</button>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex items-start">
                <button onClick={() => deleteNotif(n.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              <Bell size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-lg">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
