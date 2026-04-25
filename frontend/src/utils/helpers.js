import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDate = (date, fmt = 'MMM d, yyyy') => format(new Date(date), fmt);

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const getAvatarUrl = (avatar, name) => {
  if (avatar) return avatar;
  const initials = getInitials(name);
  const colors = ['6366F1','8B5CF6','EC4899','F59E0B','10B981','3B82F6'];
  const color = colors[name?.charCodeAt(0) % colors.length] || '6366F1';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&bold=true&size=128`;
};

export const formatCredits = (n) => {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString();
};

export const getAvgRating = (rating, count) => {
  if (!count) return null;
  return (rating / count).toFixed(1);
};

export const clsx = (...args) =>
  args.flat().filter(Boolean).join(' ');

export const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'text-warning bg-warning/10 border-warning/20' },
  accepted:    { label: 'Accepted',    color: 'text-success bg-success/10 border-success/20' },
  in_progress: { label: 'In Progress', color: 'text-accent-light bg-accent/10 border-accent/20' },
  completed:   { label: 'Completed',   color: 'text-ink-3 bg-surface-3 border-surface-4' },
  cancelled:   { label: 'Cancelled',   color: 'text-danger bg-danger/10 border-danger/20' },
  rejected:    { label: 'Rejected',    color: 'text-danger bg-danger/10 border-danger/20' },
  open:        { label: 'Open',        color: 'text-success bg-success/10 border-success/20' },
  active:      { label: 'Active',      color: 'text-accent-light bg-accent/10 border-accent/20' },
};
