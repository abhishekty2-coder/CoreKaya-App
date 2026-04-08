import React, { useState } from 'react';
import { useGetWorkout, useCompleteWorkoutProgress, getGetUserProgressQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { AddToFavoritesRow } from '../components/AddToFavoritesRow';

interface PlayerProps {
  workoutId: number;
  onBack: () => void;
  onComplete: () => void;
}

export const Player: React.FC<PlayerProps> = ({ workoutId, onBack, onComplete }) => {
  const queryClient = useQueryClient();
  const { data: workout, isLoading } = useGetWorkout(workoutId);
  const completeWorkout = useCompleteWorkoutProgress();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!workout) return <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white">Workout not found</div>;

  const handleComplete = () => {
    completeWorkout.mutate({ data: { workoutId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserProgressQueryKey() });
        onComplete();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showFeedback && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium animate-[fadeIn_0.3s_ease-out]">
          Added to Favorites ❤️
        </div>
      )}

      <div className="relative flex-1 bg-black flex items-center justify-center group">
        {isPlaying ? (
          <div className="text-white text-center">
            <p className="animate-pulse mb-4">Video Playing Stream...</p>
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-navy w-1/3 animate-[pulse_3s_ease-in-out_infinite]"></div>
            </div>
          </div>
        ) : (
          <>
            <img src={workout.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt={workout.title} />
            <button
              onClick={() => setIsPlaying(true)}
              className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
          </>
        )}

        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={onBack} className="text-white hover:text-navy transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-right">
            <h2 className="text-white font-serif text-lg">{workout.title}</h2>
            <p className="text-gray-300 text-xs">{workout.instructor}</p>
          </div>
        </div>
      </div>

      <div className="bg-charcoal p-6 pb-10">
        <div className="mb-6 text-white/80 text-sm">
          <div className="flex flex-col">
            <span className="text-white font-medium">Equipment</span>
            <span className="text-xs text-gray-400">{workout.equipment.join(', ')}</span>
          </div>
        </div>

        <div className="mb-2">
          <AddToFavoritesRow workoutId={workoutId} />
        </div>

        <Button fullWidth variant="primary" onClick={handleComplete} isLoading={completeWorkout.isPending}>
          Complete Workout
        </Button>
      </div>
    </div>
  );
};
