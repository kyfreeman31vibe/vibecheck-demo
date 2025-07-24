import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Music, LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MusicProfileBuilder from "@/components/music-profile-builder";
import BottomNavigation from "@/components/bottom-navigation";
import { ThemeToggle } from "@/components/theme-toggle";
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
      const response = await apiRequest("PUT", `/api/users/${currentUser?.id}`, data);
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      localStorage.removeItem("currentUser");
      toast({
        title: "Signed out",
        description: "You have been successfully signed out"
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  });

  const handleProfileComplete = (profileData: any) => {
    updateProfileMutation.mutate({
      favoriteGenres: profileData.favoriteGenres,
      favoriteArtists: profileData.favoriteArtists,
      favoriteSongs: profileData.favoriteSongs,
      topDefiningTracks: profileData.topDefiningTracks,
      personalityType: profileData.personalityType,
      personalityTraits: profileData.personalityTraits,
      bio: profileData.bio,
      profilePhotos: profileData.profilePhotos || [],
      profilePicture: (profileData.profilePhotos && profileData.profilePhotos.length > 0) ? profileData.profilePhotos[0] : null
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
    bio: currentUser.bio || "",
    profilePhotos: currentUser.profilePhotos || []
  } : undefined;

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/discover")}
          title="Back to Discover"
          className="text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
          {initialProfileData && initialProfileData.favoriteGenres.length > 0 ? "Edit Profile" : "Setup Your Profile"}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/integrations")}
            className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-600 dark:hover:bg-purple-900/20"
          >
            <Music className="w-4 h-4 mr-1" />
            Connect Music
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            title="Sign Out"
            className="text-gray-600 dark:text-gray-300"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <MusicProfileBuilder
        onComplete={handleProfileComplete}
        isLoading={updateProfileMutation.isPending}
        initialData={initialProfileData}
      />

      <BottomNavigation />
    </div>
  );
}
