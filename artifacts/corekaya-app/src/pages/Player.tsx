import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Play, Pause, Maximize, X } from "lucide-react";
import { 
  useGetWorkout, 
  useCompleteWorkoutProgress, 
  getGetUserProgressQueryKey,
  Workout 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { AddToFavoritesRow } from "@/components/AddToFavoritesRow";

interface PlayerProps {
  workoutId: number;
  onClose: () => void;
  onComplete: () => void;
}

export function Player({ workoutId, onClose, onComplete }: PlayerProps) {
  const queryClient = useQueryClient();
  const { data: workout, isLoading } = useGetWorkout(workoutId);
  const completeWorkout = useCompleteWorkoutProgress();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fake progress simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return p + 0.1; // 1000 steps
        });
      }, 100); // 100ms per step
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleComplete = () => {
    completeWorkout.mutate({ data: { workoutId } }, {
      onSuccess: () => {
        // Refetch progress
        queryClient.invalidateQueries({ queryKey: getGetUserProgressQueryKey() });
        onComplete();
      }
    });
  };

  if (isLoading || !workout) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col text-white animate-in slide-in-from-bottom duration-300">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-serif font-bold text-lg">{workout.title}</span>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md">
          <Maximize size={18} />
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
        <img 
          src={workout.thumbnailUrl} 
          alt={workout.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-40' : 'opacity-70'}`}
        />
        
        {/* Play/Pause Center Button */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:scale-105 transition-all"
        >
          {isPlaying ? (
            <Pause size={32} className="fill-white" />
          ) : (
            <Play size={32} className="fill-white ml-1" />
          )}
        </button>

        {/* Video Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-orange transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bg-navy-dark rounded-t-3xl -mt-6 relative z-10 p-6 shadow-2xl flex flex-col max-h-[50vh]">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
        
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-1">{workout.title}</h2>
              <p className="text-white/60 text-sm">with {workout.instructor} • {workout.durationMin} MIN</p>
            </div>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-orange border border-white/10">
              {workout.difficulty}
            </span>
          </div>

          <div className="prose prose-sm prose-invert mb-6 text-white/80">
            <p>{workout.description}</p>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Equipment Required</h4>
            <div className="flex flex-wrap gap-2">
              {workout.equipment.map((eq, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/90">
                  {eq}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <AddToFavoritesRow workoutId={workout.id} />
            
            <Button 
              variant="secondary" 
              size="lg" 
              fullWidth 
              className="mt-6 font-bold text-lg"
              onClick={handleComplete}
              isLoading={completeWorkout.isPending}
            >
              Complete Workout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}