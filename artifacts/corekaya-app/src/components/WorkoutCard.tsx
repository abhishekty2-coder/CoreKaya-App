import React from 'react';
import { Workout } from '@workspace/api-client-react';
import { ICONS } from '../constants';

const HEAVY_EQUIPMENT_CATEGORIES = [
  'Reformer Lab',
  'Cadillac Lab',
  'Wunda Chair',
  'Reformer Trapeze',
  'Ladder Barrel',
];

interface WorkoutCardProps {
  workout: Workout;
  onClick: (id: number) => void;
  featured?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onClick, featured = false }) => {
  const isHeavyEquipment = HEAVY_EQUIPMENT_CATEGORIES.includes(workout.category);

  return (
    <div
      onClick={() => onClick(workout.id)}
      className={`group relative overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all ${featured ? 'w-full aspect-[16/9]' : 'min-w-[280px] w-[280px] aspect-[4/3]'} bg-white`}
      data-testid={`workout-card-${workout.id}`}
    >
      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      <img
        src={workout.thumbnailUrl}
        alt={workout.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${isHeavyEquipment ? 'bg-orange' : 'bg-navy'}`}>
            {workout.category}
          </span>
          <span className="text-xs opacity-90 font-medium tracking-wide">{workout.durationMin} MIN</span>
        </div>

        <h3 className={`font-serif leading-tight mb-1 ${featured ? 'text-2xl' : 'text-lg'}`}>
          {workout.title}
        </h3>
        <p className="text-xs opacity-90 font-medium mb-3">
          {workout.instructor}
        </p>

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

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
        <div className="w-12 h-12 rounded-full bg-white/90 text-navy flex items-center justify-center pl-1 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
          {ICONS.PLAY}
        </div>
      </div>
    </div>
  );
};
