import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: string;
  variant?: 'primary' | 'success' | 'warning' | 'emergency' | 'default';
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    success: 'text-green-600 bg-green-50 border-green-100',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    emergency: 'text-red-600 bg-red-50 border-red-100',
    default: 'text-gray-600 bg-gray-50 border-gray-100',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all flex flex-col gap-3 group relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 font-medium text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl border ${variantStyles[variant]} group-hover:scale-110 transition-transform`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-auto text-xs font-semibold">
        <span className={`flex items-center gap-1 ${variant === 'emergency' ? 'text-red-600' : 'text-gray-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
