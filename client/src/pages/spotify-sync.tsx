import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Music, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import BottomNavigation from "@/components/bottom-navigation";

export default function SpotifySync() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [includeTopArtists, setIncludeTopArtists] = useState(true);
  const [includeTopTracks, setIncludeTopTracks] = useState(true);

  const syncMutation = useMutation({
    mutationFn: async () => {
      const items: any[] = [];

      if (includeTopArtists) {
        items.push({
          itemType: "top_artist",
          spotifyId: "mock-artist-1",
          name: "The Weeknd",
          imageUrl: "https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb",
          metadata: { genre: "R&B" },
        });
        items.push({
          itemType: "top_artist",
          spotifyId: "mock-artist-2",
          name: "Billie Eilish",
          imageUrl: "https://i.scdn.co/image/ab6761610000e5ebb2e846e1c83b0c4f97e7623e",
          metadata: { genre: "Pop" },
        });
      }

      if (includeTopTracks) {
        items.push({
          itemType: "top_track",
          spotifyId: "mock-track-1",
          name: "Blinding Lights",
          imageUrl: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
          metadata: { artist: "The Weeknd", album: "After Hours" },
        });
        items.push({
          itemType: "top_track",
          spotifyId: "mock-track-2",
          name: "bad guy",
          imageUrl: "https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e",
          metadata: { artist: "Billie Eilish", album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?" },
        });
      }

      const response = await apiRequest("POST", "/api/spotify/sync", { items });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spotify/items"] });
      toast({
        title: "Success!",
        description: "Your Spotify music has been added to your profile",
      });
      setLocation("/profile");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync Spotify data",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 shadow-2xl min-h-screen pb-20">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/profile")}
              className="text-white hover:bg-white/20"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Share Your Spotify Music</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <Music className="w-5 h-5" />
                What to Share
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Choose what you'd like to display on your profile. Others can comment on your music taste!
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <Checkbox
                    id="topArtists"
                    checked={includeTopArtists}
                    onCheckedChange={(checked) => setIncludeTopArtists(!!checked)}
                    data-testid="checkbox-top-artists"
                  />
                  <Label htmlFor="topArtists" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900 dark:text-white">Top Artists</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Your most-played artists</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <Checkbox
                    id="topTracks"
                    checked={includeTopTracks}
                    onCheckedChange={(checked) => setIncludeTopTracks(!!checked)}
                    data-testid="checkbox-top-tracks"
                  />
                  <Label htmlFor="topTracks" className="flex-1 cursor-pointer">
                    <div className="font-medium text-gray-900 dark:text-white">Top Tracks</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Your favorite songs</div>
                  </Label>
                </div>
              </div>

              <Button
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending || (!includeTopArtists && !includeTopTracks)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                data-testid="button-sync"
              >
                {syncMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding to Profile...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4 mr-2" />
                    Add to Profile
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                This demo uses sample Spotify data. Connect real Spotify on the Integrations page.
              </p>
            </CardContent>
          </Card>
        </div>

        {currentUser && <BottomNavigation currentUser={currentUser} />}
      </div>
    </div>
  );
}
