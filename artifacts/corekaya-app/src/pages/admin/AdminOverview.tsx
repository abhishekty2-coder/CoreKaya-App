import { useGetAdminStats } from "@workspace/api-client-react";
import { Dumbbell, ShoppingBag, MessageSquare, AlertCircle } from "lucide-react";

export function AdminOverview() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  const statCards = [
    {
      title: "Total Workouts",
      value: stats?.totalWorkouts || 0,
      subtext: `${stats?.publishedWorkouts || 0} published`,
      icon: Dumbbell,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      subtext: `${stats?.publishedProducts || 0} published`,
      icon: ShoppingBag,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Total Quotes",
      value: stats?.totalQuotes || 0,
      subtext: "All time requests",
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Pending Quotes",
      value: stats?.pendingQuotes || 0,
      subtext: "Needs attention",
      icon: AlertCircle,
      color: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}