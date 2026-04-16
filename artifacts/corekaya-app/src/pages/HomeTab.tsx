import React, { useState, useEffect } from 'react';
import { useGetCurrentSchedule, useListWorkouts, useListProducts, Workout, Product } from '@workspace/api-client-react';
import { WorkoutCard } from '../components/WorkoutCard';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Button } from '../components/Button';
import { BadgesPage } from './BadgesPage';
import { PostWorkoutRitual } from './PostWorkoutRitual';
import { EmptyState } from '../components/EmptyState';
import { useUser } from '../context/UserContext';
import { ICONS } from '../constants';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const CoreKayaLogo = () => (
  <div>
    <h1 className="font-serif text-2xl text-navy leading-none">CoreKaya</h1>
    <p className="text-[10px] font-bold text-orange tracking-widest uppercase">Pilates Labs</p>
  </div>
);

const FlameSVG: React.FC<{ streak: number }> = ({ streak }) => (
  <svg viewBox="0 0 24 28" width="18" height="21" className="inline-block" style={{ animation: 'flame-flicker 2s ease-in-out infinite' }}>
    {streak >= 7 && (
      <ellipse cx="12" cy="22" rx="10" ry="5" fill="#E8734A" opacity="0.2" style={{ animation: 'flame-glow 2s ease-in-out infinite' }} />
    )}
    <path d="M12 2 C12 2, 18 8, 18 14 C18 18.4, 15.3 22, 12 22 C8.7 22, 6 18.4, 6 14 C6 10, 10 6, 10 6 C10 6, 10 10, 12 12 C14 10, 12 2, 12 2Z"
      fill={streak === 0 ? '#9CA3AF' : '#E8734A'} />
    <path d="M12 10 C12 10, 15 13, 15 16 C15 18.2, 13.7 20, 12 20 C10.3 20, 9 18.2, 9 16 C9 13.5, 12 10, 12 10Z"
      fill={streak === 0 ? '#D1D5DB' : '#F59E0B'} />
    <style>{`
      @keyframes flame-flicker {
        0%, 100% { transform: scale(1) rotate(-1deg); opacity: 1; }
        50% { transform: scale(1.05) rotate(1deg); opacity: 0.92; }
      }
      @keyframes flame-glow {
        0%, 100% { opacity: 0.15; rx: 10; }
        50% { opacity: 0.3; rx: 12; }
      }
    `}</style>
  </svg>
);

const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, name: "Beginner", nextXp: 200 },
  { level: 2, minXp: 200, name: "Practitioner", nextXp: 500 },
  { level: 3, minXp: 500, name: "Devotee", nextXp: 1000 },
  { level: 4, minXp: 1000, name: "Expert", nextXp: 2000 },
  { level: 5, minXp: 2000, name: "CoreKaya Master", nextXp: 2000 },
];

interface HomeTabProps {
  onPlayWorkout: (id: number) => void;
  onBrowseLabs: () => void;
}

export function HomeTab({ onPlayWorkout, onBrowseLabs }: HomeTabProps) {
  const { userState, xpData, badges, checkInHistory } = useUser();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [showRitual, setShowRitual] = useState(false);
  const [ritualData, setRitualData] = useState<any>(null);
  const [ritualWorkout, setRitualWorkout] = useState<Workout | null>(null);
  const [streakAtRisk, setStreakAtRisk] = useState(false);
  const [shieldTooltip, setShieldTooltip] = useState(false);
  const [notifDismissed, setNotifDismissed] = useState(false);
  const { completeWorkoutWithRitual } = useUser();

  const { data: schedule } = useGetCurrentSchedule();
  const { data: allWorkouts = [], isLoading: workoutsLoading } = useListWorkouts();
  const { data: allProducts = [] } = useListProducts();

  const workedOutDays = new Set(
    checkInHistory.map(c =>
      new Date(c.checkedInAt as unknown as string).toISOString().split('T')[0]
    )
  );

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const dayWorkoutKeys = ['monWorkout', 'tueWorkout', 'wedWorkout', 'thuWorkout', 'friWorkout', 'satWorkout', 'sunWorkout'] as const;
  const todaysWorkout = schedule ? (schedule[dayWorkoutKeys[todayIndex]] as Workout | null | undefined) : null;
  const tomorrowWorkout = schedule ? (schedule[dayWorkoutKeys[(todayIndex + 1) % 7]] as Workout | null | undefined) : null;

  const hasWorkedOutToday = userState.completedWorkouts.length > 0 &&
    checkInHistory.length > 0 &&
    new Date(checkInHistory[0]?.checkedInAt as unknown as string).toDateString() === new Date().toDateString();

  const hour = new Date().getHours();
  const showNotif = !notifDismissed && !hasWorkedOutToday && hour >= 18 && userState.streak > 0;
  const showShield = userState.streak >= 5;
  const shieldRisk = !hasWorkedOutToday && hour >= 20;

  const favoriteWorkoutsList = [...userState.favorites].reverse()
    .map(id => allWorkouts.find(w => w.id === id)).filter(Boolean) as Workout[];
  const wishlistProductsList = userState.wishlist
    .map(id => allProducts.find(p => p.id === id)).filter(Boolean) as Product[];

  const thisWeekCount = checkInHistory.filter(c => {
    const d = new Date(c.checkedInAt as unknown as string);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  const favApparatus = (() => {
    if (checkInHistory.length === 0) return '—';
    const map: Record<string, number> = {};
    checkInHistory.forEach(c => {
      const key = c.workoutTitle || '';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1])[0]?.[0]?.split(' ')[0] || '—';
  })();

  const level = xpData.level;
  const threshold = LEVEL_THRESHOLDS.find(t => t.level === level) || LEVEL_THRESHOLDS[0];
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level === level + 1);
  const progressPct = nextThreshold
    ? Math.min(100, ((xpData.totalXp - threshold.minXp) / (nextThreshold.minXp - threshold.minXp)) * 100)
    : 100;

  const recentFeelings = checkInHistory.slice(0, 3).map(c => c.feeling);

  const handlePlayWorkout = async (workoutId: number) => {
    const workout = allWorkouts.find(w => w.id === workoutId) ?? null;
    const prevStreak = userState.streak;
    onPlayWorkout(workoutId);
  };

  const handleCompleteWorkout = async (workoutId: number) => {
    const workout = allWorkouts.find(w => w.id === workoutId) ?? null;
    const prevStreak = userState.streak;
    try {
      const result = await completeWorkoutWithRitual(workoutId);
      setRitualData({ ...result, prevStreak });
      setRitualWorkout(workout);
      setShowRitual(true);
    } catch {}
  };

  const getStartDateDisplay = () => schedule?.startDate ?? '';

  return (
    <div className="min-h-screen bg-sand pb-24 animate-[fadeSlideIn_0.2s_ease-out]">
      {showBadges && <BadgesPage onClose={() => setShowBadges(false)} />}

      {showRitual && ritualData && ritualWorkout && (
        <PostWorkoutRitual
          workout={ritualWorkout}
          completionData={ritualData}
          tomorrowWorkout={tomorrowWorkout ?? null}
          onClose={() => setShowRitual(false)}
        />
      )}

      {/* Streak notification bar */}
      {showNotif && (
        <div
          className="bg-amber-400 flex items-center justify-between px-4 py-2 cursor-pointer animate-[slideUp_0.3s_ease-out]"
          onClick={onBrowseLabs}
        >
          <span className="text-sm font-medium text-amber-900">
            🔥 Don't break your {userState.streak}-day streak — your workout is ready.
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setNotifDismissed(true); }}
            className="text-amber-800 text-lg leading-none ml-2"
          >×</button>
        </div>
      )}

      <header className="px-6 pt-10 pb-3 bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <CoreKayaLogo />
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-105 cursor-pointer
              ${shieldRisk ? 'bg-amber-100 border border-amber-300' : 'bg-sand-dark'}`}
            onClick={() => setShieldTooltip(v => !v)}
          >
            <FlameSVG streak={userState.streak} />
            <span className="text-sm font-bold text-navy-dark">{userState.streak} Day Streak</span>
            {showShield && <span className="text-sm">🛡️</span>}
          </div>
        </div>

        {shieldRisk && shieldTooltip && (
          <div
            className="absolute right-4 top-16 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-800 shadow-md z-50 cursor-pointer animate-[scaleIn_0.2s_ease-out]"
            onClick={async () => {
              await fetch('/api/user/streak-shield', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-session-id': 'session-default' } });
              setShieldTooltip(false);
            }}
          >
            Streak at risk — Use shield? 🛡️
          </div>
        )}

        <div className="mt-1">
          <div className="flex items-center gap-1 mb-0.5">
            <div className="flex-1 h-1 bg-sand-dark rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPct}%`, background: 'linear-gradient(to right, #1B2A4A, #E8734A)' }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              Level {xpData.level} · {xpData.levelName} — {xpData.totalXp} / {nextThreshold?.minXp ?? xpData.totalXp} XP
            </span>
            <button
              onClick={() => setShowBadges(true)}
              className="text-[10px] text-orange font-medium"
            >
              View all achievements →
            </button>
          </div>
        </div>
      </header>

      {/* Stats strip */}
      <div className="px-6 mt-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {[
            { label: 'Total Sessions', value: userState.completedWorkouts.length },
            { label: 'This Week', value: thisWeekCount },
            { label: 'Fav Apparatus', value: favApparatus },
            { label: 'XP Total', value: xpData.totalXp },
          ].map((stat, i) => (
            <div key={i} className="min-w-[100px] w-[100px] h-16 bg-white rounded-xl border border-gray-100 flex flex-col justify-center px-3 flex-shrink-0">
              <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide leading-tight">{stat.label}</span>
              <span className="text-lg font-bold text-navy mt-0.5 leading-tight">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-5">
        <div className="px-6 flex justify-between items-baseline mb-4">
          <h2 className="font-serif text-xl text-charcoal">Weekly Drop</h2>
          <span className="text-xs text-gray-500 font-medium">Week of {getStartDateDisplay()}</span>
        </div>

        <div className="flex justify-between px-4 mb-6 overflow-x-auto no-scrollbar py-1">
          {DAYS.map((day, idx) => {
            const isToday = idx === todayIndex;
            const isDone = idx < todayIndex;
            const hasWorkout = schedule ? !!schedule[dayWorkoutKeys[idx]] : false;
            const dayIso = (() => {
              if (!schedule?.startDate) return '';
              const base = new Date(schedule.startDate);
              base.setDate(base.getDate() + idx);
              return base.toISOString().split('T')[0];
            })();
            const didWorkout = workedOutDays.has(dayIso);
            return (
              <div key={day} className="flex flex-col items-center min-w-[42px]">
                <span className="text-[10px] font-bold text-gray-400 mb-2">{day}</span>
                <div className="relative">
                  {isDone && hasWorkout && (
                    <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]" viewBox="0 0 48 48">
                      <circle
                        cx="24" cy="24" r="22"
                        fill="none"
                        stroke={didWorkout ? '#E8734A' : '#E5E7EB'}
                        strokeWidth="2.5"
                        strokeDasharray="138.2 0"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all
                    ${isToday ? 'bg-navy text-white border-navy shadow-lg scale-110' :
                      isDone ? 'bg-navy/10 text-navy border-transparent' :
                      hasWorkout ? 'bg-white border-gray-200 text-gray-400' : 'bg-sand border-gray-100 text-gray-300'}`}>
                    {isDone ? '✓' : !hasWorkout && !isToday ? (
                      <span className="text-[9px] text-gray-300">Rest</span>
                    ) : <span className="text-sm font-medium">{idx + 1}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6">
          <div className="mb-2 text-sm font-medium text-navy-dark uppercase tracking-widest text-xs">Today's Prescription</div>
          {workoutsLoading ? (
            <div className="w-full aspect-[16/9] rounded-xl bg-gray-200 animate-pulse" />
          ) : todaysWorkout ? (
            <WorkoutCard workout={todaysWorkout} onClick={handlePlayWorkout} featured />
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🧘</div>
              <h4 className="font-serif text-lg text-charcoal mb-2">Rest Day</h4>
              <p className="text-sm text-gray-500">Take time to recover and prepare for tomorrow.</p>
            </div>
          )}
        </div>

        <div className="px-6 mt-4">
          <Button variant="outline" fullWidth size="sm" className="gap-2">
            {ICONS.CALENDAR} Add Schedule to Calendar
          </Button>
        </div>
      </section>

      {/* Daily Insight */}
      <section className="px-6 mt-8">
        <DailyInsightCard recentFeelings={recentFeelings} />
      </section>

      {wishlistProductsList.length > 0 && (
        <section className="mt-10 pl-6 animate-[fadeIn_0.5s_ease-out]">
          <h2 className="font-serif text-xl text-charcoal mb-4 flex items-center gap-2">
            Your Wishlist <span className="text-sm text-gray-400 font-sans">({wishlistProductsList.length})</span>
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar pr-6">
            {wishlistProductsList.map(product => (
              <div key={product.id} className="min-w-[180px] w-[180px]">
                <ProductCard product={product} onOpen={setSelectedProduct} />
              </div>
            ))}
          </div>
        </section>
      )}

      {favoriteWorkoutsList.length > 0 ? (
        <section className="mt-8 pl-6 animate-[fadeIn_0.5s_ease-out]">
          <h2 className="font-serif text-xl text-charcoal mb-4 flex items-center gap-2">
            Your Favorite Classes <span className="text-sm text-gray-400 font-sans">({favoriteWorkoutsList.length})</span>
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-8 no-scrollbar pr-6">
            {favoriteWorkoutsList.map(w => (
              <WorkoutCard key={w.id} workout={w} onClick={handlePlayWorkout} />
            ))}
          </div>
        </section>
      ) : (
        <div className="px-6 mt-8">
          <EmptyState
            emoji="❤️"
            heading="Your mat is waiting"
            body="Favorite a class from The Labs to see it here."
            ctaLabel="Browse The Labs →"
            onCta={onBrowseLabs}
          />
        </div>
      )}

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}

const DailyInsightCard: React.FC<{ recentFeelings: string[] }> = ({ recentFeelings }) => {
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/ai/wellness-tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-session-id': 'session-default' },
          body: JSON.stringify({ mood: 'neutral', energy: 'medium', recentFeelings }),
        });
        if (res.ok) {
          const data = await res.json();
          setTip(data.text || '');
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    load();
  }, []);

  const FALLBACK = 'Movement is the medicine. Show up to your mat — the rest will follow.';

  return (
    <div className="bg-navy rounded-xl p-5">
      <p className="text-[10px] text-orange font-bold uppercase tracking-widest mb-3">Daily Insight</p>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-1/2 mt-2" />
        </div>
      ) : (
        <p className="font-serif italic text-white/80 text-sm leading-relaxed">
          {error || !tip ? FALLBACK : tip}
        </p>
      )}
    </div>
  );
};
