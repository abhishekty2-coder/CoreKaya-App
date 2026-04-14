import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { BadgesPage } from './BadgesPage';

const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, name: "Beginner", nextXp: 200 },
  { level: 2, minXp: 200, name: "Practitioner", nextXp: 500 },
  { level: 3, minXp: 500, name: "Devotee", nextXp: 1000 },
  { level: 4, minXp: 1000, name: "Expert", nextXp: 2000 },
  { level: 5, minXp: 2000, name: "CoreKaya Master", nextXp: 2000 },
];

const FEELING_COLORS: Record<string, string> = {
  easy: 'bg-green-400',
  good: 'bg-orange',
  tough: 'bg-red-400',
};
const FEELING_HEIGHT: Record<string, string> = {
  easy: '33%', good: '66%', tough: '100%',
};

const DAY_ABBREVS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ProfilePage() {
  const { userState, xpData, badges, checkInHistory } = useUser();
  const [showBadges, setShowBadges] = useState(false);

  const earnedBadges = badges.filter(b => b.earned);
  const recentBadges = [...earnedBadges].slice(0, 3);

  const last7Checkins = checkInHistory.slice(0, 7);

  const level = xpData.level;
  const threshold = LEVEL_THRESHOLDS.find(t => t.level === level) || LEVEL_THRESHOLDS[0];
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1);
  const progressPct = nextThreshold
    ? Math.min(100, ((xpData.totalXp - threshold.minXp) / (nextThreshold.minXp - threshold.minXp)) * 100)
    : 100;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const hasCheckin = checkInHistory.some(c => {
      const cDate = new Date(c.checkedInAt as unknown as string).toISOString().split('T')[0];
      return cDate === dateStr;
    });
    return { day: DAY_ABBREVS[d.getDay() === 0 ? 6 : d.getDay() - 1], dateStr, done: hasCheckin };
  });

  const thisWeekCount = checkInHistory.filter(c => {
    const d = new Date(c.checkedInAt as unknown as string);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  const favApparatus = (() => {
    if (checkInHistory.length === 0) return '—';
    const counts: Record<string, number> = {};
    checkInHistory.forEach(c => {
      if (c.workoutTitle) counts[c.workoutTitle] = (counts[c.workoutTitle] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0]?.split(' ')[0] || '—';
  })();

  return (
    <div className="min-h-screen bg-sand pb-24">
      {showBadges && <BadgesPage onClose={() => setShowBadges(false)} />}

      <div className="bg-navy pt-12 pb-8 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-orange flex items-center justify-center mx-auto mb-3">
          <span className="font-serif text-xl text-white font-bold">KM</span>
        </div>
        <h2 className="font-serif text-xl text-white mb-2">Kaya Member</h2>
        <span className="text-xs bg-orange text-white px-3 py-1 rounded-full font-medium">
          Level {level} · {xpData.levelName}
        </span>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* XP Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-3">
            Progress to {nextThreshold?.name || 'Max Level'}
          </p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(to right, #1B2A4A, #E8734A)' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{xpData.totalXp} XP</span>
            {nextThreshold && <span>{nextThreshold.minXp} XP</span>}
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-3">Streak</p>
          <div className="flex gap-2 mb-3">
            {last7Days.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={`w-full aspect-square rounded-full mb-1 ${d.done ? 'bg-orange' : 'bg-gray-100 border border-gray-200'}`} />
                <span className="text-[9px] text-gray-400">{d.day}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-charcoal">
            <span className="font-bold text-navy">{userState.streak}</span>
            <span className="text-gray-400"> current · </span>
            <span className="font-bold text-navy">{Math.max(userState.streak, thisWeekCount)}</span>
            <span className="text-gray-400"> best this week</span>
          </p>
        </div>

        {/* Badge Showcase */}
        {earnedBadges.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Badges</p>
              <button onClick={() => setShowBadges(true)} className="text-xs text-orange font-medium">See all →</button>
            </div>
            <div className="flex gap-4">
              {recentBadges.map(b => (
                <div key={b.id} className="flex flex-col items-center">
                  <span className="text-3xl">{b.iconEmoji}</span>
                  <span className="font-serif text-[11px] text-charcoal mt-1 text-center leading-tight">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body Feel Chart */}
        {last7Checkins.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">Body Feel — Last {last7Checkins.length} Sessions</p>
            <div className="flex items-end gap-2 h-16">
              {last7Checkins.slice(0, 7).reverse().map((c, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full rounded-t-sm ${FEELING_COLORS[c.feeling] || 'bg-gray-200'}`}
                    style={{ height: FEELING_HEIGHT[c.feeling] || '33%' }}
                  />
                  <span className="text-[9px] text-gray-400 mt-1">
                    {new Date(c.checkedInAt as unknown as string).toLocaleDateString('en-IN', { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workout History */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">Recent Sessions</p>
          {checkInHistory.length === 0 ? (
            <div className="text-center py-4">
              <span className="text-3xl">🏃</span>
              <p className="text-sm text-gray-400 mt-2">Complete your first workout to see history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkInHistory.slice(0, 10).map(c => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-base flex-shrink-0">
                    {c.feeling === 'easy' ? '😌' : c.feeling === 'good' ? '💪' : '🔥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{c.workoutTitle || `Workout #${c.workoutId}`}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.checkedInAt as unknown as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
