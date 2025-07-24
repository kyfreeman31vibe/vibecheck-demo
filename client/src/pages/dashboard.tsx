import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Heart, MessageCircle, User, Settings, Zap, TrendingUp, BarChart3, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";

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

  const { data: spotifyStatus } = useQuery({
    queryKey: ["/api/spotify/status"],
    enabled: !!currentUser,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Music className="w-8 h-8 text-music-purple" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">VibeCheck</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {currentUser.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Dashboard"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {(dashboardStats as any)?.totalMatches || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Matches</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {(dashboardStats as any)?.activeChats || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Chats</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {(dashboardStats as any)?.compatibilityScore || 0}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Compatibility</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {(dashboardStats as any)?.vibeScore || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vibe Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Music Connection Status */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Music Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Music className="w-5 h-5 text-green-500" />
                <span className="text-gray-900 dark:text-gray-100">Spotify</span>
              </div>
              {(spotifyStatus as any)?.connected ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Connected
                </Badge>
              ) : (
                <Button
                  onClick={() => setLocation("/setup")}
                  size="sm"
                  variant="outline"
                >
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches && (recentMatches as any[]).length > 0 ? (
                (recentMatches as any[]).slice(0, 3).map((match: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <User className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        New match with {match.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {match.compatibilityScore}% compatibility
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setLocation("/discover")}
            className="h-16 bg-music-purple hover:bg-music-purple/90 text-white"
          >
            <div className="text-center">
              <Heart className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Discover</span>
            </div>
          </Button>
          
          <Button
            onClick={() => setLocation("/messages")}
            variant="outline"
            className="h-16 border-music-purple text-music-purple hover:bg-music-purple/10"
          >
            <div className="text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Messages</span>
            </div>
          </Button>
        </div>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}