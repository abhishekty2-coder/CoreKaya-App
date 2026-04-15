import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  useGetUserFavorites,
  useGetUserWishlist,
  useGetUserProgress,
  useGetCurrentSchedule,
  useToggleFavoriteWorkout,
  useToggleWishlistProduct,
  getGetUserFavoritesQueryKey,
  getGetUserWishlistQueryKey,
  getGetUserProgressQueryKey,
  type Schedule,
} from '@workspace/api-client-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const SESSION_ID = 'session-default';
const API_BASE = '/api';

const apiFetch = async (path: string, opts?: RequestInit) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'x-session-id': SESSION_ID, ...(opts?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

export interface BadgeRecord {
  id: number; slug: string; name: string; description: string; iconEmoji: string;
  xpReward: number; unlockConditionType: string; unlockConditionValue: number;
  earned: boolean; earnedAt: Date | null;
}

export interface XpData {
  totalXp: number; level: number; levelName: string;
  xpToNextLevel: number; nextLevelXp: number | null; currentLevelMinXp: number;
}

export interface CheckInRecord {
  id: number; sessionId: string; workoutId: number; feeling: string;
  checkedInAt: Date; workoutTitle?: string | null;
}

export interface OnboardingRecord {
  id?: number; sessionId?: string; goal?: string | null;
  experienceLevel?: string | null; equipmentOwned?: string[] | null;
  daysPerWeek?: number | null; isComplete: boolean;
}

export interface CompletionResult {
  streak: number; completedWorkouts: number[]; newBadges: BadgeRecord[];
  xpEarned: number; newLevel: string | null; totalXp: number; prevStreak?: number;
}

interface UserState {
  streak: number; favorites: number[]; wishlist: number[];
  completedWorkouts: number[]; isPremium: boolean; name: string;
}

interface UserContextType {
  userState: UserState;
  onboarding: OnboardingRecord | null;
  xpData: XpData;
  badges: BadgeRecord[];
  checkInHistory: CheckInRecord[];
  schedule: Schedule | null;
  isOnboardingLoading: boolean;
  toggleFavoriteWorkout: (workoutId: number) => void;
  toggleWishlistProduct: (productId: number) => void;
  isWorkoutFavorite: (workoutId: number) => boolean;
  isProductInWishlist: (productId: number) => boolean;
  completeWorkout: (workoutId: number) => void;
  completeWorkoutWithRitual: (workoutId: number) => Promise<CompletionResult>;
  saveOnboarding: (data: { goal: string; experienceLevel: string; equipmentOwned: string[]; daysPerWeek: number }) => Promise<void>;
  submitCheckin: (workoutId: number, feeling: string) => Promise<void>;
  refetchXp: () => void;
  refetchBadges: () => void;
  refetchCheckins: () => void;
}

const defaultXpData: XpData = { totalXp: 0, level: 1, levelName: 'Beginner', xpToNextLevel: 200, nextLevelXp: 200, currentLevelMinXp: 0 };

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: favoritesData } = useGetUserFavorites();
  const { data: wishlistData } = useGetUserWishlist();
  const { data: progressData } = useGetUserProgress();
  const { data: scheduleData } = useGetCurrentSchedule();

  const toggleFavMutation = useToggleFavoriteWorkout();
  const toggleWishlistMutation = useToggleWishlistProduct();

  const { data: onboardingData, isLoading: isOnboardingLoading, refetch: refetchOnboarding } = useQuery({
    queryKey: ['user-onboarding'],
    queryFn: () => apiFetch('/user/onboarding'),
  });
  const { data: xpRaw, refetch: refetchXp } = useQuery({
    queryKey: ['gamification-status'],
    queryFn: () => apiFetch('/gamification/status'),
  });
  const { data: badgesRaw, refetch: refetchBadges } = useQuery({
    queryKey: ['gamification-badges'],
    queryFn: () => apiFetch('/gamification/badges'),
  });
  const { data: checkinsRaw, refetch: refetchCheckins } = useQuery({
    queryKey: ['user-checkin-history'],
    queryFn: () => apiFetch('/user/checkin-history'),
  });

  const [localXp, setLocalXp] = useState<number | null>(null);

  const onboarding: OnboardingRecord | null = onboardingData ?? null;
  const xpData: XpData = {
    totalXp: localXp ?? xpRaw?.totalXp ?? 0,
    level: xpRaw?.level ?? 1,
    levelName: xpRaw?.levelName ?? 'Beginner',
    xpToNextLevel: xpRaw?.xpToNextLevel ?? 200,
    nextLevelXp: xpRaw?.nextLevelXp ?? null,
    currentLevelMinXp: xpRaw?.currentLevelMinXp ?? 0,
  };
  const badges: BadgeRecord[] = badgesRaw?.badges ?? [];
  const checkInHistory: CheckInRecord[] = checkinsRaw?.history ?? [];
  const schedule: Schedule | null = scheduleData ?? null;

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
      return { ...old, favorites: isFav ? old.favorites.filter((id: number) => id !== workoutId) : [...old.favorites, workoutId] };
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
      return { ...old, wishlist: isIn ? old.wishlist.filter((id: number) => id !== productId) : [...old.wishlist, productId] };
    });
    toggleWishlistMutation.mutate({ data: { productId } }, {
      onError: () => queryClient.setQueryData(getGetUserWishlistQueryKey(), prev),
    });
  };

  const completeWorkout = (workoutId: number) => {
    const prev = queryClient.getQueryData(getGetUserProgressQueryKey());
    queryClient.setQueryData(getGetUserProgressQueryKey(), (old: any) => {
      if (!old) return { streak: 1, completedWorkouts: [workoutId], lastWorkoutDate: new Date().toISOString() };
      return { ...old, streak: (old.streak ?? 0) + 1, completedWorkouts: [...(old.completedWorkouts ?? []), workoutId] };
    });
    apiFetch('/user/progress', { method: 'POST', body: JSON.stringify({ workoutId }) })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: getGetUserProgressQueryKey() });
        refetchXp();
        refetchBadges();
      })
      .catch(() => queryClient.setQueryData(getGetUserProgressQueryKey(), prev));
  };

  const completeWorkoutWithRitual = useCallback(async (workoutId: number): Promise<CompletionResult> => {
    const prevStreak = progressData?.streak ?? 0;
    setLocalXp(prev => (prev ?? (xpRaw?.totalXp ?? 0)) + 10);
    const data = await apiFetch('/user/progress', { method: 'POST', body: JSON.stringify({ workoutId }) });
    queryClient.invalidateQueries({ queryKey: getGetUserProgressQueryKey() });
    refetchXp();
    refetchBadges();
    refetchCheckins();
    setLocalXp(null);
    return { ...data, prevStreak } as CompletionResult;
  }, [progressData?.streak, xpRaw?.totalXp]);

  const saveOnboarding = async (formData: { goal: string; experienceLevel: string; equipmentOwned: string[]; daysPerWeek: number }) => {
    await apiFetch('/user/onboarding', { method: 'POST', body: JSON.stringify(formData) });
    localStorage.setItem('ck_onboarded', '1');
    queryClient.invalidateQueries({ queryKey: ['user-onboarding'] });
    refetchOnboarding();
  };

  const submitCheckin = async (workoutId: number, feeling: string) => {
    await apiFetch('/user/checkin', { method: 'POST', body: JSON.stringify({ workoutId, feeling }) });
    refetchCheckins();
  };

  return (
    <UserContext.Provider value={{
      userState, onboarding, xpData, badges, checkInHistory, schedule, isOnboardingLoading,
      toggleFavoriteWorkout, toggleWishlistProduct,
      isWorkoutFavorite: (id) => userState.favorites.includes(id),
      isProductInWishlist: (id) => userState.wishlist.includes(id),
      completeWorkout, completeWorkoutWithRitual, saveOnboarding, submitCheckin,
      refetchXp, refetchBadges, refetchCheckins,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};
