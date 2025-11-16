import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { 
  UserPlus, 
  Heart, 
  Music, 
  Share2,
  ArrowLeft,
  MapPin,
  Disc3,
  Sparkles,
  Users,
  MessageCircle
} from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";

export default function PublicProfile() {
  const [, params] = useRoute("/u/:username");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const { data: profileUser, isLoading } = useQuery({
    queryKey: ["/api/users/username", params?.username],
    queryFn: async () => {
      const response = await fetch(`/api/users/username/${params?.username}`);
      if (!response.ok) throw new Error("User not found");
      return response.json();
    },
    enabled: !!params?.username,
  });

  const { data: userConnections } = useQuery({
    queryKey: ["/api/social/connections", currentUser?.id],
    queryFn: async () => {
      const response = await fetch(`/api/social/connections/${currentUser.id}`);
      if (!response.ok) throw new Error("Failed to fetch connections");
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  const isAlreadyConnected = userConnections?.some(
    (conn: any) => 
      (conn.status === "accepted") && 
      (conn.requesterId === profileUser?.id || conn.receiverId === profileUser?.id)
  );

  const hasPendingRequest = userConnections?.some(
    (conn: any) => 
      (conn.status === "pending") && 
      (conn.requesterId === currentUser?.id && conn.receiverId === profileUser?.id)
  );

  const connectMutation = useMutation({
    mutationFn: async (data: { receiverId: number; connectionType: string }) => {
      const response = await apiRequest("POST", "/api/social/connect", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections", currentUser?.id] });
      toast({
        title: "Connection Request Sent!",
        description: "You'll be notified when they respond",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    },
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/u/${params?.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser?.name}'s VibeCheck Profile`,
          text: `Check out ${profileUser?.name} on VibeCheck!`,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Profile link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen tech-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 tech-gradient rounded-full animate-pulse border border-purple-400/50"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen tech-gradient-soft flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-gray-300 mb-4">This profile doesn't exist</p>
          <Button
            onClick={() => setLocation("/")}
            className="tech-gradient text-white border border-purple-400/50"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser?.id;

  return (
    <div className="min-h-screen tech-gradient-soft pb-20">
      {/* Header */}
      <div className="bg-gray-900/30 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white/10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">@{profileUser.username}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-white hover:bg-white/10"
            data-testid="button-share-profile"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
                {profileUser.profilePicture ? (
                  <img
                    src={profileUser.profilePicture}
                    alt={profileUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profileUser.name?.[0] || "?"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1" data-testid="text-profile-name">
                  {profileUser.name}
                </h2>
                <p className="text-gray-300 text-sm mb-2">@{profileUser.username}</p>
                {profileUser.location && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profileUser.location}
                  </div>
                )}
              </div>
            </div>

            {profileUser.bio && (
              <p className="mt-4 text-gray-300" data-testid="text-profile-bio">
                {profileUser.bio}
              </p>
            )}

            {/* Action Buttons */}
            {!isOwnProfile && currentUser && (
              <div className="mt-4 flex gap-2">
                {isAlreadyConnected ? (
                  <Button
                    className="flex-1 tech-gradient text-white border border-purple-400/50"
                    onClick={() => setLocation(`/chat/${profileUser.id}`)}
                    data-testid="button-message"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                ) : (
                  <Button
                    className="flex-1 tech-gradient text-white border border-purple-400/50"
                    onClick={() => connectMutation.mutate({ 
                      receiverId: profileUser.id, 
                      connectionType: "friend" 
                    })}
                    disabled={hasPendingRequest || connectMutation.isPending}
                    data-testid="button-connect"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {hasPendingRequest ? "Request Sent" : "Connect"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="bg-white/5 border-purple-500/30 text-white hover:bg-white/10"
                  onClick={() => setLocation(`/discover`)}
                  data-testid="button-view-dating"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isOwnProfile && (
              <Button
                className="w-full mt-4 tech-gradient text-white border border-purple-400/50"
                onClick={() => setLocation("/profile")}
                data-testid="button-edit-profile"
              >
                Edit Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Music Personality */}
        {profileUser.personalityType && (
          <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                Music Personality
              </h3>
              <Badge className="tech-gradient text-white border border-purple-400/50 text-sm px-3 py-1" data-testid="badge-personality">
                {profileUser.personalityType}
              </Badge>
              {profileUser.personalityTraits && profileUser.personalityTraits.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {profileUser.personalityTraits.map((trait: string, idx: number) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-white/5 border-purple-500/30 text-gray-300"
                      data-testid={`badge-trait-${idx}`}
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Favorite Genres */}
        {profileUser.favoriteGenres && profileUser.favoriteGenres.length > 0 && (
          <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                <Music className="w-5 h-5 mr-2 text-purple-400" />
                Favorite Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileUser.favoriteGenres.map((genre: string, idx: number) => (
                  <Badge
                    key={idx}
                    className="tech-gradient text-white border border-purple-400/50"
                    data-testid={`badge-genre-${idx}`}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Favorite Artists */}
        {profileUser.favoriteArtists && profileUser.favoriteArtists.length > 0 && (
          <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Favorite Artists
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileUser.favoriteArtists.slice(0, 10).map((artist: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-white/5 border-purple-500/30 text-gray-300"
                    data-testid={`badge-artist-${idx}`}
                  >
                    {artist}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Tracks */}
        {profileUser.favoriteSongs && profileUser.favoriteSongs.length > 0 && (
          <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                <Disc3 className="w-5 h-5 mr-2 text-purple-400" />
                Top Tracks
              </h3>
              <div className="space-y-2">
                {profileUser.favoriteSongs.slice(0, 5).map((song: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 p-2 rounded-lg bg-white/5 border border-purple-500/20"
                    data-testid={`track-${idx}`}
                  >
                    <div className="w-8 h-8 tech-gradient rounded flex items-center justify-center border border-purple-400/50">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm">{song}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {currentUser && <BottomNavigation currentUser={currentUser} />}
    </div>
  );
}
