import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, User, Settings, Edit3, LogOut, MapPin, Heart, Brain, Users, Volume2, Compass, Zap, Star } from "lucide-react";
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

  // Get personality icon based on type
  const getPersonalityIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'social_butterfly': <Users className="w-5 h-5" />,
      'audiophile': <Volume2 className="w-5 h-5" />,
      'explorer': <Compass className="w-5 h-5" />,
      'emotional': <Heart className="w-5 h-5" />,
      'scholar': <Brain className="w-5 h-5" />,
      'trendsetter': <Zap className="w-5 h-5" />,
      'loyalist': <Star className="w-5 h-5" />,
      'curator': <Music className="w-5 h-5" />
    };
    return icons[type] || <Music className="w-5 h-5" />;
  };

  // Get personality color based on type
  const getPersonalityColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'social_butterfly': 'bg-pink-500',
      'audiophile': 'bg-purple-500',
      'explorer': 'bg-blue-500',
      'emotional': 'bg-red-500',
      'scholar': 'bg-indigo-500',
      'trendsetter': 'bg-yellow-500',
      'loyalist': 'bg-green-500',
      'curator': 'bg-teal-500'
    };
    return colors[type] || 'bg-music-purple';
  };

  return (
    <div className="min-h-screen sunset-gradient-soft pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-music-purple" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">How others see you</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProfile}
              className="text-music-purple border-music-purple hover:bg-music-purple hover:text-white"
              data-testid="button-edit-profile"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/settings")}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dating Profile Card - How others see you */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Main Profile Card */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          {/* Photo Section */}
          <div className="relative">
            {currentUser?.profilePhotos && currentUser.profilePhotos.length > 0 ? (
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img 
                  src={currentUser.profilePhotos[0]} 
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  data-testid="img-profile-photo"
                  onError={(e) => {
                    console.error('Profile photo failed to load in profile page');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="aspect-[4/5] w-full bg-gradient-to-br from-music-purple to-music-purple/60 flex items-center justify-center">
                <User className="w-24 h-24 text-white opacity-50" />
              </div>
            )}
            
            {/* Music Personality Badge */}
            {currentUser?.personalityType && (
              <div className={`absolute top-4 right-4 ${getPersonalityColor(currentUser.personalityType)} text-white px-3 py-2 rounded-full flex items-center space-x-2 shadow-lg`}>
                {getPersonalityIcon(currentUser.personalityType)}
                <span className="text-sm font-medium">
                  {currentUser.personalityType === 'social_butterfly' ? 'Social Butterfly' :
                   currentUser.personalityType === 'audiophile' ? 'Audiophile' :
                   currentUser.personalityType === 'explorer' ? 'Musical Explorer' :
                   currentUser.personalityType === 'emotional' ? 'Emotional Connector' :
                   currentUser.personalityType === 'scholar' ? 'Music Scholar' :
                   currentUser.personalityType === 'trendsetter' ? 'Trendsetter' :
                   currentUser.personalityType === 'loyalist' ? 'Loyal Fan' :
                   currentUser.personalityType === 'curator' ? 'Playlist Curator' :
                   'Music Lover'}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <CardContent className="p-6 space-y-4">
            {/* Name and Age */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-profile-name">
                {currentUser?.name}, {currentUser?.age}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">@{currentUser?.username}</p>
            </div>

            {/* Bio */}
            {currentUser?.bio && (
              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed" data-testid="text-profile-bio">
                  {currentUser.bio}
                </p>
              </div>
            )}

            {/* Personality Traits */}
            {currentUser?.personalityTraits && currentUser.personalityTraits.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Music Personality</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.personalityTraits.map((trait: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs" data-testid={`badge-trait-${index}`}>
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Genres */}
            {currentUser?.favoriteGenres && currentUser.favoriteGenres.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Music Vibes</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.favoriteGenres.slice(0, 6).map((genre: string, index: number) => (
                    <Badge 
                      key={index} 
                      className="bg-music-purple/10 text-music-purple hover:bg-music-purple/20 text-xs"
                      data-testid={`badge-genre-${index}`}
                    >
                      {genre}
                    </Badge>
                  ))}
                  {currentUser.favoriteGenres.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{currentUser.favoriteGenres.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Top Artists */}
            {currentUser?.favoriteArtists && currentUser.favoriteArtists.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Top Artists</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.favoriteArtists.slice(0, 4).map((artist: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs"
                      data-testid={`badge-artist-${index}`}
                    >
                      {artist}
                    </Badge>
                  ))}
                  {currentUser.favoriteArtists.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{currentUser.favoriteArtists.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Defining Tracks */}
            {currentUser?.topDefiningTracks && currentUser.topDefiningTracks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Defining Tracks</h4>
                <div className="space-y-2">
                  {currentUser.topDefiningTracks.slice(0, 3).map((track: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3" data-testid={`track-${index}`}>
                      <div className="w-2 h-2 bg-music-purple rounded-full"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{track}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center space-x-2"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}