import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, TrendingUp, Clock, Disc3, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface HomeFeedProps {
  currentUser: any;
}

export default function HomeFeed({ currentUser }: HomeFeedProps) {
  const { toast } = useToast();

  // Check Spotify connection status
  const { data: spotifyStatus, isLoading: statusLoading, refetch: refetchSpotifyStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/spotify/status"],
    enabled: !!currentUser,
    retry: false,
  });

  const spotifyConnected = spotifyStatus?.connected || false;

  // Fetch Spotify recent activity
  const { data: recentTracks, isLoading: loadingRecent, refetch: refetchRecent } = useQuery({
    queryKey: ["/api/spotify/recently-played"],
    enabled: !!currentUser && spotifyConnected,
    retry: false,
  });

  // Fetch Spotify top artists
  const { data: topArtists, isLoading: loadingArtists, refetch: refetchArtists } = useQuery({
    queryKey: ["/api/spotify/top-artists"],
    enabled: !!currentUser && spotifyConnected,
    retry: false,
  });

  // Fetch Genius trending songs
  const { data: trendingData } = useQuery({
    queryKey: ["/api/genius/trending"],
    enabled: !!currentUser,
  });

  // Listen for Spotify auth popup messages with origin validation
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate message origin (must be from same origin as our app)
      const trustedOrigin = window.location.origin;
      if (event.origin !== trustedOrigin) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data === 'spotify-auth-success') {
        toast({
          title: "Spotify Connected!",
          description: "Your music activity is now syncing.",
        });
        // Refresh all Spotify data
        refetchSpotifyStatus();
        setTimeout(() => {
          refetchRecent();
          refetchArtists();
        }, 500);
      } else if (event.data === 'spotify-auth-error') {
        toast({
          title: "Connection Failed",
          description: "Unable to connect to Spotify. Please try again.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast, refetchSpotifyStatus, refetchRecent, refetchArtists]);

  const trendingSongs = (trendingData as any)?.trending || [];
  const recentlyPlayed = (recentTracks as any)?.items?.slice(0, 5) || [];
  const topArtistsList = (topArtists as any)?.items?.slice(0, 5) || [];

  const connectSpotify = () => {
    const authWindow = window.open('/api/auth/spotify', 'spotify-auth', 'width=500,height=600');
    
    if (!authWindow || authWindow.closed || typeof authWindow.closed == 'undefined') {
      window.location.href = "/api/auth/spotify";
    }
  };

  return (
    <div className="space-y-6">
      {/* Spotify Connection Status Banner - only show when status is loaded and not connected */}
      {!statusLoading && !spotifyConnected && (
        <Card className="bg-gradient-to-r from-green-500/20 to-purple-500/20 backdrop-blur-xl border border-green-400/30 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Music className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Connect Spotify for personalized music activity
                  </p>
                  <p className="text-xs text-gray-400">
                    See your listening history and top artists
                  </p>
                </div>
              </div>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white border-0"
                onClick={connectSpotify}
                data-testid="button-connect-spotify-banner"
              >
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {spotifyConnected && (loadingRecent || loadingArtists) && (
        <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-purple-400 animate-spin" />
            <p className="text-sm text-gray-400">Loading your music activity...</p>
          </CardContent>
        </Card>
      )}

      {/* Your Recent Activity */}
      {recentlyPlayed.length > 0 && (
        <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-cyan-400" />
              Your Recent Listens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentlyPlayed.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                data-testid={`recent-track-${idx}`}
              >
                {item.track.album?.images?.[0]?.url && (
                  <img
                    src={item.track.album.images[0].url}
                    alt={item.track.name}
                    className="w-12 h-12 rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.track.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {item.track.artists?.[0]?.name}
                  </p>
                </div>
                <Music className="w-4 h-4 text-gray-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Your Top Artists */}
      {topArtistsList.length > 0 && (
        <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <Disc3 className="w-5 h-5 mr-2 text-purple-400" />
              Your Top Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topArtistsList.map((artist: any, idx: number) => (
                <Badge
                  key={idx}
                  className="tech-gradient text-white border border-purple-400/50 text-sm px-3 py-1"
                  data-testid={`top-artist-${idx}`}
                >
                  {artist.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Songs */}
      {trendingSongs.length > 0 && (
        <Card className="bg-gray-800/40 backdrop-blur-xl border border-orange-500/30 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
              Trending in Music
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingSongs.map((song: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                data-testid={`trending-song-${idx}`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {song.imageUrl && (
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                  </div>
                </div>
                {song.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(song.url, '_blank')}
                    className="text-gray-400 hover:text-white shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
