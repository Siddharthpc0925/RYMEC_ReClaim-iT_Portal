import React from 'react';
import { Compass, Search, PlusCircle, ShieldAlert, KeyRound, User, MapPin } from 'lucide-react';
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
    { id: 'home', label: 'Radar', icon: Compass },
    { id: 'browse', label: 'Directory', icon: Search },
    { id: 'report', label: 'Report', icon: PlusCircle, isMain: true },
    { id: 'hotspots', label: 'Hotspots', icon: MapPin },
    { id: 'handover', label: 'Verify PIN', icon: KeyRound },
    { id: 'dashboard', label: 'Account', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-4 right-4 z-40 pointer-events-none no-print">
      <div className="bottom-nav-glass rounded-2xl px-2 py-1.5 flex items-center justify-around pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-emerald-500/25 bg-navy-950/85 backdrop-blur-2xl">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          if (tab.isMain) {
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab('report')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-[11px] shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
                title="Report Lost or Found Item"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Item</span>
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
              className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium leading-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
