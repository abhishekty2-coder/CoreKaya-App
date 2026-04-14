import React from 'react';
import { ICONS } from '../constants';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Weekly Drop', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-navy' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )},
    { id: 'labs', label: 'The Labs', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-navy' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { id: 'shop', label: 'Shop', icon: (active: boolean) => (
      <span className={`text-xl ${active ? 'grayscale-0' : 'grayscale opacity-40'}`}>{ICONS.SHOP}</span>
    )},
    { id: 'ai', label: 'AI Coach', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-navy' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    )},
    { id: 'profile', label: 'Me', icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-navy' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
      <div className="flex justify-around items-end pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center w-14 transition-transform active:scale-95"
              data-testid={`nav-tab-${tab.id}`}
            >
              <div className={`transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                {tab.icon(isActive)}
              </div>
              <span className={`text-[9px] mt-1 font-medium transition-colors duration-300 ${isActive ? 'text-navy' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
