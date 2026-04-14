import React, { useState } from 'react';
import { useListWorkouts } from '@workspace/api-client-react';
import { WorkoutCard } from '../components/WorkoutCard';
import { EmptyState } from '../components/EmptyState';
import { useUser } from '../context/UserContext';

const LAB_CATEGORIES = [
  'All', 'Mat Lab', 'Reformer Lab', 'Reformer Trapeze', 'Cadillac Lab', 'Wunda Chair', 'Ladder Barrel', 'Spine Corrector',
];

interface LabsTabProps {
  onPlayWorkout: (id: number) => void;
}

export function LabsTab({ onPlayWorkout }: LabsTabProps) {
  const [filterType, setFilterType] = useState<string>('All');
  const { userState, onboarding } = useUser();

  const { data: workouts = [], isLoading } = useListWorkouts(
    filterType === 'All' ? undefined : { category: filterType }
  );

  const totalCompleted = userState.completedWorkouts.length;
  const ownedEquipment = onboarding?.equipmentOwned ?? [];

  const isWorkoutLocked = (workout: { difficulty: string; category: string }) => {
    if (workout.difficulty === 'Advanced' && totalCompleted < 10) {
      return { locked: true, reason: 'Complete 10 workouts to unlock Advanced sessions.' };
    }
    if (workout.category === 'Reformer Lab') {
      const hasReformer = ownedEquipment.includes('Reformer');
      const hasCompletedReformer = userState.completedWorkouts.length > 0;
      if (!hasReformer && !hasCompletedReformer) {
        return { locked: true, reason: 'Add a Reformer to your equipment in your profile, or complete your first Reformer workout to unlock.' };
      }
    }
    return { locked: false, reason: '' };
  };

  return (
    <div className="min-h-screen bg-sand pb-24 animate-[fadeSlideIn_0.2s_ease-out]">
      <header className="px-6 pt-12 pb-4 bg-white sticky top-0 z-40 shadow-sm">
        <h1 className="font-serif text-3xl text-charcoal mb-1">The Labs</h1>
        <p className="text-gray-500 text-sm">Design your practice. Choose your equipment.</p>

        <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {LAB_CATEGORIES.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95
                ${filterType === type
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-500'}`}
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
          workouts.map(workout => {
            const { locked, reason } = isWorkoutLocked(workout);
            return (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onClick={onPlayWorkout}
                featured
                locked={locked}
                lockReason={reason}
                showPeopleCount
              />
            );
          })
        ) : (
          <EmptyState
            emoji="🧘"
            heading={`Coming Soon to ${filterType}`}
            body="We're currently filming new content for this apparatus. Check back for the next Weekly Drop."
          />
        )}
      </div>
    </div>
  );
}
