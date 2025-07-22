import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MusicProfileBuilder from "@/components/music-profile-builder";
import type { User } from "@shared/schema";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/users/${currentUser.id}`, data);
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast({
        title: "Success",
        description: "Music profile created successfully!",
      });
      setLocation("/discover");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const handleProfileComplete = (profileData: any) => {
    updateProfileMutation.mutate({
      favoriteGenres: profileData.favoriteGenres,
      favoriteArtists: profileData.favoriteArtists,
      favoriteSongs: profileData.favoriteSongs,
      topDefiningTracks: profileData.topDefiningTracks,
      personalityType: profileData.personalityType,
      personalityTraits: profileData.personalityTraits,
      bio: profileData.bio
    });
  };

  // Prepare initial data from current user for editing
  const initialProfileData = currentUser ? {
    favoriteGenres: currentUser.favoriteGenres || [],
    favoriteArtists: currentUser.favoriteArtists || [],
    favoriteSongs: currentUser.favoriteSongs || [],
    topDefiningTracks: currentUser.topDefiningTracks || [],
    personalityType: currentUser.personalityType || "",
    personalityTraits: currentUser.personalityTraits || [],
    bio: currentUser.bio || ""
  } : undefined;

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/discover")}
          title="Back to Discover"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-bold text-gray-800">Setup Your Profile</h2>
        <div className="w-6"></div>
      </div>

      <MusicProfileBuilder
        onComplete={handleProfileComplete}
        isLoading={updateProfileMutation.isPending}
        initialData={initialProfileData}
      />
    </div>
  );
}
