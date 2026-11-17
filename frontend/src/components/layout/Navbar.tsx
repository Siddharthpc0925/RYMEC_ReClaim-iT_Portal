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
  ExternalLink
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
    { id: 'home', label: 'Campus Radar' },
    { id: 'browse', label: 'Directory' },
    { id: 'report', label: 'Report Lost/Found' },
    { id: 'hotspots', label: 'Drop Desks' },
    { id: 'handover', label: 'Verify PIN' },
    { id: 'about', label: 'About RYMEC' },
  ];

  if (user) {
    navItems.push({ id: 'dashboard', label: 'Dashboard' });
    if (user.role === 'ADMIN') {
      navItems.push({ id: 'admin', label: 'Admin Core' });
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/12 bg-navy-950/70 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.35)] no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Header */}
        <div 
          onClick={() => setCurrentTab('home')}
          className="group flex cursor-pointer items-center gap-3 transition-transform hover:opacity-95"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-sm overflow-hidden p-0.5 backdrop-blur-md shrink-0">
            <img 
              src="/images/vvs-logo.jpg" 
              alt="RYMEC VVS Emblem" 
              className="h-full w-full object-contain rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                RYMEC <span className="text-brand-accent">ReClaim-iT</span>
              </span>
              <span className="rounded-full bg-amber-400/15 border border-amber-300/30 px-2 py-0.5 text-[10px] font-bold text-amber-300 shadow-sm">
                NAAC A+
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-tight text-slate-300/90 line-clamp-1">
              Rao Bahadur Y. Mahabaleswarappa Engineering College
            </p>
          </div>
        </div>

        {/* Desktop Quick Links */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/18 bg-white/5 p-1 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                currentTab === item.id 
                  ? 'text-white ios-glass-btn-primary shadow-sm' 
                  : 'text-silver-300 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Notifications Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full border border-white/15 bg-white/5 p-2 text-silver-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
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
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <CheckCircle className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-silver-400">No new notifications.</div>
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
                                : 'bg-brand-royal/20 border-emerald-400/40 text-white'
                            }`}
                          >
                            <p className="font-medium text-slate-100">{n.message}</p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-silver-400">
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
            className="rounded-full border border-white/15 bg-white/5 p-2 text-silver-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-sm"
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
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15 backdrop-blur-xl transition-all cursor-pointer shadow-sm"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-royal text-[10px] font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="font-semibold hidden sm:inline max-w-[90px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                  {user.points} pts
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl ios-glass-card p-2 shadow-2xl z-50 text-white space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <div className="font-bold text-xs truncate">{user.name}</div>
                      <div className="text-[10px] text-silver-400 font-mono truncate">{user.roll_no}</div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('dashboard');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex items-center gap-2 text-silver-200"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>My Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('certificate');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-white/10 flex items-center gap-2 text-amber-300"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Citation Certificate</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 transition-colors"
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
              className="ios-glass-btn-primary rounded-full px-4 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
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
