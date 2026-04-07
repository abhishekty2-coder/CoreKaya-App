import { Heart } from "lucide-react";
import { useToggleFavoriteWorkout, useGetUserFavorites, getGetUserFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface FavoriteToggleButtonProps {
  workoutId: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FavoriteToggleButton({ workoutId, size = "md", className = "" }: FavoriteToggleButtonProps) {
  const queryClient = useQueryClient();
  const { data: favoritesData } = useGetUserFavorites();
  const toggleFavorite = useToggleFavoriteWorkout();

  const isFavorite = favoritesData?.favorites.includes(workoutId) || false;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      className={`flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-colors hover:bg-white/40 ${sizeClasses[size]} ${className}`}
      data-testid={`favorite-toggle-${workoutId}`}
    >
      <Heart
        size={iconSizes[size]}
        className={`transition-colors ${isFavorite ? "fill-orange text-orange" : "text-white"}`}
      />
    </button>
  );
}