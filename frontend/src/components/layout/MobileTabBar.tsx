import React from 'react';
import { Home, Compass, PlusCircle, QrCode, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileTabBarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ currentRoute, navigate }) => {
  const { user } = useAuth();

  const tabs = [
    { label: 'Home', route: '/', icon: Home },
    { label: 'Browse', route: '/browse', icon: Compass },
    { label: 'Report', route: '/report', icon: PlusCircle, isMain: true },
    { label: 'Handover', route: '/handover', icon: QrCode },
    { label: 'Dashboard', route: user ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none no-print">
      <div className="glass-nav rounded-2xl px-2 py-2 flex items-center justify-around pointer-events-auto border border-white/25 shadow-2xl backdrop-blur-3xl">
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.route;
          const Icon = tab.icon;

          if (tab.isMain) {
            return (
              <button
                key={tab.route}
                onClick={() => navigate(tab.route)}
                className="relative -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 active:scale-95 transition-transform"
                title="Report Lost or Found Item"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={tab.route}
              onClick={() => navigate(tab.route)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
