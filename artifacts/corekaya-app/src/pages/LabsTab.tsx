import { useState } from "react";
import { useListWorkouts } from "@workspace/api-client-react";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Search } from "lucide-react";

const CATEGORIES = ["All", "Mat Lab", "Reformer Lab", "Tower Lab", "Chair Lab", "Cadillac Lab", "Quick Burns"];

interface LabsTabProps {
  onPlayWorkout: (id: number) => void;
}

export function LabsTab({ onPlayWorkout }: LabsTabProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  
  // Use the API to list workouts, optionally filtering by category
  const { data: workouts = [], isLoading } = useListWorkouts(
    activeFilter === "All" ? undefined : { category: activeFilter }
  );

  return (
    <div className="pb-32 min-h-screen bg-sand">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 bg-white sticky top-0 z-40 border-b border-gray-100">
        <h1 className="font-serif text-3xl font-bold text-navy mb-4">The Labs</h1>
        
        {/* Search Bar - Visual only for this version */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-navy focus:border-navy sm:text-sm transition-colors"
            placeholder="Search workouts, instructors, or equipment..."
          />
        </div>

        {/* Filter Scroll */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === category
                  ? "bg-navy text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-full aspect-[4/5] rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : workouts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {workouts.map(workout => (
              <WorkoutCard 
                key={workout.id}
                workout={workout}
                featured={true}
                onClick={onPlayWorkout}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
              <Search size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-navy mb-2">No Labs Found</h3>
            <p className="text-gray-500">We couldn't find any workouts matching your criteria.</p>
            <button 
              onClick={() => setActiveFilter("All")}
              className="mt-6 text-orange font-medium hover:underline"
            >
              View all labs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}