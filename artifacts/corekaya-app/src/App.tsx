import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { UserProvider, useUser } from "./context/UserContext";
import { Navigation } from "./components/Navigation";
import { HomeTab } from "./pages/HomeTab";
import { LabsTab } from "./pages/LabsTab";
import { ShopTab } from "./pages/ShopTab";
import { AiCoachTab } from "./pages/AiCoachTab";
import { Player } from "./pages/Player";
import { ProfilePage } from "./pages/ProfilePage";
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
type PageState = "main" | "player" | "breathing";

function MobileApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [currentPage, setCurrentPage] = useState<PageState>("main");
  const [workoutIdToPlay, setWorkoutIdToPlay] = useState<number | null>(null);
  const [pendingWorkoutId, setPendingWorkoutId] = useState<number | null>(null);
  const { onboarding, isOnboardingLoading } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isOnboardingLoading && onboarding && !onboarding.isComplete) {
      setShowOnboarding(true);
    }
  }, [isOnboardingLoading, onboarding]);

  const handlePlayWorkout = (id: number) => {
    setPendingWorkoutId(id);
    setCurrentPage("breathing");
  };

  const handleBreathingComplete = () => {
    if (pendingWorkoutId !== null) {
      setWorkoutIdToPlay(pendingWorkoutId);
      setPendingWorkoutId(null);
    }
    setCurrentPage("player");
  };

  const handleBreathingSkip = () => {
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

  const handleCompleteWorkout = () => {
    setCurrentPage("main");
    setWorkoutIdToPlay(null);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isOnboardingLoading) {
    return (
      <div className="bg-navy min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
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
          <BreathingInterstitial onComplete={handleBreathingComplete} onSkip={handleBreathingSkip} />
        )}
        {currentPage === "player" && workoutIdToPlay !== null ? (
          <Player
            workoutId={workoutIdToPlay}
            onBack={handleClosePlayer}
            onComplete={handleCompleteWorkout}
          />
        ) : currentPage === "main" ? (
          <>
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

            <Navigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />
          </>
        ) : null}
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

      <Route path="/admin">
        <ProtectedRoute component={AdminOverview} />
      </Route>
      <Route path="/admin/overview">
        <ProtectedRoute component={AdminOverview} />
      </Route>
      <Route path="/admin/workouts">
        <ProtectedRoute component={AdminWorkouts} />
      </Route>
      <Route path="/admin/products">
        <ProtectedRoute component={AdminProducts} />
      </Route>
      <Route path="/admin/quotes">
        <ProtectedRoute component={AdminQuotes} />
      </Route>
      <Route path="/admin/schedule">
        <ProtectedRoute component={AdminSchedule} />
      </Route>
      <Route path="/admin/gamification">
        <ProtectedRoute component={AdminGamification} />
      </Route>

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
