import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MusicProfileBuilder from "@/components/music-profile-builder";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);

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
      bio: profileData.bio
    });
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-bold text-gray-800">Setup Your Profile</h2>
        <div className="w-6"></div>
      </div>

      <MusicProfileBuilder
        onComplete={handleProfileComplete}
        isLoading={updateProfileMutation.isPending}
      />
    </div>
  );
}
