import React from 'react';
import { ActiveTab } from '../types/game';
import { playClickSound } from '../utils/audio';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unreadNightEvents?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, unreadNightEvents }) => {
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'lobby-sala', label: 'Lobby', icon: 'meeting_room' },
    { id: 'mi-carta', label: 'Mi Carta', icon: 'style' },
    { id: 'noche', label: 'Noche', icon: 'dark_mode' },
    { id: 'aldea-juicio', label: 'Juicio', icon: 'gavel' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-[#0a0e18]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 gap-1 transition-all duration-200 cursor-pointer relative ${
                isActive
                  ? 'text-[#ffb4ab] scale-105 font-bold drop-shadow-[0_0_10px_rgba(255,180,171,0.35)]'
                  : 'text-[#e6bdb8]/70 hover:text-[#dfe2f1]'
              }`}
            >
              <div className="relative">
                <span className="material-symbols-outlined text-[22px]">
                  {tab.icon}
                </span>
                {tab.id === 'noche' && unreadNightEvents && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#dc2626] animate-ping" />
                )}
              </div>
              <span className="text-[10px] tracking-wider uppercase font-semibold">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-8 h-0.5 rounded-full bg-[#ffb4ab] shadow-[0_0_8px_#ffb4ab]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
