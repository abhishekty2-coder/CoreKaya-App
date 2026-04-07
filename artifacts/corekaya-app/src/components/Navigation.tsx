import { Home, Grid, ShoppingBag, Sparkles } from "lucide-react";

type Tab = "home" | "labs" | "shop" | "ai";

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: "Weekly Drop", icon: Home },
    { id: "labs", label: "The Labs", icon: Grid },
    { id: "shop", label: "Shop", icon: ShoppingBag },
    { id: "ai", label: "AI Coach", icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-transparent pointer-events-none">
      <div className="w-full max-w-md bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center pb-safe pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 min-w-[64px] ${
                isActive ? "text-navy" : "text-gray-400 hover:text-gray-600"
              }`}
              data-testid={`nav-tab-${tab.id}`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}