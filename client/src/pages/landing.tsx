import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Heart, MessageCircle, User, Settings, Zap, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    name: "",
    age: "",
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUser", JSON.stringify(user));
      setLocation("/setup");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create account. Username might already exist.",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);
      setShowLogin(false);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate({
      ...signupData,
      age: parseInt(signupData.age),
      favoriteGenres: [],
      favoriteArtists: [],
      favoriteSongs: [],
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  if (showSignup) {
    return (
      <div className="min-h-screen music-gradient flex flex-col items-center justify-center text-white p-6">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <Music className="w-16 h-16 mx-auto mb-4 animate-bounce-gentle" />
            <h1 className="text-3xl font-bold mb-2">Join VibeCheck</h1>
            <p className="text-lg opacity-90">Create your music profile</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Username"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Input
                  type="number"
                  placeholder="Age"
                  value={signupData.age}
                  onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-white text-purple-600 font-semibold hover:bg-white/90"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Button
            variant="ghost"
            onClick={() => setShowSignup(false)}
            className="w-full mt-4 text-white border border-white/30 hover:bg-white/10"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen music-gradient flex flex-col items-center justify-center text-white p-6">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center mb-8">
            <Music className="w-16 h-16 mx-auto mb-4 animate-bounce-gentle" />
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-lg opacity-90">Sign in to VibeCheck</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-white text-purple-600 font-semibold hover:bg-white/90"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Button
            variant="ghost"
            onClick={() => setShowLogin(false)}
            className="w-full mt-4 text-white border border-white/30 hover:bg-white/10"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  // Dashboard UI for logged-in users
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
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
              onClick={() => setLocation("/matches")}
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
      </div>
    );
  }

  return (
    <div className="relative h-screen music-gradient flex flex-col items-center justify-center text-white p-6">
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="relative z-10 text-center">
        <div className="mb-8">
          <Music className="w-16 h-16 mx-auto mb-4 animate-bounce-gentle" />
          <h1 className="text-4xl font-bold mb-2">VibeCheck</h1>
          <p className="text-xl opacity-90">Find love through music</p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Button
            onClick={() => setShowSignup(true)}
            className="w-full bg-white text-purple-600 font-semibold py-4 rounded-full shadow-lg hover:bg-white/90 transform transition hover:scale-105"
          >
            Get Started
          </Button>
          <Button
            onClick={() => setShowLogin(true)}
            variant="outline"
            className="w-full border-2 border-white text-white font-semibold py-4 rounded-full transform transition hover:scale-105 hover:bg-white/10"
          >
            Sign In
          </Button>
        </div>

        <p className="text-sm opacity-75 mt-8">Connect hearts through harmonies</p>
      </div>
    </div>
  );
}
