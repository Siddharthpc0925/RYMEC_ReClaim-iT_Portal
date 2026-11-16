import React from 'react';
import { Home, PlusCircle, Search, QrCode, User, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LiquidBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const LiquidBottomNav: React.FC<LiquidBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth
}) => {
  const { user } = useAuth();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'browse', label: 'Browse', icon: Search },
    { id: 'report', label: 'Report', icon: PlusCircle, isMain: true },
    { id: 'handover', label: 'Handover', icon: QrCode },
    { id: 'dashboard', label: 'Account', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none no-print">
      <div className="bottom-nav-glass rounded-2xl px-2 py-2 flex items-center justify-around pointer-events-auto shadow-2xl">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          if (tab.isMain) {
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab('report')}
                className="relative -top-3 w-12 h-12 rounded-full ios-glass-btn-primary flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                title="Report Lost or Found Item"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'dashboard' && !user) {
                  onOpenAuth();
                } else {
                  setCurrentTab(tab.id);
                }
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-sky-400 font-bold'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
