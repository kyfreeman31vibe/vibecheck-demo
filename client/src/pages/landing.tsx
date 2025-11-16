import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Music, Heart, MessageCircle, User, Settings, Zap, TrendingUp, Calendar, BarChart3, Users } from "lucide-react";
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
    email: "",
    age: "",
    connectionInterests: [] as string[],
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

  const toggleConnectionInterest = (interest: string) => {
    setSignupData(prev => ({
      ...prev,
      connectionInterests: prev.connectionInterests.includes(interest)
        ? prev.connectionInterests.filter(i => i !== interest)
        : [...prev.connectionInterests, interest]
    }));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate({
      ...signupData,
      age: parseInt(signupData.age),
      favoriteGenres: [],
      favoriteArtists: [],
      favoriteSongs: [],
      email: signupData.email,
      connectionInterests: signupData.connectionInterests,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  if (showSignup) {
    return (
      <div className="min-h-screen tech-gradient relative overflow-hidden">
        {/* Tech Grid Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(270, 95%, 65%, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(195, 100%, 75%, 0.3) 0%, transparent 50%)`
          }} />
          {/* Tech orb effects */}
          <div className="absolute top-16 right-12 w-18 h-10 bg-purple-500/10 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute top-28 left-16 w-14 h-7 bg-cyan-500/15 rounded-full blur-lg animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-36 right-1/3 w-10 h-5 bg-purple-500/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-28 left-12 w-22 h-9 bg-cyan-500/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '2.5s'}}></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Tech-themed header */}
            <div className="text-center mb-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto tech-gradient rounded-full flex items-center justify-center shadow-2xl border border-purple-400/50">
                  <Music className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">Join VibeCheck</h1>
              <p className="text-xl text-gray-300 font-medium">Create your music profile</p>
              <p className="text-sm text-gray-400 mt-2">Where technology meets musical connections</p>
            </div>

            {/* Tech-themed signup card */}
            <Card className="bg-gray-800/30 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className="bg-gray-700/40 border-purple-500/30 text-white placeholder:text-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
                      required
                      data-testid="input-signup-name"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="bg-gray-700/40 border-purple-500/30 text-white placeholder:text-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
                      required
                      data-testid="input-signup-email"
                    />
                    <Input
                      type="text"
                      placeholder="Username"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="bg-gray-700/40 border-purple-500/30 text-white placeholder:text-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
                      required
                      data-testid="input-signup-username"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="bg-gray-700/40 border-purple-500/30 text-white placeholder:text-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
                      required
                      data-testid="input-signup-password"
                    />
                    <Input
                      type="number"
                      placeholder="Age"
                      value={signupData.age}
                      onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                      className="bg-gray-700/40 border-purple-500/30 text-white placeholder:text-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
                      required
                      data-testid="input-signup-age"
                    />
                  </div>

                  {/* Connection Interests Selection */}
                  <div className="space-y-3 bg-gray-700/20 border border-purple-500/20 rounded-xl p-4">
                    <Label className="text-gray-200 font-medium">I'm interested in:</Label>
                    <p className="text-xs text-gray-400">Select what you're looking for (you can choose both)</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/30 border border-blue-500/30 hover:bg-gray-700/50 transition-colors">
                        <Checkbox
                          id="friends"
                          checked={signupData.connectionInterests.includes("friends")}
                          onCheckedChange={() => toggleConnectionInterest("friends")}
                          className="border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          data-testid="checkbox-interest-friends"
                        />
                        <Label htmlFor="friends" className="flex items-center gap-2 text-gray-200 cursor-pointer flex-1">
                          <Users className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="font-medium">Friends & Connections</div>
                            <div className="text-xs text-gray-400">Meet music lovers for friendship</div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/30 border border-pink-500/30 hover:bg-gray-700/50 transition-colors">
                        <Checkbox
                          id="dating"
                          checked={signupData.connectionInterests.includes("dating")}
                          onCheckedChange={() => toggleConnectionInterest("dating")}
                          className="border-pink-400 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                          data-testid="checkbox-interest-dating"
                        />
                        <Label htmlFor="dating" className="flex items-center gap-2 text-gray-200 cursor-pointer flex-1">
                          <Heart className="w-4 h-4 text-pink-400" />
                          <div>
                            <div className="font-medium">Dating & Romance</div>
                            <div className="text-xs text-gray-400">Find romantic connections through music</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 tech-gradient hover:opacity-90 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border border-purple-400/50"
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
              className="w-full mt-6 h-12 text-gray-300 border border-purple-500/30 hover:bg-purple-500/20 rounded-xl font-medium transition-all duration-300"
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
      <div className="min-h-screen tech-gradient relative overflow-hidden">
        {/* Tech Grid Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(270, 95%, 65%, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(195, 100%, 75%, 0.3) 0%, transparent 50%)`
          }} />
          {/* Tech orb effects */}
          <div className="absolute top-20 left-10 w-20 h-12 bg-purple-500/10 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-8 bg-cyan-500/15 rounded-full blur-lg animate-pulse"></div>
          <div className="absolute top-40 left-1/3 w-12 h-6 bg-purple-500/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 right-10 w-24 h-10 bg-cyan-500/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Tech-themed header */}
            <div className="text-center mb-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto tech-gradient rounded-full flex items-center justify-center shadow-2xl border border-purple-400/50">
                  <Music className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">Welcome Back</h1>
              <p className="text-xl text-gray-300 font-medium">Sign in to VibeCheck</p>
              <p className="text-sm text-gray-400 mt-2">Where technology meets musical connections</p>
            </div>

            {/* Tech-themed login card */}
            <Card className="bg-gray-800/30 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
              <CardContent className="p-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      className="bg-gray-700/40 border-purple-500/30 text-white placeholder:text-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
                      required
                      data-testid="input-login-username"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="bg-gray-700/40 border-purple-500/30 text-white placeholder:text-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
                      required
                      data-testid="input-login-password"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-12 tech-gradient hover:opacity-90 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 border border-purple-400/50"
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
    <div className="relative h-screen tech-gradient flex flex-col items-center justify-center text-white p-6 overflow-hidden">
      {/* Tech Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(270, 95%, 65%, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(195, 100%, 75%, 0.3) 0%, transparent 50%)`
        }} />
        {/* Tech orb effects */}
        <div className="absolute top-20 left-8 w-24 h-14 bg-purple-500/10 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute top-40 right-12 w-18 h-9 bg-cyan-500/15 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-60 left-1/4 w-14 h-7 bg-purple-500/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-8 w-20 h-12 bg-cyan-500/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative z-10 text-center">
        <div className="mb-12">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto tech-gradient rounded-full flex items-center justify-center shadow-2xl border border-purple-400/50">
              <Music className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-4 w-5 h-5 bg-purple-400 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">VibeCheck</h1>
          <p className="text-2xl text-gray-300 font-medium">Your Music Social Network</p>
          <p className="text-sm text-gray-400 mt-3">Connect, share, and vibe with music lovers • Dating, friendships & more</p>
        </div>

        <div className="space-y-6 w-full max-w-sm">
          <Button
            onClick={() => setShowSignup(true)}
            className="w-full h-14 tech-gradient hover:opacity-90 text-white font-semibold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 border border-purple-400/50"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
          <Button
            onClick={() => setShowLogin(true)}
            variant="outline"
            className="w-full h-14 border-2 border-cyan-400/60 text-cyan-300 font-semibold rounded-2xl backdrop-blur-sm bg-cyan-500/10 transition-all duration-300 transform hover:scale-105 hover:bg-cyan-500/20"
            data-testid="button-sign-in"
          >
            Sign In
          </Button>
        </div>

        <p className="text-sm text-gray-400 mt-12 font-medium">Connect minds through music technology</p>
      </div>
    </div>
  );
}
