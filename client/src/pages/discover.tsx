import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, MessageCircle, X, Heart, Star, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProfileCard from "@/components/profile-card";
import BottomNavigation from "@/components/bottom-navigation";
import type { User as UserType } from "@shared/schema";

interface DiscoverProps {
  currentUser: any;
}

export default function Discover({ currentUser }: DiscoverProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  const { data: users = [], isLoading, refetch } = useQuery<UserType[]>({
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
      <div className="h-screen tech-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 tech-gradient rounded-full animate-pulse border border-purple-400/50"></div>
          <p className="text-gray-300">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  const currentProfile = users[currentUserIndex];

  if (!currentProfile) {
    return (
      <div className="h-screen tech-gradient-soft flex flex-col">
        {/* Header with navigation */}
        <div className="flex items-center justify-between p-4 bg-gray-900/30 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg border-b border-purple-500/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/setup")}
            className="rounded-full bg-gray-800/40 border border-purple-500/30 text-gray-300 hover:bg-gray-800/60"
            title="Update Profile"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            VibeCheck
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/messages")}
            className="rounded-full bg-gray-800/40 border border-purple-500/30 text-gray-300 hover:bg-gray-800/60 relative"
            title="View Messages"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 tech-gradient rounded-full flex items-center justify-center border border-purple-400/50 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No more profiles!</h2>
            <p className="text-gray-300 mb-4">You've seen everyone available. Check back later for new matches!</p>
            <div className="space-y-3">
              <Button onClick={() => refetch()} className="tech-gradient hover:opacity-90 text-white w-full border border-purple-400/50">
                Refresh for New Users
              </Button>
              <Button 
                onClick={() => setLocation("/matches")} 
                variant="outline" 
                className="w-full bg-gray-800/40 border-purple-500/30 text-gray-300 hover:bg-gray-800/60"
              >
                View Your Matches
              </Button>
            </div>
          </div>
        </div>
        
        <BottomNavigation currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div className="relative h-screen tech-gradient-soft pb-20">
      {/* Header */}
      <div className="flex items-center justify-center p-4 bg-gray-900/30 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg border-b border-purple-500/30">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          VibeCheck
        </h1>
      </div>

      {/* Card Stack Area */}
      <div className="relative px-4 pt-8 pb-24 h-full">
        {/* Background Cards */}
        <div className="absolute inset-x-4 top-12 bottom-28">
          <div className="absolute inset-0 bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-lg transform rotate-2 scale-95"></div>
          <div className="absolute inset-0 bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-lg transform -rotate-1 scale-97"></div>
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
          className="w-14 h-14 rounded-full shadow-lg bg-gray-800/40 border-2 border-red-500/50 hover:border-red-400 hover:bg-red-900/20 text-red-400"
        >
          <X className="h-6 w-6" />
        </Button>
        <Button
          onClick={() => handleSwipe("super")}
          disabled={swipeMutation.isPending}
          size="lg"
          variant="outline"
          className="w-12 h-12 rounded-full shadow-lg bg-gray-800/40 border-2 border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-900/20 text-cyan-400"
        >
          <Star className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => handleSwipe("right")}
          disabled={swipeMutation.isPending}
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full shadow-lg bg-gray-800/40 border-2 border-lime-500/50 hover:border-lime-400 hover:bg-lime-900/20 text-lime-400"
        >
          <Heart className="h-6 w-6" />
        </Button>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}
