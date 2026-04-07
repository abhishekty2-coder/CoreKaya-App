import { Play } from "lucide-react";
import { Workout } from "@workspace/api-client-react";
import { FavoriteToggleButton } from "./FavoriteToggleButton";

interface WorkoutCardProps {
  workout: Workout;
  featured?: boolean;
  onClick: (id: number) => void;
}

export function WorkoutCard({ workout, featured = false, onClick }: WorkoutCardProps) {
  const isMat = workout.category.toLowerCase().includes("mat");
  
  return (
    <div 
      className={`group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 ${
        featured ? "aspect-[4/5] w-full" : "aspect-square w-64 flex-shrink-0"
      }`}
      onClick={() => onClick(workout.id)}
      data-testid={`workout-card-${workout.id}`}
    >
      {/* Background Image */}
      <img 
        src={workout.thumbnailUrl} 
        alt={workout.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/40 to-transparent" />
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm text-white ${
            isMat ? "bg-navy" : "bg-orange"
          }`}>
            {workout.category}
          </span>
          <span className="px-2 py-1 text-[10px] font-medium rounded-sm bg-white/20 backdrop-blur-md text-white w-fit">
            {workout.durationMin} MIN
          </span>
        </div>
        <FavoriteToggleButton workoutId={workout.id} size={featured ? "md" : "sm"} />
      </div>
      
      {/* Play Button Overlay (Hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
          <Play className="w-6 h-6 ml-1 fill-white" />
        </div>
      </div>
      
      {/* Content Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex flex-col">
        <h3 className={`font-serif text-white font-bold leading-tight mb-1 ${
          featured ? "text-2xl" : "text-lg"
        }`}>
          {workout.title}
        </h3>
        <p className="text-white/80 text-sm font-medium mb-3">
          with {workout.instructor}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 border border-white/20 px-2 py-0.5 rounded-full">
            {workout.difficulty}
          </span>
          {workout.equipment.slice(0, 2).map((eq, i) => (
            <span key={i} className="text-[10px] uppercase tracking-wider font-semibold text-white/70 border border-white/20 px-2 py-0.5 rounded-full">
              {eq}
            </span>
          ))}
          {workout.equipment.length > 2 && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/70 border border-white/20 px-2 py-0.5 rounded-full">
              +{workout.equipment.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}