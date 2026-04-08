import React, { createContext, useContext } from 'react';
import {
  useGetUserFavorites,
  useGetUserWishlist,
  useGetUserProgress,
  useToggleFavoriteWorkout,
  useToggleWishlistProduct,
  useCompleteWorkoutProgress,
  getGetUserFavoritesQueryKey,
  getGetUserWishlistQueryKey,
  getGetUserProgressQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface UserState {
  streak: number;
  favorites: number[];
  wishlist: number[];
  completedWorkouts: number[];
  isPremium: boolean;
  name: string;
}

interface UserContextType {
  userState: UserState;
  toggleFavoriteWorkout: (workoutId: number) => void;
  toggleWishlistProduct: (productId: number) => void;
  isWorkoutFavorite: (workoutId: number) => boolean;
  isProductInWishlist: (productId: number) => boolean;
  completeWorkout: (workoutId: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: favoritesData } = useGetUserFavorites();
  const { data: wishlistData } = useGetUserWishlist();
  const { data: progressData } = useGetUserProgress();

  const toggleFavMutation = useToggleFavoriteWorkout();
  const toggleWishlistMutation = useToggleWishlistProduct();
  const completeWorkoutMutation = useCompleteWorkoutProgress();

  const userState: UserState = {
    streak: progressData?.streak ?? 0,
    favorites: favoritesData?.favorites ?? [],
    wishlist: wishlistData?.wishlist ?? [],
    completedWorkouts: progressData?.completedWorkouts ?? [],
    isPremium: true,
    name: 'Kaya Member',
  };

  const toggleFavoriteWorkout = (workoutId: number) => {
    const isFav = userState.favorites.includes(workoutId);
    const prev = queryClient.getQueryData(getGetUserFavoritesQueryKey());
    queryClient.setQueryData(getGetUserFavoritesQueryKey(), (old: any) => {
      if (!old) return { favorites: [workoutId] };
      return {
        ...old,
        favorites: isFav
          ? old.favorites.filter((id: number) => id !== workoutId)
          : [...old.favorites, workoutId],
      };
    });
    toggleFavMutation.mutate({ data: { workoutId } }, {
      onError: () => queryClient.setQueryData(getGetUserFavoritesQueryKey(), prev),
    });
  };

  const toggleWishlistProduct = (productId: number) => {
    const isIn = userState.wishlist.includes(productId);
    const prev = queryClient.getQueryData(getGetUserWishlistQueryKey());
    queryClient.setQueryData(getGetUserWishlistQueryKey(), (old: any) => {
      if (!old) return { wishlist: [productId] };
      return {
        ...old,
        wishlist: isIn
          ? old.wishlist.filter((id: number) => id !== productId)
          : [...old.wishlist, productId],
      };
    });
    toggleWishlistMutation.mutate({ data: { productId } }, {
      onError: () => queryClient.setQueryData(getGetUserWishlistQueryKey(), prev),
    });
  };

  const completeWorkout = (workoutId: number) => {
    const prev = queryClient.getQueryData(getGetUserProgressQueryKey());
    queryClient.setQueryData(getGetUserProgressQueryKey(), (old: any) => {
      if (!old) return { streak: 1, completedWorkouts: [workoutId], lastWorkoutDate: new Date().toISOString() };
      return {
        ...old,
        streak: (old.streak ?? 0) + 1,
        completedWorkouts: [...(old.completedWorkouts ?? []), workoutId],
      };
    });
    completeWorkoutMutation.mutate({ data: { workoutId } }, {
      onError: () => queryClient.setQueryData(getGetUserProgressQueryKey(), prev),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserProgressQueryKey() });
      },
    });
  };

  const isWorkoutFavorite = (workoutId: number) => userState.favorites.includes(workoutId);
  const isProductInWishlist = (productId: number) => userState.wishlist.includes(productId);

  return (
    <UserContext.Provider value={{
      userState,
      toggleFavoriteWorkout,
      toggleWishlistProduct,
      isWorkoutFavorite,
      isProductInWishlist,
      completeWorkout,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
