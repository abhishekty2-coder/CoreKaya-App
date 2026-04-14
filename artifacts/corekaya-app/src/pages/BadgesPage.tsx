import React from 'react';
import { useUser } from '../context/UserContext';

interface BadgesPageProps {
  onClose: () => void;
}

export const BadgesPage: React.FC<BadgesPageProps> = ({ onClose }) => {
  const { badges } = useUser();

  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[150] bg-sand flex flex-col animate-[slideUp_0.3s_ease-out]">
      <div className="flex items-center justify-between px-6 pt-12 pb-4 bg-white border-b border-gray-100 sticky top-0">
        <h2 className="font-serif text-2xl text-charcoal">Your Achievements</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg active:scale-95 transition-transform"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-16">
        {earned.length > 0 && (
          <section className="mt-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Earned</h3>
            <div className="grid grid-cols-4 gap-3">
              {earned.map(badge => (
                <div key={badge.id} className="flex flex-col items-center text-center">
                  <div className="w-[80px] h-[80px] bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 mb-1.5">
                    <span style={{ fontSize: 36 }}>{badge.iconEmoji}</span>
                  </div>
                  <span className="font-serif text-[11px] text-charcoal leading-tight">{badge.name}</span>
                  {badge.earnedAt && (
                    <span className="text-[10px] text-gray-400 mt-0.5">{formatDate(badge.earnedAt as unknown as string)}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {locked.length > 0 && (
          <section className="mt-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Locked</h3>
            <div className="grid grid-cols-4 gap-3">
              {locked.map(badge => (
                <div key={badge.id} className="flex flex-col items-center text-center">
                  <div className="w-[80px] h-[80px] bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden mb-1.5">
                    <span style={{ fontSize: 36 }} className="grayscale opacity-40">{badge.iconEmoji}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <span className="text-lg">🔒</span>
                    </div>
                  </div>
                  <span className="font-serif text-[11px] text-gray-400 leading-tight">{badge.name}</span>
                  <span className="text-[10px] text-gray-300 mt-0.5 leading-tight">{badge.description}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {earned.length === 0 && locked.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl mb-4">🏅</span>
            <h3 className="font-serif text-xl text-charcoal mb-2">No badges yet</h3>
            <p className="text-sm text-gray-400">Complete your first workout to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
