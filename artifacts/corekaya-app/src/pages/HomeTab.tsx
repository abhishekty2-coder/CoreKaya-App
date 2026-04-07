import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Zap } from "lucide-react";
import { 
  useGetCurrentSchedule, 
  useGetUserProgress, 
  useListWorkouts, 
  useListProducts,
  useGetUserFavorites,
  useGetUserWishlist,
  Workout
} from "@workspace/api-client-react";
import { WorkoutCard } from "@/components/WorkoutCard";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";

interface HomeTabProps {
  onPlayWorkout: (id: number) => void;
  showCelebration: boolean;
  setShowCelebration: (show: boolean) => void;
}

export function HomeTab({ onPlayWorkout, showCelebration, setShowCelebration }: HomeTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const { data: schedule } = useGetCurrentSchedule();
  const { data: progress } = useGetUserProgress();
  const { data: favoritesData } = useGetUserFavorites();
  const { data: wishlistData } = useGetUserWishlist();
  
  // Need to fetch actual workouts/products for favorites/wishlist
  const { data: allWorkouts = [] } = useListWorkouts();
  const { data: allProducts = [] } = useListProducts();

  const favoriteWorkouts = allWorkouts.filter(w => favoritesData?.favorites.includes(w.id));
  const wishlistProducts = allProducts.filter(p => wishlistData?.wishlist.includes(p.id));

  const today = new Date();
  const dayIndex = today.getDay(); // 0 is Sunday
  // Mapping our API response schedule keys to JS days: API assumes Mon is 1, Sun is 7? Wait, API schema says: monWorkout, tueWorkout, etc.
  const dayKeys: (keyof NonNullable<typeof schedule>)[] = ['sunWorkout', 'monWorkout', 'tueWorkout', 'wedWorkout', 'thuWorkout', 'friWorkout', 'satWorkout'];
  
  const todaysWorkoutKey = dayKeys[dayIndex];
  const todaysWorkout = schedule ? schedule[todaysWorkoutKey] : null;

  // Generate week dates for the calendar strip
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Hide celebration overlay after 3 seconds
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, setShowCelebration]);

  return (
    <div className="pb-32 min-h-screen bg-sand relative">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl flex flex-col items-center animate-in zoom-in-95 duration-500 max-w-sm mx-4 text-center">
            <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-10 h-10 text-orange" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-navy mb-2">Workout Complete!</h2>
            <p className="text-gray-600 mb-6">Great job showing up for yourself today. Your streak is now {progress?.streak || 1} days.</p>
            <button 
              onClick={() => setShowCelebration(false)}
              className="bg-navy text-white px-8 py-3 rounded-full font-bold w-full"
            >
              Keep it up
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-12 px-6 pb-6 bg-white rounded-b-3xl shadow-sm relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-2xl font-bold text-navy tracking-wide">CoreKaya</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-orange">Pilates Labs</p>
          </div>
          <div className="flex items-center space-x-1.5 bg-orange/10 px-3 py-1.5 rounded-full">
            <Zap size={16} className="text-orange fill-orange" />
            <span className="text-sm font-bold text-orange">{progress?.streak || 0}</span>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="font-serif text-xl font-bold text-navy">Weekly Drop</h2>
          <p className="text-sm text-gray-500 font-medium">Your curated schedule</p>
        </div>

        {/* Calendar Strip */}
        <div className="flex justify-between items-center mb-2">
          {weekDays.map((date, i) => {
            const isToday = isSameDay(date, today);
            return (
              <div 
                key={i} 
                className={`flex flex-col items-center justify-center w-10 h-14 rounded-full ${
                  isToday ? "bg-navy text-white shadow-md" : "text-gray-400"
                }`}
              >
                <span className="text-[10px] font-bold uppercase mb-1">
                  {format(date, "EEE")}
                </span>
                <span className={`text-sm font-bold ${isToday ? "" : "text-gray-900"}`}>
                  {format(date, "d")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 space-y-10">
        {/* Today's Prescription */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-serif text-xl font-bold text-navy">Today's Prescription</h3>
          </div>
          
          {todaysWorkout ? (
            <WorkoutCard 
              workout={todaysWorkout as Workout} 
              featured={true} 
              onClick={onPlayWorkout} 
            />
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <CalendarIcon size={24} />
              </div>
              <h4 className="font-serif text-lg font-bold text-navy mb-2">Rest Day</h4>
              <p className="text-sm text-gray-500">Take some time to recover and prepare for tomorrow's session.</p>
            </div>
          )}
          
          <button className="w-full mt-4 py-3 rounded-full border border-navy text-navy font-bold text-sm hover:bg-navy/5 transition-colors flex items-center justify-center">
            <CalendarIcon size={16} className="mr-2" />
            Add Schedule to Calendar
          </button>
        </section>

        {/* Wishlist */}
        {wishlistProducts.length > 0 && (
          <section>
            <h3 className="font-serif text-xl font-bold text-navy mb-4">Your Wishlist</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {wishlistProducts.map(product => (
                <div key={product.id} className="w-64 flex-shrink-0">
                  <ProductCard 
                    product={product} 
                    onClick={setSelectedProduct} 
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Favorites */}
        {favoriteWorkouts.length > 0 && (
          <section>
            <h3 className="font-serif text-xl font-bold text-navy mb-4">Your Favorite Classes</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
              {favoriteWorkouts.map(workout => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                  onClick={onPlayWorkout} 
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}