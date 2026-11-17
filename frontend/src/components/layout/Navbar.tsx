import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  LogIn,
  User as UserIcon, 
  Award,
  CheckCircle,
  ExternalLink,
  Radio,
  Search,
  PlusCircle,
  QrCode,
  MapPin,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';
import { NotificationItem } from '../../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, logout, unreadCount, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(res => setNotifications(res.notifications || []))
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      refreshUser();
    } catch (e) {}
  };

  const navItems = [
    { id: 'home', label: 'Radar Hub', icon: Radio },
    { id: 'browse', label: 'Directory', icon: Search },
    { id: 'report', label: 'Report', icon: PlusCircle, isPrimary: true },
    { id: 'handover', label: 'Handover Desk', icon: QrCode },
    { id: 'hotspots', label: 'Campus Grid', icon: MapPin },
    { id: 'about', label: 'About RYMEC', icon: Building2 },
  ];

  if (user) {
    navItems.push({ id: 'dashboard', label: 'My Vault', icon: UserIcon });
    if (user.role === 'ADMIN') {
      navItems.push({ id: 'admin', label: 'Admin Command', icon: ShieldCheck });
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/12 bg-navy-950/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] no-print">
      
      {/* ── Top Micro-Telemetry Strip ── */}
      <div className="hidden md:flex items-center justify-between px-6 py-1 bg-black/40 border-b border-white/5 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE CAMPUS RECOVERY ACTIVE
          </span>
          <span className="text-white/20">•</span>
          <span>Cantonment, Ballari — 583 104</span>
          <span className="text-white/20">•</span>
          <span className="text-amber-300">NAAC A+ Accredited</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-300">
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            Security Kiosk: <span className="font-mono text-emerald-300">Ext. 204</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="text-slate-300">
            Recovery Rate: <span className="font-bold text-emerald-400">94.8%</span>
          </span>
        </div>
      </div>

      {/* ── Main Command Bar ── */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        
        {/* Brand Identity & Technical Badge */}
        <div 
          onClick={() => setCurrentTab('home')}
          className="group flex cursor-pointer items-center gap-3 transition-transform hover:opacity-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 shadow-sm overflow-hidden p-0.5 backdrop-blur-md shrink-0">
            <img 
              src="/images/vvs-logo.jpg" 
              alt="RYMEC VVS Emblem" 
              className="h-full w-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                RYMEC <span className="text-brand-accent">ReClaim-iT</span>
              </span>
              <span className="rounded px-1.5 py-0.2 text-[9px] font-mono font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 uppercase tracking-wider">
                RADAR
              </span>
            </div>
            <p className="text-[10px] font-medium tracking-tight text-slate-400 line-clamp-1 hidden sm:block">
              R.Y.M. Engineering College • Campus Asset Network
            </p>
          </div>
        </div>

        {/* Central Hub Navigation */}
        <nav className="hidden lg:flex items-center gap-1 rounded-2xl border border-white/15 bg-black/40 p-1 backdrop-blur-xl shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  item.isPrimary
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-500 hover:to-teal-500'
                    : isActive 
                      ? 'bg-white/15 text-white border border-white/20 shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls Tray */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-slate-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl ios-glass-card p-4 shadow-2xl z-50 text-white space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Campus Recovery Alerts
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <CheckCircle className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400">No new notifications.</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.link) {
                                setShowNotifications(false);
                                setCurrentTab(n.link.startsWith('/items/') ? n.link : 'dashboard');
                              }
                            }}
                            className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                              n.is_read
                                ? 'bg-white/5 border-transparent opacity-75'
                                : 'bg-emerald-500/15 border-emerald-400/40 text-white'
                            }`}
                          >
                            <p className="font-medium text-slate-100">{n.message}</p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                              <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {n.link && <span className="text-emerald-300 flex items-center gap-0.5">Open Record <ExternalLink className="w-2.5 h-2.5" /></span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 text-emerald-300" />
            )}
          </button>

          {/* User Profile or Sign In Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-white hover:bg-emerald-500/20 backdrop-blur-xl transition-all cursor-pointer shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-[10px] font-bold text-white uppercase shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-xs leading-none truncate max-w-[90px]">
                    {user.name.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-amber-300 font-mono mt-0.5">
                    ★ {user.points || 0} pts
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl ios-glass-card p-2 shadow-2xl z-50 text-white space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <div className="font-bold text-xs truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{user.roll_no}</div>
                      <div className="mt-1 text-[10px] text-amber-300 font-semibold">
                        ★ {user.points || 0} Recovery Karma Points
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('dashboard');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex items-center gap-2 text-slate-200 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>My Recovery Vault</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('certificate');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex items-center gap-2 text-amber-300 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Citation Certificate</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="ios-glass-btn-primary rounded-xl px-4 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
