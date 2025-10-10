import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, TrendingUp, Clock, Disc3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeFeedProps {
  currentUser: any;
}

export default function HomeFeed({ currentUser }: HomeFeedProps) {
  // Fetch Spotify recent activity
  const { data: recentTracks } = useQuery({
    queryKey: ["/api/spotify/recently-played"],
    enabled: !!currentUser,
    retry: false,
  });

  // Fetch Spotify top artists
  const { data: topArtists } = useQuery({
    queryKey: ["/api/spotify/top-artists"],
    enabled: !!currentUser,
    retry: false,
  });

  // Fetch Genius trending songs
  const { data: trendingData } = useQuery({
    queryKey: ["/api/genius/trending"],
    enabled: !!currentUser,
  });

  const trendingSongs = (trendingData as any)?.trending || [];
  const recentlyPlayed = (recentTracks as any)?.items?.slice(0, 5) || [];
  const topArtistsList = (topArtists as any)?.items?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
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

      {/* No Activity State */}
      {recentlyPlayed.length === 0 && topArtistsList.length === 0 && trendingSongs.length === 0 && (
        <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
          <CardContent className="p-8 text-center">
            <Music className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <h3 className="text-lg font-medium text-white mb-2">
              Connect Your Music
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Link Spotify to see your listening activity and trending songs
            </p>
            <Button
              className="tech-gradient text-white border border-purple-400/50"
              onClick={() => window.open('/api/auth/spotify', 'spotify-auth', 'width=500,height=600')}
              data-testid="button-connect-spotify"
            >
              Connect Spotify
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
