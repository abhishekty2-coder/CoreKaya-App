import React, { useState, useEffect } from 'react';
import { Workout } from '@workspace/api-client-react';
import { useUser } from '../context/UserContext';

interface PostWorkoutRitualProps {
  workout: Workout;
  completionData: {
    streak: number;
    prevStreak: number;
    xpEarned: number;
    totalXp: number;
    newLevel: string | null;
    newBadges: Array<{ id: number; name: string; iconEmoji: string; description: string }>;
  };
  tomorrowWorkout: Workout | null;
  onClose: () => void;
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 20;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setValue(Math.round((current / steps) * target));
      if (current >= steps) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

const FEELINGS = [
  { emoji: '😌', label: 'Easy', value: 'easy' as const },
  { emoji: '💪', label: 'Good', value: 'good' as const },
  { emoji: '🔥', label: 'Tough', value: 'tough' as const },
];

export const PostWorkoutRitual: React.FC<PostWorkoutRitualProps> = ({
  workout, completionData, tomorrowWorkout, onClose
}) => {
  const { submitCheckin } = useUser();
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [debriefText, setDebriefText] = useState('');
  const animatedStreak = useCountUp(completionData.streak, 800);

  useEffect(() => {
    if (stage === 1) {
      const t = setTimeout(() => setStage(2), 1500);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 4) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [stage, onClose]);

  const handleFeelingTap = async (feeling: 'easy' | 'good' | 'tough') => {
    setStage(4);
    try {
      await submitCheckin(workout.id, feeling);
      const res = await fetch('/api/ai/session-debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': 'session-default' },
        body: JSON.stringify({ workoutId: workout.id, feeling }),
      });
      if (res.ok) {
        const data = await res.json();
        setDebriefText(data.text || '');
      }
    } catch {
    }
  };

  return (
    <div className="fixed inset-0 z-[100]" onClick={stage === 4 ? onClose : undefined}>
      {/* Stage 1: Completion burst */}
      {stage === 1 && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="relative flex flex-col items-center text-center px-8">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[1,2,3].map(i => (
                <div key={i} className="absolute rounded-full border border-orange/60"
                  style={{ width: `${i * 80}px`, height: `${i * 80}px`, animation: `burst-ring 1.5s ease-out ${i * 0.2}s infinite`, opacity: 0 }} />
              ))}
            </div>
            <h2 className="font-serif text-4xl text-white animate-[fadeIn_0.6s_ease-out] relative z-10 leading-tight">
              {workout.title}
            </h2>
            <p className="text-white/60 mt-2 animate-[fadeIn_0.9s_ease-out] relative z-10">Complete</p>
          </div>
          <style>{`
            @keyframes burst-ring {
              0% { transform: scale(0.5); opacity: 0.8; }
              100% { transform: scale(2.5); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* Stage 2: Stats reveal */}
      {stage === 2 && (
        <div className="absolute inset-0 bg-black flex items-center justify-center px-8" onClick={() => setStage(3)}>
          <div className="w-full max-w-sm text-center">
            {completionData.newLevel && (
              <div className="w-full bg-orange py-2 mb-6 rounded-lg animate-[scaleIn_0.4s_ease-out]">
                <span className="text-white font-bold text-sm tracking-widest uppercase">LEVEL UP — {completionData.newLevel}</span>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-4 animate-[scaleIn_0.4s_ease-out_0.1s_both]">
              <p className="text-orange text-xs font-bold uppercase tracking-widest mb-2">Current Streak</p>
              <span className="font-serif text-5xl text-white">{animatedStreak}</span>
              <span className="text-gray-400 text-sm ml-2">days</span>
            </div>

            <div className="flex items-center justify-center gap-3 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
              <span className="text-orange font-bold text-lg animate-[bounce_0.6s_ease-out_0.5s_both]">
                +{completionData.xpEarned} XP
              </span>
            </div>

            {completionData.newBadges.length > 0 && (
              <div className="mt-4 animate-[scaleIn_0.5s_ease-out_0.7s_both]">
                {completionData.newBadges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <span className="text-4xl animate-[bounce_0.5s_ease-out]">{badge.iconEmoji}</span>
                    <span className="font-serif text-white text-sm mt-1">{badge.name}</span>
                    <span className="text-white/50 text-xs">{badge.description}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-white/40 text-xs mt-6">Tap to continue</p>
          </div>
        </div>
      )}

      {/* Stage 3: Body check-in */}
      {stage === 3 && (
        <div className="absolute inset-0 bg-[#1B2A4A] flex items-center justify-center px-8">
          <div className="w-full max-w-sm text-center">
            <h3 className="font-serif text-2xl text-white mb-2">How did that feel?</h3>
            <p className="text-white/50 text-sm mb-10">Your feedback shapes your next session.</p>
            <div className="flex gap-4 justify-center">
              {FEELINGS.map(f => (
                <button
                  key={f.value}
                  onClick={() => handleFeelingTap(f.value)}
                  className="flex flex-col items-center bg-white/10 backdrop-blur rounded-2xl px-5 py-5 gap-2 active:scale-105 transition-transform"
                >
                  <span className="text-3xl">{f.emoji}</span>
                  <span className="text-white text-sm font-medium">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stage 4: What's next */}
      {stage === 4 && (
        <div className="absolute inset-0 bg-[#1B2A4A] flex items-center justify-center px-8">
          <div className="w-full max-w-sm text-center">
            <p className="text-white/60 text-sm mb-4">See you then 👋</p>
            {tomorrowWorkout && (
              <div className="bg-white/10 rounded-xl p-4 mb-6 text-left">
                <p className="text-orange text-xs font-bold uppercase tracking-widest mb-2">Tomorrow:</p>
                <p className="font-serif text-white text-lg leading-tight">{tomorrowWorkout.title}</p>
                <p className="text-white/50 text-sm mt-1">{tomorrowWorkout.durationMin} min · {tomorrowWorkout.instructor}</p>
              </div>
            )}
            {debriefText && (
              <p className="font-serif italic text-white/70 text-sm leading-relaxed">
                "{debriefText}"
                <span className="block text-orange text-xs not-italic mt-2">— AI Coach</span>
              </p>
            )}
            <p className="text-white/30 text-xs mt-6">Tap anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};
