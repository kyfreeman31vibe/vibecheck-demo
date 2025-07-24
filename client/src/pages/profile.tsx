import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, User, Settings, Edit3, LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";

interface ProfileProps {
  currentUser: any;
  onLogout: () => void;
}

export default function Profile({ currentUser, onLogout }: ProfileProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      onLogout();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleEditProfile = () => {
    setLocation("/setup");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-music-purple" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-music-purple rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentUser?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">@{currentUser?.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.age} years old</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditProfile}>
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              {currentUser?.bio || "No bio added yet. Tell others about your music taste and what you're looking for!"}
            </p>
          </CardContent>
        </Card>

        {/* Music Preferences */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Music Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Favorite Genres</h4>
              <div className="flex flex-wrap gap-2">
                {currentUser?.favoriteGenres?.length > 0 ? (
                  currentUser.favoriteGenres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-music-purple/10 text-music-purple rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No genres selected</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Favorite Artists</h4>
              <div className="flex flex-wrap gap-2">
                {currentUser?.favoriteArtists?.length > 0 ? (
                  currentUser.favoriteArtists.slice(0, 5).map((artist: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {artist}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No artists selected</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleEditProfile}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleEditProfile}>
              <Music className="w-4 h-4 mr-2" />
              Music Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setLocation("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}