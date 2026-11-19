import React from 'react';
import { 
  Compass, 
  Archive, 
  Search, 
  Plus, 
  Sparkles, 
  LogOut, 
  LogIn, 
  QrCode, 
  MapPin, 
  Building2, 
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate, onOpenAuth }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Explore board', icon: Compass },
    { to: '/my-items', label: 'My items', icon: Archive, requiresAuth: true },
    { to: '/handover', label: 'Handover desk', icon: QrCode },
    { to: '/hotspots', label: 'Campus grid', icon: MapPin },
    { to: '/about', label: 'About RYMEC', icon: Building2 },
  ];

  if (user && user.role === 'ADMIN') {
    navItems.push({ to: '/admin', label: 'Admin command', icon: ShieldCheck, requiresAuth: true });
  }

  const handleNavClick = (to: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      onOpenAuth();
    } else {
      navigate(to);
    }
  };

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand */}
      <div 
        className="brand"
        onClick={() => navigate('/')}
        aria-label="RYMEC ReClaim-iT home"
      >
        <div className="brand-symbol">
          <img 
            src="/images/vvs-logo.jpg" 
            alt="RYMEC VVS Emblem" 
            className="w-full h-full object-contain"
          />
        </div>

        <span className="brand-copy">
          <span className="brand-wordmark">
            RYMEC <span className="text-emerald-400">ReClaim-iT</span>
          </span>
          <span className="brand-tagline">
            Lost · found · back
          </span>
        </span>
      </div>

      {/* Section title */}
      <span className="nav-section-label">
        Your campus
      </span>

      {/* Navigation */}
      <nav className="primary-nav">
        {navItems.map(({ to, label, icon: Icon, requiresAuth }) => {
          const isActive = to === '/' 
            ? currentPath === '/' || currentPath === '' 
            : currentPath.startsWith(to);
          return (
            <button
              key={to}
              type="button"
              onClick={() => handleNavClick(to, requiresAuth)}
              className={`nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />

      {/* Quick actions */}
      <div className="sidebar-quick-actions">
        <button
          type="button"
          className="button button-primary button-block"
          onClick={() => navigate('/report-lost')}
        >
          <Search size={15} />
          <span>Report lost</span>
        </button>

        <button
          type="button"
          className="button button-block"
          onClick={() => navigate('/report-found')}
        >
          <Plus size={15} />
          <span>Report found</span>
        </button>
      </div>

      {/* User Session Bar */}
      {user ? (
        <div className="space-y-1 mb-2">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate leading-tight">{user.name.split(' ')[0]}</div>
              <div className="text-[10px] text-amber-300 font-mono">★ {user.points || 0} pts</div>
            </div>
          </div>

          <button 
            className="button button-block sidebar-signout button-quiet" 
            type="button" 
            onClick={logout}
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      ) : (
        <button 
          className="button button-block sidebar-signout button-primary mb-2" 
          type="button" 
          onClick={onOpenAuth}
        >
          <LogIn size={14} />
          <span>Sign in / Register</span>
        </button>
      )}

      {/* Sidebar information tip */}
      <div className="sidebar-note">
        <Sparkles size={15} />
        <span>
          <strong>Photo-match hints</strong>
          AI matching uses pHash + colour + text signals across RYMEC campus.
        </span>
      </div>
    </aside>
  );
};
