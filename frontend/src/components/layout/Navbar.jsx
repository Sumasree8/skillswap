import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, CreditBadge } from '../ui';

const NAV = [
  { to: '/discover', icon: '⊹', label: 'Discover' },
  { to: '/swaps',    icon: '⇄', label: 'Swaps' },
  { to: '/sessions', icon: '⚡', label: 'Sessions' },
  { to: '/circles',  icon: '◎', label: 'Circles' },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-surface-2 bg-surface-0/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <NavLink to="/discover" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-semibold text-ink-1 hidden sm:block">SkillSwap</span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-surface-2 text-ink-1 font-medium'
                    : 'text-ink-4 hover:text-ink-2 hover:bg-surface-2'
                }`
              }
            >
              <span className="hidden sm:block">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right: credits + profile */}
        <div className="flex items-center gap-2 shrink-0">
          {user && <CreditBadge balance={user.creditBalance} />}
          <div className="relative group">
            <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-2 transition-colors">
              <Avatar user={user} size="sm" />
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 mt-1 w-44 card p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 shadow-card-hover">
              <NavLink to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 rounded-lg">
                Profile
              </NavLink>
              <NavLink to="/credits" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 rounded-lg">
                Credits
              </NavLink>
              <div className="divider my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
