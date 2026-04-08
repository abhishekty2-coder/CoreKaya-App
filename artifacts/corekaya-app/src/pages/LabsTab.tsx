import React, { useState } from 'react';
import { useListWorkouts } from '@workspace/api-client-react';
import { WorkoutCard } from '../components/WorkoutCard';

const LAB_CATEGORIES = [
  'All',
  'Mat Lab',
  'Reformer Lab',
  'Reformer Trapeze',
  'Cadillac Lab',
  'Wunda Chair',
  'Ladder Barrel',
  'Spine Corrector',
];

interface LabsTabProps {
  onPlayWorkout: (id: number) => void;
}

export function LabsTab({ onPlayWorkout }: LabsTabProps) {
  const [filterType, setFilterType] = useState<string>('All');

  const { data: workouts = [], isLoading } = useListWorkouts(
    filterType === 'All' ? undefined : { category: filterType }
  );

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="px-6 pt-12 pb-6 bg-white sticky top-0 z-40 shadow-sm">
        <h1 className="font-serif text-3xl text-charcoal mb-2">The Labs</h1>
        <p className="text-gray-500 text-sm">Design your practice. Choose your equipment.</p>

        <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
          {LAB_CATEGORIES.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                ${filterType === type
                  ? 'bg-navy text-white shadow-md transform scale-105'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-navy/50'}`}
            >
              {type}
            </button>
          ))}
          <div className="w-4 flex-shrink-0" />
        </div>
      </header>

      <div className="px-6 py-6 grid gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map(n => (
              <div key={n} className="w-full aspect-[16/9] rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </>
        ) : workouts.length > 0 ? (
          workouts.map(workout => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onClick={onPlayWorkout}
              featured
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">
              🧘
            </div>
            <h3 className="font-serif text-lg text-charcoal mb-1">Coming Soon to {filterType}</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              We are currently filming new content for this apparatus. Check back for the next Weekly Drop.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
