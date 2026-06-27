import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDate = (date, fmt = 'MMM d, yyyy') => format(new Date(date), fmt);

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// Uploaded photo wins; otherwise a unique DiceBear avatar (open-license,
// illustrated — safe to show publicly, no real-person likeness).
export const getAvatarUrl = (avatar, name) => {
  if (avatar) return avatar;
  const seed = encodeURIComponent(name || 'user');
  // Soft varied backgrounds so the line-art reads as a polished, filled avatar.
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}` +
    `&backgroundColor=c0aede,b6e3f4,d1d4f9,ffd5dc,ffdfbf,c1e7d8&radius=50`;
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
