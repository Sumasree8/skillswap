import { getAvatarUrl, getInitials } from '../../utils/helpers';

// ---- Avatar ----
export const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  return (
    <div className={`relative inline-flex shrink-0 ${sizes[size]} ${className}`}>
      <img
        src={getAvatarUrl(user?.avatar, user?.name)}
        alt={user?.name}
        className="w-full h-full rounded-full object-cover bg-surface-3"
        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${getInitials(user?.name)}&background=6366F1&color=fff&bold=true`; }}
      />
      {user?.isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface-1" />
      )}
    </div>
  );
};

// ---- StatusBadge ----
export const StatusBadge = ({ status }) => {
  const MAP = {
    pending:     ['Pending',     'bg-warning/10 text-warning border-warning/20'],
    accepted:    ['Accepted',    'bg-success/10 text-success border-success/20'],
    in_progress: ['In Progress', 'bg-accent/10 text-accent-light border-accent/20'],
    completed:   ['Completed',   'bg-surface-3 text-ink-3 border-surface-4'],
    cancelled:   ['Cancelled',   'bg-danger/10 text-danger border-danger/20'],
    rejected:    ['Rejected',    'bg-danger/10 text-danger border-danger/20'],
    open:        ['Open',        'bg-success/10 text-success border-success/20'],
    active:      ['Active',      'bg-accent/10 text-accent-light border-accent/20'],
    expired:     ['Expired',     'bg-surface-3 text-ink-4 border-surface-4'],
  };
  const [label, cls] = MAP[status] || ['Unknown', 'bg-surface-3 text-ink-4 border-surface-4'];
  return <span className={`badge border ${cls}`}>{label}</span>;
};

// ---- SkillTag ----
export const SkillTag = ({ name, verified = false, level, small = false }) => (
  <span className={`skill-tag ${small ? 'text-xs px-1.5 py-0.5' : ''}`}>
    {name}
    {verified && <span className="ml-0.5 text-accent-light" title="Verified">✓</span>}
    {level && <span className="ml-1 opacity-60 text-[10px]">{level}</span>}
  </span>
);

// ---- Spinner ----
export const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${s[size]} border-2 border-surface-4 border-t-accent rounded-full animate-spin ${className}`} />
  );
};

// ---- EmptyState ----
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && <div className="text-4xl mb-4 opacity-40">{icon}</div>}
    <h3 className="text-ink-2 font-medium mb-1">{title}</h3>
    {description && <p className="text-ink-4 text-sm mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
);

// ---- StarRating ----
export const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
  const s = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };
  return (
    <div className={`flex gap-0.5 ${s[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${
            star <= value ? 'text-credit' : 'text-surface-4'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// ---- MatchScoreBadge ----
export const MatchScoreBadge = ({ score }) => {
  const color = score >= 70 ? 'text-success' : score >= 40 ? 'text-warning' : 'text-ink-4';
  return (
    <div className={`flex flex-col items-center ${color}`}>
      <span className="text-lg font-bold font-mono">{score}%</span>
      <span className="text-[10px] text-ink-5">match</span>
    </div>
  );
};

// ---- CreditBadge ----
export const CreditBadge = ({ balance, size = 'sm' }) => (
  <div className={`flex items-center gap-1.5 bg-credit/10 text-credit border border-credit/20 rounded-xl px-2.5 py-1 ${size === 'lg' ? 'text-base font-bold' : 'text-sm font-medium'}`}>
    <span>◈</span>
    <span>{balance?.toLocaleString() ?? '—'}</span>
  </div>
);

// ---- Modal ----
export const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} card p-6 animate-slide-up`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 text-ink-4">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ---- Toast (simple) ----
export const toast = {
  _el: null,
  show(msg, type = 'info') {
    const existing = document.getElementById('ss-toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'ss-toast';
    el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:500;color:white;animation:fadeIn 0.2s ease;max-width:320px;`;
    el.style.background = type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#6366F1';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  },
  success: (msg) => toast.show(msg, 'success'),
  error: (msg) => toast.show(msg, 'error'),
  info: (msg) => toast.show(msg, 'info'),
};
