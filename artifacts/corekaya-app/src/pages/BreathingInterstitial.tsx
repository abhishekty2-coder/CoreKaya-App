import React, { useEffect } from 'react';

interface BreathingInterstitialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const BreathingInterstitial: React.FC<BreathingInterstitialProps> = ({ onComplete, onSkip }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-navy flex items-center justify-center">
      <button
        onClick={onSkip}
        className="absolute top-12 right-6 text-white/60 text-sm font-medium hover:text-white transition-colors active:scale-95"
      >
        Skip →
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center mb-8">
          <svg viewBox="0 0 160 160" className="w-40 h-40">
            <circle
              cx="80" cy="80" r="60"
              fill="none"
              stroke="#E8734A"
              strokeWidth="2"
              opacity="0.15"
              className="animate-[breathe-outer_4s_ease-in-out_infinite]"
            />
            <circle
              cx="80" cy="80" r="45"
              fill="none"
              stroke="#E8734A"
              strokeWidth="2"
              opacity="0.3"
              className="animate-[breathe-mid_4s_ease-in-out_infinite_0.3s]"
            />
            <circle
              cx="80" cy="80" r="30"
              fill="#E8734A"
              opacity="0.8"
              className="animate-[breathe-inner_4s_ease-in-out_infinite_0.6s]"
            />
          </svg>
        </div>

        <p className="font-serif text-2xl text-white animate-[breathe-text_4s_ease-in-out_infinite]">
          Breathe in...
        </p>
        <p className="text-white/50 text-sm mt-2 font-light">Your session begins in a moment</p>
      </div>

      <style>{`
        @keyframes breathe-outer {
          0%, 100% { r: 60; opacity: 0.1; }
          50% { r: 72; opacity: 0.2; }
        }
        @keyframes breathe-mid {
          0%, 100% { r: 45; opacity: 0.25; }
          50% { r: 55; opacity: 0.35; }
        }
        @keyframes breathe-inner {
          0%, 100% { r: 30; opacity: 0.7; }
          50% { r: 38; opacity: 0.9; }
        }
        @keyframes breathe-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
