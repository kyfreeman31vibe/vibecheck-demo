import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Heart, MessageCircle, User, Settings, Zap, TrendingUp, BarChart3, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";

interface DashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Dashboard data queries
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!currentUser,
  });

  const { data: recentMatches } = useQuery({
    queryKey: ["/api/dashboard/recent-matches"],
    enabled: !!currentUser,
  });

  const { data: spotifyStatus, refetch: refetchSpotifyStatus } = useQuery({
    queryKey: ["/api/spotify/status"],
    enabled: !!currentUser,
  });

  // Listen for Spotify auth popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'spotify-auth-success') {
        toast({
          title: "Spotify Connected!",
          description: "Your music accounts are now synced.",
        });
        // Refresh Spotify status
        refetchSpotifyStatus();
      } else if (event.data === 'spotify-auth-error') {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Spotify. Please try again.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refetchSpotifyStatus, toast]);

  return (
    <div className="min-h-screen sunset-gradient-soft pb-20">
      {/* Header */}
      <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-white/10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white dark:text-white drop-shadow-lg">VibeCheck</h1>
              <p className="text-sm text-white/80 dark:text-white/70">Welcome back, {currentUser.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/90 hover:text-white hover:bg-white/10 dark:text-white/80 dark:hover:text-white"
              title="Dashboard"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-white/90 hover:text-white hover:bg-white/10 dark:text-white/80 dark:hover:text-white"
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
          <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-300" />
              <p className="text-2xl font-bold text-white dark:text-white drop-shadow-lg">
                {(dashboardStats as any)?.totalMatches || 0}
              </p>
              <p className="text-sm text-white/80 dark:text-white/70">Total Matches</p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-orange-300" />
              <p className="text-2xl font-bold text-white dark:text-white drop-shadow-lg">
                {(dashboardStats as any)?.activeChats || 0}
              </p>
              <p className="text-sm text-white/80 dark:text-white/70">Active Chats</p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-2xl font-bold text-white dark:text-white drop-shadow-lg">
                {(dashboardStats as any)?.compatibilityScore || 0}%
              </p>
              <p className="text-sm text-white/80 dark:text-white/70">Avg Compatibility</p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-lg">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-purple-300" />
              <p className="text-2xl font-bold text-white dark:text-white drop-shadow-lg">
                {(dashboardStats as any)?.vibeScore || 0}
              </p>
              <p className="text-sm text-white/80 dark:text-white/70">Vibe Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Music Connection Status */}
        <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white dark:text-white drop-shadow-lg">Music Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Music className={`w-5 h-5 ${(spotifyStatus as any)?.connected ? 'text-green-300' : 'text-white/50'}`} />
                <div>
                  <span className="text-white dark:text-white">Spotify</span>
                  {(spotifyStatus as any)?.connected && (
                    <p className="text-xs text-white/70 dark:text-white/60">Music sync active</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(spotifyStatus as any)?.connected ? (
                  <Badge className="bg-green-500/20 text-green-300 border border-green-400/30" data-testid="badge-spotify-connected">
                    Connected
                  </Badge>
                ) : (
                  <Button
                    onClick={() => {
                      // Open Spotify auth in popup to avoid navigation issues
                      const popup = window.open(
                        '/api/auth/spotify',
                        'spotify-auth',
                        'width=600,height=700,scrollbars=yes,resizable=yes'
                      );
                      
                      if (!popup) {
                        toast({
                          title: "Popup Blocked",
                          description: "Please allow popups for Spotify authentication.",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      // Listen for popup close without message (user closed manually)
                      const checkClosed = setInterval(() => {
                        if (popup.closed) {
                          clearInterval(checkClosed);
                        }
                      }, 1000);
                    }}
                    size="sm"
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-lg"
                    data-testid="button-connect-spotify"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
            
            {!(spotifyStatus as any)?.connected && (
              <div className="mt-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <p className="text-sm text-white/80 dark:text-white/70">
                  Connect your Spotify account to import playlists and improve music-based matching!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white dark:text-white drop-shadow-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches && (recentMatches as any[]).length > 0 ? (
                (recentMatches as any[]).slice(0, 3).map((match: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <User className="w-4 h-4 text-pink-300" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white dark:text-white">
                        New match with {match.name}
                      </p>
                      <p className="text-xs text-white/70 dark:text-white/60">
                        {match.compatibilityScore}% compatibility
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/70 dark:text-white/60 text-center py-4">
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
            className="h-16 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg rounded-xl"
          >
            <div className="text-center">
              <Heart className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm font-medium">Discover</span>
            </div>
          </Button>
          
          <Button
            onClick={() => setLocation("/messages")}
            variant="outline"
            className="h-16 border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl"
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