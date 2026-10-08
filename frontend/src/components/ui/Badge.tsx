import React from 'react';
import { BloodGroup } from '../../types';
import { BLOOD_GROUP_DISPLAY } from '../../constants';

// ─── Blood group badge (coloured by type) ────────────────────────────────────
const BG_COLORS: Record<string, { bg: string; text: string }> = {
  A_POS:  { bg: '#FFCDD2', text: '#B71C1C' },
  A_NEG:  { bg: '#EF9A9A', text: '#7F0000' },
  B_POS:  { bg: '#FFE0B2', text: '#BF360C' },
  B_NEG:  { bg: '#FFCC80', text: '#8D3200' },
  AB_POS: { bg: '#E1BEE7', text: '#4A148C' },
  AB_NEG: { bg: '#CE93D8', text: '#38006B' },
  O_POS:  { bg: '#BBDEFB', text: '#0D47A1' },
  O_NEG:  { bg: '#90CAF9', text: '#01295F' },
};

interface BloodGroupBadgeProps {
  group: BloodGroup;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BloodGroupBadge({ group, size = 'md', className = '' }: BloodGroupBadgeProps) {
  const c = BG_COLORS[group] || { bg: '#FFCDD2', text: '#B71C1C' };
  const sizes = {
    sm: { fontSize: 11, padding: '2px 8px', borderRadius: 20 },
    md: { fontSize: 13, padding: '4px 10px', borderRadius: 20 },
    lg: { fontSize: 16, padding: '6px 14px', borderRadius: 24 },
  };
  return (
    <span
      className={`inline-flex items-center font-bold ${className}`}
      style={{ background: c.bg, color: c.text, ...sizes[size] }}
    >
      {BLOOD_GROUP_DISPLAY[group]}
    </span>
  );
}

// ─── General Badge ────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'emergency';
  className?: string;
}

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  default:   { bg: '#F5F5F5', text: '#616161' },
  success:   { bg: '#E8F5E9', text: '#2E7D32' },
  warning:   { bg: '#FFF8E1', text: '#F57F17' },
  danger:    { bg: '#FFEBEE', text: '#C62828' },
  info:      { bg: '#E3F2FD', text: '#1565C0' },
  emergency: { bg: '#D32F2F', text: '#FFFFFF' },
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const s = BADGE_STYLES[variant];
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${className}`}
      style={{ background: s.bg, color: s.text }}
    >
      {children}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  PENDING:         { variant: 'warning',   label: 'Pending' },
  MATCHING:        { variant: 'info',      label: 'Finding Donors' },
  DONOR_ACCEPTED:  { variant: 'success',   label: 'Donor Found' },
  IN_PROGRESS:     { variant: 'info',      label: 'In Progress' },
  COMPLETED:       { variant: 'success',   label: 'Completed' },
  CANCELLED:       { variant: 'default',   label: 'Cancelled' },
  ACTIVE:          { variant: 'success',   label: 'Active' },
  INACTIVE:        { variant: 'default',   label: 'Inactive' },
  SUSPENDED:       { variant: 'danger',    label: 'Suspended' },
  PENDING_VERIFY:  { variant: 'warning',   label: 'Pending' },
  NEW:             { variant: 'danger',    label: 'New' },
  UNDER_REVIEW:    { variant: 'warning',   label: 'Under Review' },
  RESOLVED:        { variant: 'success',   label: 'Resolved' },
  DISMISSED:       { variant: 'default',   label: 'Dismissed' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] || { variant: 'default' as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
