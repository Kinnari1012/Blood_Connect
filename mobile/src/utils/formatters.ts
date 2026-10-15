import { BLOOD_GROUP_DISPLAY } from '../constants/bloodGroups';

export function formatBloodGroup(bg?: string): string {
  if (!bg) return 'Unknown';
  return (BLOOD_GROUP_DISPLAY[bg] as string) || bg;
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return String(dateString);
  }
}

export function formatPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
}

export function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return f + l || 'BC';
}
