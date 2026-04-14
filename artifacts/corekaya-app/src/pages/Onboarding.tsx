import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const GOALS = [
  { emoji: '🏋️', label: 'Build Strength', value: 'strength' },
  { emoji: '🌿', label: 'Improve Flexibility', value: 'flexibility' },
  { emoji: '🔥', label: 'Lose Weight', value: 'weight_loss' },
  { emoji: '🧘', label: 'Recovery & Mobility', value: 'recovery' },
];

const LEVELS = [
  { label: 'Beginner', sub: 'just starting', value: 'beginner' },
  { label: 'Intermediate', sub: 'some experience', value: 'intermediate' },
  { label: 'Advanced', sub: 'very comfortable', value: 'advanced' },
];

const EQUIPMENT_OPTIONS = ['Mat', 'Reformer', 'Magic Circle', 'Pilates Ball', 'Resistance Bands', 'Jumpboard', 'Tower'];

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { saveOnboarding } = useUser();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [days, setDays] = useState(0);
  const [saving, setSaving] = useState(false);
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');
  const [visible, setVisible] = useState(true);

  const totalSteps = 6;
  const progress = (step / (totalSteps - 1)) * 100;

  const goForward = () => {
    setAnimDir('forward');
    setVisible(false);
    setTimeout(() => { setStep(s => s + 1); setVisible(true); }, 200);
  };
  const goBack = () => {
    setAnimDir('back');
    setVisible(false);
    setTimeout(() => { setStep(s => s - 1); setVisible(true); }, 200);
  };

  const toggleEquipment = (item: string) => {
    setEquipment(prev => prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]);
  };

  const handleFinish = async () => {
    setSaving(true);
    await saveOnboarding({ goal, experienceLevel: level, equipmentOwned: equipment, daysPerWeek: days });
    setSaving(false);
    onComplete();
  };

  const slideStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : `translateX(${animDir === 'forward' ? '20px' : '-20px'})`,
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  };

  return (
    <div className="fixed inset-0 z-[300] max-w-md mx-auto overflow-hidden">
      {/* Progress bar */}
      {step > 0 && step < 5 && (
        <div className="absolute top-0 left-0 right-0 h-1 z-10">
          <div className="h-full bg-orange transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Back button */}
      {step > 0 && step < 5 && (
        <button
          onClick={goBack}
          className="absolute top-12 left-6 z-10 text-charcoal/60 flex items-center gap-1 text-sm active:scale-95 transition-transform"
        >
          ← Back
        </button>
      )}

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="h-full bg-navy flex flex-col items-center justify-center px-10 text-center" style={slideStyle}>
          <h1 className="font-serif text-4xl text-white mb-2">CoreKaya</h1>
          <p className="text-[11px] font-bold text-orange tracking-widest uppercase mb-8">Pilates Labs</p>
          <p className="text-white/70 text-base font-light leading-relaxed mb-12">
            Your personal Pilates studio, designed for you.
          </p>
          <button
            onClick={goForward}
            className="bg-orange text-white px-10 py-3.5 rounded-full font-medium text-base active:scale-95 transition-transform shadow-lg"
          >
            Let's begin →
          </button>
        </div>
      )}

      {/* Step 1: Goal */}
      {step === 1 && (
        <div className="h-full bg-white flex flex-col px-6 pt-24 pb-8" style={slideStyle}>
          <h2 className="font-serif text-2xl text-charcoal mb-8">What brings you here?</h2>
          <div className="flex flex-col gap-3 flex-1">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`w-full py-4 px-6 rounded-full text-left flex items-center gap-4 text-base font-medium transition-all active:scale-[0.98] border-2
                  ${goal === g.value ? 'bg-navy text-white border-navy' : 'bg-white border-gray-200 text-charcoal hover:border-navy/30'}`}
              >
                <span className="text-2xl">{g.emoji}</span>
                {g.label}
              </button>
            ))}
          </div>
          <button
            onClick={goForward}
            disabled={!goal}
            className="mt-6 bg-orange text-white w-full py-4 rounded-full font-medium disabled:opacity-40 active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <div className="h-full bg-white flex flex-col px-6 pt-24 pb-8" style={slideStyle}>
          <h2 className="font-serif text-2xl text-charcoal mb-8">How experienced are you with Pilates?</h2>
          <div className="flex flex-col gap-3 flex-1">
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`w-full py-4 px-6 rounded-full text-left flex flex-col transition-all active:scale-[0.98] border-2
                  ${level === l.value ? 'bg-navy text-white border-navy' : 'bg-white border-gray-200 hover:border-navy/30'}`}
              >
                <span className={`font-medium text-base ${level === l.value ? 'text-white' : 'text-charcoal'}`}>{l.label}</span>
                <span className={`text-sm ${level === l.value ? 'text-white/70' : 'text-gray-400'}`}>{l.sub}</span>
              </button>
            ))}
          </div>
          <button
            onClick={goForward}
            disabled={!level}
            className="mt-6 bg-orange text-white w-full py-4 rounded-full font-medium disabled:opacity-40 active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3: Equipment */}
      {step === 3 && (
        <div className="h-full bg-white flex flex-col px-6 pt-24 pb-8" style={slideStyle}>
          <h2 className="font-serif text-2xl text-charcoal mb-2">What equipment do you have?</h2>
          <p className="text-sm text-gray-400 mb-8">Select all that apply</p>
          <div className="flex flex-wrap gap-3 flex-1 content-start">
            {EQUIPMENT_OPTIONS.map(item => (
              <button
                key={item}
                onClick={() => toggleEquipment(item)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 border-2
                  ${equipment.includes(item) ? 'bg-navy text-white border-navy' : 'bg-white border-gray-200 text-charcoal hover:border-navy/30'}`}
              >
                {equipment.includes(item) && '✓ '}{item}
              </button>
            ))}
          </div>
          <button
            onClick={goForward}
            className="mt-6 bg-orange text-white w-full py-4 rounded-full font-medium active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 4: Days per week */}
      {step === 4 && (
        <div className="h-full bg-white flex flex-col px-6 pt-24 pb-8" style={slideStyle}>
          <h2 className="font-serif text-2xl text-charcoal mb-2">How many days can you commit?</h2>
          <div className="flex gap-2 mt-10 justify-center flex-1 items-start pt-4">
            {[1,2,3,4,5,6,7].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-medium transition-all active:scale-95 border-2
                  ${days === d ? 'bg-navy text-white border-navy' : 'bg-white border-gray-200 text-charcoal'}`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 text-center mt-4">We'll build your weekly plan around this.</p>
          <button
            onClick={goForward}
            disabled={!days}
            className="mt-8 bg-orange text-white w-full py-4 rounded-full font-medium disabled:opacity-40 active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 5: Ready */}
      {step === 5 && (
        <div className="h-full bg-navy flex flex-col items-center justify-center px-10 text-center" style={slideStyle}>
          <div className="text-6xl mb-6 animate-[bounce_1s_ease-in-out_3]">🔥</div>
          <h2 className="font-serif text-3xl text-white mb-4">Your CoreKaya journey starts now.</h2>
          <p className="text-white/60 text-base font-light leading-relaxed mb-12">
            Your first week is ready. Let's move.
          </p>
          <button
            onClick={handleFinish}
            disabled={saving}
            className="bg-orange text-white px-10 py-3.5 rounded-full font-medium text-base active:scale-95 transition-transform shadow-lg disabled:opacity-60"
          >
            {saving ? 'Setting up...' : 'Enter the Labs →'}
          </button>
        </div>
      )}
    </div>
  );
};
