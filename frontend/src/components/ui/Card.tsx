import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const PAD = { none: '0', sm: '12px', md: '16px', lg: '24px' };

export function Card({ children, className = '', onClick, padding = 'md', hoverable = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl ${hoverable ? 'card-hover cursor-pointer' : ''} ${className}`}
      style={{
        background: 'white',
        border: '1px solid #F0F0F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        padding: PAD[padding],
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'red' | 'green' | 'blue' | 'orange' | 'purple';
  trend?: { value: string; positive: boolean };
}

const COLORS = {
  red:    { bg: '#FFF5F5', iconBg: '#FFCDD2', text: '#C62828' },
  green:  { bg: '#F1F8E9', iconBg: '#C8E6C9', text: '#2E7D32' },
  blue:   { bg: '#E3F2FD', iconBg: '#BBDEFB', text: '#1565C0' },
  orange: { bg: '#FFF3E0', iconBg: '#FFE0B2', text: '#E65100' },
  purple: { bg: '#F3E5F5', iconBg: '#E1BEE7', text: '#6A1B9A' },
};

export function StatCard({ label, value, icon, color = 'red', trend }: StatCardProps) {
  const c = COLORS[color];
  return (
    <div
      className="rounded-2xl flex items-center gap-3 p-4 card-hover"
      style={{ background: 'white', border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-xl"
        style={{ width: 44, height: 44, background: c.iconBg, color: c.text }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate leading-tight">{label}</p>
        <p className="text-2xl font-bold leading-tight" style={{ color: c.text }}>{value}</p>
        {trend && (
          <p className="text-xs mt-0.5" style={{ color: trend.positive ? '#2E7D32' : '#C62828' }}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
