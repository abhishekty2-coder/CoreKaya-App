import React, { useState } from 'react';
import { useUser, type CheckInRecord } from '../context/UserContext';
import { BadgesPage } from './BadgesPage';

const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0,    name: 'Beginner',        nextXp: 200  },
  { level: 2, minXp: 200,  name: 'Practitioner',    nextXp: 500  },
  { level: 3, minXp: 500,  name: 'Devotee',         nextXp: 1000 },
  { level: 4, minXp: 1000, name: 'Expert',          nextXp: 2000 },
  { level: 5, minXp: 2000, name: 'CoreKaya Master', nextXp: 2000 },
];

const FEELING_LABEL: Record<string, string> = { easy: 'Easy', good: 'Good', tough: 'Tough' };
const FEELING_COLOR: Record<string, string> = {
  easy:  '#22C55E',
  good:  '#E8734A',
  tough: '#EF4444',
};
const FEELING_EMOJI: Record<string, string> = { easy: '😌', good: '💪', tough: '🔥' };

/* FIX 13 — best streak calculation from check-in history */
function calcBestStreak(history: CheckInRecord[]): number {
  if (history.length === 0) return 0;
  const sorted = [...history].sort(
    (a, b) => new Date(a.checkedInAt as unknown as string).getTime() - new Date(b.checkedInAt as unknown as string).getTime()
  );
  let best = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].checkedInAt as unknown as string);
    const cur  = new Date(sorted[i].checkedInAt as unknown as string);
    prev.setHours(0, 0, 0, 0);
    cur.setHours(0, 0, 0, 0);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      current += 1;
      if (current > best) best = current;
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return best;
}

/* Circular arc progress ring */
const ArcRing: React.FC<{ pct: number; size?: number }> = ({ pct, size = 120 }) => {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={7} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke="#E8734A" strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 1.2s ease' }}
      />
    </svg>
  );
};

export function ProfilePage() {
  const { userState, xpData, badges, checkInHistory } = useUser();
  const [showBadges, setShowBadges] = useState(false);

  /* XP maths */
  const level = xpData.level;
  const threshold     = LEVEL_THRESHOLDS.find(t => t.level === level)     ?? LEVEL_THRESHOLDS[0];
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1);
  const progressPct   = nextThreshold
    ? Math.min(100, ((xpData.totalXp - threshold.minXp) / (nextThreshold.minXp - threshold.minXp)) * 100)
    : 100;
  const xpToNext = nextThreshold ? nextThreshold.minXp - xpData.totalXp : 0;

  /* Badges */
  const earnedBadges = badges.filter(b => b.earned);
  const nextBadge    = badges.find(b => !b.earned);

  /* FIX 13 — best streak */
  const bestStreak = calcBestStreak(checkInHistory);

  /* Streak calendar – last 7 days */
  const DAY3 = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const done = checkInHistory.some(c =>
      new Date(c.checkedInAt as unknown as string).toISOString().split('T')[0] === iso
    );
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return { label: DAY3[dow], done };
  });

  /* Stats */
  const thisWeekCount = checkInHistory.filter(c => {
    const d = new Date(c.checkedInAt as unknown as string);
    return d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).length;

  const formatDate = (v: unknown) =>
    new Date(v as string).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  /* FIX 1 — skeleton when data not yet loaded */
  const isInitialLoading = xpData.totalXp === 0 && checkInHistory.length === 0;

  return (
    <div className="min-h-screen bg-sand pb-28" style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
      {showBadges && <BadgesPage onClose={() => setShowBadges(false)} />}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-6 pt-12 pb-10 text-center"
        style={{ background: 'linear-gradient(160deg, #0F1E38 0%, #1B2A4A 55%, #2D4A7A 100%)' }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl"
             style={{ background: 'radial-gradient(circle, rgba(232,115,74,0.18) 0%, transparent 70%)' }} />

        <div className="relative inline-flex items-center justify-center mb-4">
          <ArcRing pct={progressPct} size={128} />
          <div className="absolute w-16 h-16 rounded-full bg-orange flex items-center justify-center shadow-lg">
            <span className="font-serif text-2xl text-white font-bold select-none">KM</span>
          </div>
        </div>

        <h2 className="font-serif text-2xl text-white font-bold leading-tight">Kaya Member</h2>
        <div className="flex items-center justify-center gap-2 mt-2 mb-5">
          <span className="text-xs bg-orange/90 text-white px-3 py-1 rounded-full font-semibold tracking-wide">
            Level {level} · {xpData.levelName}
          </span>
        </div>

        <div className="mx-auto max-w-[200px]">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(to right, #E8734A, #F59E0B)', transition: 'width 1.2s ease' }}
            />
          </div>
          <p className="text-[11px] text-white/50 mt-1.5">
            {nextThreshold
              ? `${xpData.totalXp} / ${nextThreshold.minXp} XP · ${xpToNext} to ${nextThreshold.name}`
              : `${xpData.totalXp} XP · Max Level`}
          </p>
        </div>

        <div className="flex justify-center gap-6 mt-6">
          {[
            { label: 'Sessions',    value: userState.completedWorkouts.length },
            { label: 'Streak',      value: `${userState.streak}🔥`           },
            { label: 'Best Streak', value: `${bestStreak}🏆`                  },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-white font-bold text-xl leading-none">{s.value}</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">

        {/* FIX 1 — skeleton while XP not yet loaded */}
        {isInitialLoading && (
          <>
            <div className="h-20 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-24 rounded-xl bg-gray-200 animate-pulse" />
          </>
        )}

        {/* ── STREAK CALENDAR ──────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">7-Day Streak</p>
            <span className="text-sm font-bold text-navy">{userState.streak} day{userState.streak !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-1.5">
            {last7Days.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-1">
                <div
                  className={`w-full aspect-square rounded-xl transition-all duration-300 flex items-center justify-center
                    ${d.done ? 'bg-orange shadow-sm' : 'bg-gray-100'}`}
                >
                  {d.done && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 font-medium">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── NEXT BADGE ───────────────────────────────────── */}
        {nextBadge && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Next Achievement</p>
              {earnedBadges.length > 0 && (
                <button onClick={() => setShowBadges(true)} className="text-xs text-orange font-semibold">
                  All badges →
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sand flex items-center justify-center flex-shrink-0 relative">
                <span className="text-3xl grayscale opacity-40">{nextBadge.iconEmoji}</span>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-navy rounded-full flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">🔒</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-base text-charcoal font-bold">{nextBadge.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{nextBadge.description}</p>
                <span className="inline-block mt-1.5 text-[10px] bg-orange/10 text-orange font-semibold px-2 py-0.5 rounded-full">
                  +{nextBadge.xpReward} XP on unlock
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── EARNED BADGES ────────────────────────────────── */}
        {earnedBadges.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Earned · {earnedBadges.length}
              </p>
              <button onClick={() => setShowBadges(true)} className="text-xs text-orange font-semibold">
                See all →
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {earnedBadges.map(b => (
                <div key={b.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center">
                    <span className="text-3xl">{b.iconEmoji}</span>
                  </div>
                  <span className="font-serif text-[10px] text-charcoal text-center leading-tight w-14">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BODY FEEL CHART ──────────────────────────────── */}
        {checkInHistory.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">
              Body Feel — Last {Math.min(checkInHistory.length, 7)} Sessions
            </p>
            <div className="flex items-end gap-2 h-20">
              {checkInHistory.slice(0, 7).reverse().map((c, i) => {
                const heightPct = c.feeling === 'easy' ? 35 : c.feeling === 'good' ? 65 : 100;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 gap-1">
                    <div
                      className="w-full rounded-lg transition-all duration-500"
                      style={{
                        height: `${heightPct}%`,
                        background: FEELING_COLOR[c.feeling] || '#E5E7EB',
                        opacity: 0.85,
                      }}
                    />
                    <span className="text-[9px] text-gray-400 font-medium">
                      {formatDate(c.checkedInAt).split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              {(['easy','good','tough'] as const).map(f => (
                <div key={f} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: FEELING_COLOR[f] }} />
                  <span className="text-[10px] text-gray-400">{FEELING_LABEL[f]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECENT SESSIONS ──────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Recent Sessions</p>

          {checkInHistory.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-serif text-base text-charcoal mb-1">No sessions yet</p>
              <p className="text-sm text-gray-400 max-w-[200px]">
                Complete a workout and your history will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkInHistory.slice(0, 10).map(c => {
                /* FIX 6 — how many times user has done this workout */
                const timesCompleted = checkInHistory.filter(h => h.workoutId === c.workoutId).length;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: `${FEELING_COLOR[c.feeling] || '#E5E7EB'}18` }}
                    >
                      {FEELING_EMOJI[c.feeling] || '🏃'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">
                        {c.workoutTitle || `Workout #${c.workoutId}`}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {FEELING_LABEL[c.feeling] || 'Completed'} · {formatDate(c.checkedInAt)}
                      </p>
                    </div>
                    {/* FIX 6 — completion count */}
                    <span className="text-[11px] text-gray-400 flex-shrink-0 font-medium">
                      ×{timesCompleted}
                    </span>
                    <div
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ color: FEELING_COLOR[c.feeling] || '#6B7280', background: `${FEELING_COLOR[c.feeling] || '#6B7280'}18` }}
                    >
                      {FEELING_LABEL[c.feeling] || '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
