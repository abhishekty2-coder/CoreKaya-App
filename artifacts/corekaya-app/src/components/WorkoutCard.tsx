import React, { useState } from 'react';
import { Workout } from '@workspace/api-client-react';
import { ICONS } from '../constants';
import { useUser } from '../context/UserContext';

const HEAVY_EQUIPMENT_CATEGORIES = [
  'Reformer Lab', 'Cadillac Lab', 'Wunda Chair', 'Reformer Trapeze', 'Ladder Barrel',
];

interface WorkoutCardProps {
  workout: Workout;
  onClick: (id: number) => void;
  featured?: boolean;
  locked?: boolean;
  lockReason?: string;
  showPeopleCount?: boolean;
  completed?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout, onClick, featured = false, locked = false, lockReason, showPeopleCount = false, completed
}) => {
  const { userState } = useUser();
  const [touched, setTouched] = useState(false);
  const [showLockSheet, setShowLockSheet] = useState(false);
  const isHeavyEquipment = HEAVY_EQUIPMENT_CATEGORIES.includes(workout.category);
  const isCompleted = completed !== undefined ? completed : userState.completedWorkouts.includes(workout.id);
  const peopleCount = (workout.id * 7 + 13) % 40 + 5;

  const handleClick = () => {
    if (locked) {
      setShowLockSheet(true);
      return;
    }
    if (!touched && !featured) {
      setTouched(true);
      return;
    }
    onClick(workout.id);
  };

  return (
    <>
      <div
        onClick={handleClick}
        onMouseLeave={() => setTouched(false)}
        className={`group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]
          ${featured ? 'w-full aspect-[16/9]' : 'min-w-[280px] w-[280px] aspect-[4/3]'} bg-white`}
        data-testid={`workout-card-${workout.id}`}
      >
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        <img
          src={workout.thumbnailUrl}
          alt={workout.title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-200
            ${locked ? 'opacity-50' : ''}
            ${(touched || featured) ? 'group-hover:scale-[1.04]' : ''}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="text-4xl">🔒</span>
          </div>
        )}

        {isCompleted && !locked && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-navy flex items-center justify-center z-10">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${isHeavyEquipment ? 'bg-orange' : 'bg-navy'}`}>
              {workout.category}
            </span>
            <span className="text-xs opacity-90 font-medium tracking-wide">{workout.durationMin} MIN</span>
          </div>
          <h3 className={`font-serif leading-tight mb-1 ${featured ? 'text-2xl' : 'text-lg'} transition-transform duration-200 group-hover:translate-y-[-2px]`}>
            {workout.title}
          </h3>
          <p className="text-xs opacity-90 font-medium mb-1">{workout.instructor}</p>
          {showPeopleCount && (
            <p className="text-[10px] opacity-60">{peopleCount} people completed this week</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] border border-white/40 px-2 py-0.5 rounded text-white/90 bg-black/10 backdrop-blur-md">
              {workout.difficulty}
            </span>
            {workout.equipment.map((item, index) => (
              <span key={index} className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white/90">
                {item}
              </span>
            ))}
          </div>
        </div>

        {!locked && (touched || featured) && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
            <div className="w-12 h-12 rounded-full bg-white/90 text-navy flex items-center justify-center pl-1 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              {ICONS.PLAY}
            </div>
          </div>
        )}
      </div>

      {showLockSheet && (
        <div className="fixed inset-0 z-[200] flex items-end" onClick={() => setShowLockSheet(false)}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-6 pb-10 shadow-xl animate-[slideUp_0.3s_ease-out]">
            <div className="text-center">
              <span className="text-4xl">🔒</span>
              <h3 className="font-serif text-xl text-charcoal mt-4 mb-2">Unlock this session</h3>
              <p className="text-sm text-gray-400 mb-6">{lockReason || 'Keep training to unlock this workout.'}</p>
              <button
                onClick={() => setShowLockSheet(false)}
                className="bg-navy text-white px-8 py-3 rounded-full font-medium active:scale-95 transition-transform"
              >
                Keep going →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
