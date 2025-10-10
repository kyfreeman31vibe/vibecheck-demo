import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Heart, MessageCircle, User, Settings, Zap, TrendingUp, BarChart3, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import HomeFeed from "@/components/home-feed";

interface DashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [, setLocation] = useLocation();

  // Dashboard data queries
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!currentUser,
  });

  const { data: recentMatches } = useQuery({
    queryKey: ["/api/dashboard/recent-matches"],
    enabled: !!currentUser,
  });

  return (
    <div className="min-h-screen tech-gradient-soft pb-20">
      {/* Header */}
      <div className="bg-gray-900/30 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg border-b border-purple-500/30">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white drop-shadow-lg">VibeCheck</h1>
              <p className="text-sm text-gray-300">Welcome back, {currentUser.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/20"
              title="Dashboard"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-red-500/20"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <p className="text-2xl font-bold text-white">
                {(dashboardStats as any)?.totalMatches || 0}
              </p>
              <p className="text-sm text-gray-300">Total Matches</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/40 backdrop-blur-xl border border-cyan-500/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
              <p className="text-2xl font-bold text-white">
                {(dashboardStats as any)?.activeChats || 0}
              </p>
              <p className="text-sm text-gray-300">Active Chats</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/40 backdrop-blur-xl border border-lime-500/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-lime-400" />
              <p className="text-2xl font-bold text-white">
                {(dashboardStats as any)?.compatibilityScore || 0}%
              </p>
              <p className="text-sm text-gray-300">Avg Compatibility</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold text-white">
                {(dashboardStats as any)?.vibeScore || 0}
              </p>
              <p className="text-sm text-gray-300">Vibe Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Home Feed - Music Activity & Trending */}
        <HomeFeed currentUser={currentUser} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setLocation("/discover")}
            className="h-16 tech-gradient hover:opacity-90 text-white shadow-lg rounded-xl border border-purple-400/50"
          >
            <div className="text-center">
              <Heart className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Discover</span>
            </div>
          </Button>
          
          <Button
            onClick={() => setLocation("/messages")}
            variant="outline"
            className="h-16 border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 backdrop-blur-sm rounded-xl"
          >
            <div className="text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Messages</span>
            </div>
          </Button>
        </div>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}