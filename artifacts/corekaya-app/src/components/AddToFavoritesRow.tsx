import { Heart } from "lucide-react";
import { useToggleFavoriteWorkout, useGetUserFavorites, getGetUserFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AddToFavoritesRowProps {
  workoutId: number;
}

export function AddToFavoritesRow({ workoutId }: AddToFavoritesRowProps) {
  const queryClient = useQueryClient();
  const { data: favoritesData } = useGetUserFavorites();
  const toggleFavorite = useToggleFavoriteWorkout();

  const isFavorite = favoritesData?.favorites.includes(workoutId) || false;

  const handleToggle = () => {
    // Optimistic update
    const previousFavorites = queryClient.getQueryData(getGetUserFavoritesQueryKey());
    queryClient.setQueryData(getGetUserFavoritesQueryKey(), (old: any) => {
      if (!old) return { favorites: [workoutId] };
      const newFavorites = isFavorite 
        ? old.favorites.filter((id: number) => id !== workoutId)
        : [...old.favorites, workoutId];
      return { ...old, favorites: newFavorites };
    });

    toggleFavorite.mutate({ data: { workoutId } }, {
      onError: () => {
        // Revert on error
        queryClient.setQueryData(getGetUserFavoritesQueryKey(), previousFavorites);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-between w-full py-4 border-b border-white/10 group"
      data-testid={`add-favorite-row-${workoutId}`}
    >
      <span className="text-white text-sm font-medium">
        {isFavorite ? "Added to Favorites" : "Add to Favorites"}
      </span>
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
        <Heart
          size={16}
          className={`transition-colors ${isFavorite ? "fill-orange text-orange" : "text-white"}`}
        />
      </div>
    </button>
  );
}