import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetWorkout } from "@workspace/api-client-react";

import { UserProvider, useUser, type CompletionResult } from "./context/UserContext";
import { Navigation } from "./components/Navigation";
import { HomeTab } from "./pages/HomeTab";
import { LabsTab } from "./pages/LabsTab";
import { ShopTab } from "./pages/ShopTab";
import { AiCoachTab } from "./pages/AiCoachTab";
import { Player } from "./pages/Player";
import { ProfilePage } from "./pages/ProfilePage";
import { PostWorkoutRitual } from "./pages/PostWorkoutRitual";
import { Onboarding } from "./pages/Onboarding";
import { BreathingInterstitial } from "./pages/BreathingInterstitial";

import { AdminLayout } from "@/components/AdminLayout";
import { AdminAuth } from "@/pages/admin/AdminAuth";
import { AdminOverview } from "@/pages/admin/AdminOverview";
import { AdminWorkouts } from "@/pages/admin/AdminWorkouts";
import { AdminProducts } from "@/pages/admin/AdminProducts";
import { AdminQuotes } from "@/pages/admin/AdminQuotes";
import { AdminSchedule } from "@/pages/admin/AdminSchedule";
import { AdminGamification } from "@/pages/admin/AdminGamification";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

type Tab = "home" | "labs" | "shop" | "ai" | "profile";
type PageState = "main" | "player" | "breathing" | "ritual";

function PostWorkoutRitualWrapper({
  workoutId,
  completionData,
  tomorrowWorkout,
  onClose,
}: {
  workoutId: number;
  completionData: CompletionResult;
  tomorrowWorkout: any;
  onClose: () => void;
}) {
  const { data: workout } = useGetWorkout(workoutId);
  if (!workout) return null;
  return (
    <PostWorkoutRitual
      workout={workout}
      completionData={completionData}
      tomorrowWorkout={tomorrowWorkout ?? null}
      onClose={onClose}
    />
  );
}

function MobileApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [currentPage, setCurrentPage] = useState<PageState>("main");
  const [workoutIdToPlay, setWorkoutIdToPlay] = useState<number | null>(null);
  const [pendingWorkoutId, setPendingWorkoutId] = useState<number | null>(null);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);

  const { onboarding, isOnboardingLoading, schedule } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);

  /* FIX 8 — check localStorage before showing onboarding */
  useEffect(() => {
    if (localStorage.getItem('ck_onboarded') === '1') return;
    if (!isOnboardingLoading && onboarding && !onboarding.isComplete) {
      setShowOnboarding(true);
    }
  }, [isOnboardingLoading, onboarding]);

  /* FIX 7 — tomorrowWorkout from schedule in UserContext */
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const dayWorkoutKeys = ['monWorkout', 'tueWorkout', 'wedWorkout', 'thuWorkout', 'friWorkout', 'satWorkout', 'sunWorkout'] as const;
  const tomorrowWorkout = schedule ? (schedule as any)[dayWorkoutKeys[(todayIndex + 1) % 7]] ?? null : null;

  const handlePlayWorkout = (id: number) => {
    setPendingWorkoutId(id);
    setCurrentPage("breathing");
  };

  /* FIX 14 — both onComplete and onSkip call the same handler */
  const handleBreathingComplete = () => {
    if (pendingWorkoutId !== null) {
      setWorkoutIdToPlay(pendingWorkoutId);
      setPendingWorkoutId(null);
    }
    setCurrentPage("player");
  };

  const handleClosePlayer = () => {
    setCurrentPage("main");
    setWorkoutIdToPlay(null);
  };

  /* FIX 7 — accept CompletionResult from Player and show ritual */
  const handleCompleteWorkout = (result: CompletionResult) => {
    setCompletionResult(result);
    setCurrentPage("ritual");
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleRitualClose = () => {
    setCurrentPage("main");
    setWorkoutIdToPlay(null);
    setCompletionResult(null);
  };

  if (isOnboardingLoading) {
    return (
      <div className="bg-navy min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">

        {currentPage === "breathing" && (
          <BreathingInterstitial
            onComplete={handleBreathingComplete}
            onSkip={handleBreathingComplete}
          />
        )}

        {currentPage === "player" && workoutIdToPlay !== null && (
          <Player
            workoutId={workoutIdToPlay}
            onBack={handleClosePlayer}
            onComplete={handleCompleteWorkout}
          />
        )}

        {currentPage === "ritual" && workoutIdToPlay !== null && completionResult !== null && (
          <PostWorkoutRitualWrapper
            workoutId={workoutIdToPlay}
            completionData={completionResult}
            tomorrowWorkout={tomorrowWorkout}
            onClose={handleRitualClose}
          />
        )}

        {currentPage === "main" && (
          <>
            {/* FIX 2 — key forces remount on tab change, triggering CSS animation */}
            <div key={activeTab} style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
              {activeTab === "home" && (
                <HomeTab
                  onPlayWorkout={handlePlayWorkout}
                  onBrowseLabs={() => setActiveTab("labs")}
                />
              )}
              {activeTab === "labs" && <LabsTab onPlayWorkout={handlePlayWorkout} />}
              {activeTab === "shop" && <ShopTab />}
              {activeTab === "ai" && <AiCoachTab onPlayWorkout={handlePlayWorkout} />}
              {activeTab === "profile" && <ProfilePage />}
            </div>

            <Navigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />
          </>
        )}
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const isAuthenticated = localStorage.getItem("adminAuth") === "true";
  if (!isAuthenticated) return <AdminAuth />;
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MobileApp} />
      <Route path="/admin"><ProtectedRoute component={AdminOverview} /></Route>
      <Route path="/admin/overview"><ProtectedRoute component={AdminOverview} /></Route>
      <Route path="/admin/workouts"><ProtectedRoute component={AdminWorkouts} /></Route>
      <Route path="/admin/products"><ProtectedRoute component={AdminProducts} /></Route>
      <Route path="/admin/quotes"><ProtectedRoute component={AdminQuotes} /></Route>
      <Route path="/admin/schedule"><ProtectedRoute component={AdminSchedule} /></Route>
      <Route path="/admin/gamification"><ProtectedRoute component={AdminGamification} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
