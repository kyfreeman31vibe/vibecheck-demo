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
      <div className="min-h-screen sunset-gradient relative overflow-hidden">
        {/* Sunset Sky Animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 sunset-gradient animate-pulse-slow"></div>
          {/* Floating clouds/particles */}
          <div className="absolute top-16 right-12 w-18 h-10 bg-white/10 rounded-full blur-sm animate-bounce-gentle"></div>
          <div className="absolute top-28 left-16 w-14 h-7 bg-white/15 rounded-full blur-sm animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-36 right-1/3 w-10 h-5 bg-white/10 rounded-full blur-sm animate-bounce-gentle" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-28 left-12 w-22 h-9 bg-white/10 rounded-full blur-sm animate-pulse" style={{animationDelay: '2.5s'}}></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Sunset-themed header */}
            <div className="text-center mb-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Music className="w-10 h-10 text-white animate-bounce-gentle" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Join VibeCheck</h1>
              <p className="text-xl text-white/90 font-medium">Create your music profile</p>
              <p className="text-sm text-white/70 mt-2">Let the sunset guide your musical journey</p>
            </div>

            {/* Glassmorphism signup card */}
            <Card className="bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      required
                      data-testid="input-signup-name"
                    />
                    <Input
                      type="text"
                      placeholder="Username"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      required
                      data-testid="input-signup-username"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      required
                      data-testid="input-signup-password"
                    />
                    <Input
                      type="number"
                      placeholder="Age"
                      value={signupData.age}
                      onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      required
                      data-testid="input-signup-age"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                    disabled={signupMutation.isPending}
                    data-testid="button-signup-submit"
                  >
                    {signupMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              onClick={() => setShowSignup(false)}
              className="w-full mt-6 h-12 text-white/90 border border-white/30 hover:bg-white/10 rounded-xl font-medium transition-all duration-300"
              data-testid="button-back-to-landing"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen sunset-gradient relative overflow-hidden">
        {/* Sunset Sky Animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 sunset-gradient animate-pulse-slow"></div>
          {/* Floating clouds/particles */}
          <div className="absolute top-20 left-10 w-20 h-12 bg-white/10 rounded-full blur-sm animate-bounce-gentle"></div>
          <div className="absolute top-32 right-20 w-16 h-8 bg-white/15 rounded-full blur-sm animate-pulse"></div>
          <div className="absolute top-40 left-1/3 w-12 h-6 bg-white/10 rounded-full blur-sm animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 right-10 w-24 h-10 bg-white/10 rounded-full blur-sm animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Sunset-themed header */}
            <div className="text-center mb-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Music className="w-10 h-10 text-white animate-bounce-gentle" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Welcome Back</h1>
              <p className="text-xl text-white/90 font-medium">Sign in to VibeCheck</p>
              <p className="text-sm text-white/70 mt-2">Where music meets the sunset of possibilities</p>
            </div>

            {/* Glassmorphism login card */}
            <Card className="bg-white/15 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      required
                      data-testid="input-login-username"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-transparent"
                      required
                      data-testid="input-login-password"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                    disabled={loginMutation.isPending}
                    data-testid="button-login-submit"
                  >
                    {loginMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing In...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              onClick={() => setShowLogin(false)}
              className="w-full mt-6 h-12 text-white/90 border border-white/30 hover:bg-white/10 rounded-xl font-medium transition-all duration-300"
              data-testid="button-back-to-landing"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Don't show landing page for logged-in users (handled by router)
  if (currentUser) {
    return null;
  }

  return (
    <div className="relative h-screen sunset-gradient flex flex-col items-center justify-center text-white p-6 overflow-hidden">
      {/* Sunset Sky Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 sunset-gradient animate-pulse-slow"></div>
        {/* Floating clouds/particles */}
        <div className="absolute top-20 left-8 w-24 h-14 bg-white/8 rounded-full blur-sm animate-bounce-gentle"></div>
        <div className="absolute top-40 right-12 w-18 h-9 bg-white/12 rounded-full blur-sm animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-60 left-1/4 w-14 h-7 bg-white/10 rounded-full blur-sm animate-bounce-gentle" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-8 w-20 h-12 bg-white/9 rounded-full blur-sm animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative z-10 text-center">
        <div className="mb-12">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Music className="w-12 h-12 text-white animate-bounce-gentle" />
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-300 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-4 w-5 h-5 bg-orange-400 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">VibeCheck</h1>
          <p className="text-2xl opacity-90 font-medium">Find love through music</p>
          <p className="text-sm opacity-75 mt-3">Where every sunset brings new connections</p>
        </div>

        <div className="space-y-6 w-full max-w-sm">
          <Button
            onClick={() => setShowSignup(true)}
            className="w-full h-14 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
          <Button
            onClick={() => setShowLogin(true)}
            variant="outline"
            className="w-full h-14 border-2 border-white/40 text-white font-semibold rounded-2xl backdrop-blur-sm bg-white/10 transition-all duration-300 transform hover:scale-105 hover:bg-white/20"
            data-testid="button-sign-in"
          >
            Sign In
          </Button>
        </div>

        <p className="text-sm opacity-75 mt-12 font-medium">Connect hearts through harmonies</p>
      </div>
    </div>
  );
}
