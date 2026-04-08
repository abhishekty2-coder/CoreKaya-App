import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { UserProvider } from "./context/UserContext";
import { Navigation } from "./components/Navigation";
import { HomeTab } from "./pages/HomeTab";
import { LabsTab } from "./pages/LabsTab";
import { ShopTab } from "./pages/ShopTab";
import { AiCoachTab } from "./pages/AiCoachTab";
import { Player } from "./pages/Player";

import { AdminLayout } from "@/components/AdminLayout";
import { AdminAuth } from "@/pages/admin/AdminAuth";
import { AdminOverview } from "@/pages/admin/AdminOverview";
import { AdminWorkouts } from "@/pages/admin/AdminWorkouts";
import { AdminProducts } from "@/pages/admin/AdminProducts";
import { AdminQuotes } from "@/pages/admin/AdminQuotes";
import { AdminSchedule } from "@/pages/admin/AdminSchedule";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type Tab = "home" | "labs" | "shop" | "ai";
type PageState = "main" | "player";

function MobileApp() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [currentPage, setCurrentPage] = useState<PageState>("main");
  const [workoutIdToPlay, setWorkoutIdToPlay] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handlePlayWorkout = (id: number) => {
    setWorkoutIdToPlay(id);
    setCurrentPage("player");
  };

  const handleClosePlayer = () => {
    setCurrentPage("main");
    setWorkoutIdToPlay(null);
  };

  const handleCompleteWorkout = () => {
    setCurrentPage("main");
    setWorkoutIdToPlay(null);
    setShowCelebration(true);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-hidden">
        {currentPage === "player" && workoutIdToPlay !== null ? (
          <Player
            workoutId={workoutIdToPlay}
            onBack={handleClosePlayer}
            onComplete={handleCompleteWorkout}
          />
        ) : (
          <>
            {activeTab === "home" && (
              <HomeTab
                onPlayWorkout={handlePlayWorkout}
                showCelebration={showCelebration}
                setShowCelebration={setShowCelebration}
              />
            )}
            {activeTab === "labs" && <LabsTab onPlayWorkout={handlePlayWorkout} />}
            {activeTab === "shop" && <ShopTab />}
            {activeTab === "ai" && <AiCoachTab />}

            <Navigation activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />
          </>
        )}
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const isAuthenticated = localStorage.getItem("adminAuth") === "true";

  if (!isAuthenticated) {
    return <AdminAuth />;
  }

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
