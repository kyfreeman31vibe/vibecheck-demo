import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Heart, MessageCircle, User, Settings, Zap, TrendingUp, BarChart3, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";
import HomeFeed from "@/components/home-feed";

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

        {/* Music Connection Status */}
        <Card className="bg-gray-800/40 backdrop-blur-xl border border-cyan-500/30 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white">Music Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Music className={`w-5 h-5 ${(spotifyStatus as any)?.connected ? 'text-lime-400' : 'text-gray-400'}`} />
                <div>
                  <span className="text-white">Spotify</span>
                  {(spotifyStatus as any)?.connected && (
                    <p className="text-xs text-gray-300">Music sync active</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(spotifyStatus as any)?.connected ? (
                  <Badge className="bg-lime-500/20 text-lime-400 border border-lime-400/30" data-testid="badge-spotify-connected">
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
                    className="accent-coral-lime text-white shadow-lg border border-coral-400/50"
                    data-testid="button-connect-spotify"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
            
            {!(spotifyStatus as any)?.connected && (
              <div className="mt-3 p-3 bg-cyan-500/10 backdrop-blur-sm rounded-lg border border-cyan-500/30">
                <p className="text-sm text-gray-300">
                  Connect your Spotify account to import playlists and improve music-based matching!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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