import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, MessageCircle, X, Heart, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProfileCard from "@/components/profile-card";

export default function Discover() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
  }, []);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/discover", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const swipeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/swipe", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.matched) {
        setLocation(`/match/${result.matchId}`);
      } else {
        // Move to next profile
        if (currentUserIndex < users.length - 1) {
          setCurrentUserIndex(prev => prev + 1);
        } else {
          // Refetch more users
          refetch();
          setCurrentUserIndex(0);
        }
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (direction: "left" | "right" | "super") => {
    if (!currentUser || !users[currentUserIndex]) return;

    swipeMutation.mutate({
      swiperId: currentUser.id,
      targetId: users[currentUserIndex].id,
      direction,
    });
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 music-gradient rounded-full animate-pulse"></div>
          <p className="text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  const currentProfile = users[currentUserIndex];

  if (!currentProfile) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 music-gradient rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No more profiles!</h2>
          <p className="text-gray-600 mb-4">Check back later for new matches</p>
          <Button onClick={() => refetch()} className="music-gradient-purple-pink text-white">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/matches")}
          className="rounded-full bg-gray-200"
        >
          <User className="h-5 w-5 text-gray-600" />
        </Button>
        <h1 className="text-xl font-bold music-gradient bg-clip-text text-transparent">
          VibeCheck
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/matches")}
          className="rounded-full bg-gray-200 relative"
        >
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-music-pink text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>
      </div>

      {/* Card Stack Area */}
      <div className="relative px-4 pt-8 pb-24 h-full">
        {/* Background Cards */}
        <div className="absolute inset-x-4 top-12 bottom-28">
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg transform rotate-2 scale-95"></div>
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg transform -rotate-1 scale-97"></div>
        </div>

        {/* Main Profile Card */}
        <ProfileCard user={currentProfile} />
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
        <Button
          onClick={() => handleSwipe("left")}
          disabled={swipeMutation.isPending}
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full shadow-lg border-2 border-gray-200 hover:border-red-300 hover:bg-red-50"
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>
        <Button
          onClick={() => handleSwipe("super")}
          disabled={swipeMutation.isPending}
          size="lg"
          variant="outline"
          className="w-12 h-12 rounded-full shadow-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
        >
          <Star className="h-4 w-4 text-blue-500" />
        </Button>
        <Button
          onClick={() => handleSwipe("right")}
          disabled={swipeMutation.isPending}
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full shadow-lg border-2 border-green-200 hover:border-green-400 hover:bg-green-50"
        >
          <Heart className="h-6 w-6 text-green-500" />
        </Button>
      </div>
    </div>
  );
}
