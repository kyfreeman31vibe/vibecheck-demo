import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Music, Search, Plus, X, Sparkles, Heart, Clock, TrendingUp, Loader2, Play } from "lucide-react";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  popularity: number;
  duration_ms: number;
  preview_url?: string;
}

interface SpotifySongSuggestionsProps {
  selectedSongs: string[];
  onSongSelect: (song: string) => void;
}

interface SpotifyTopTracksResponse {
  items: SpotifyTrack[];
}

export default function SpotifySongSuggestions({
  selectedSongs,
  onSongSelect,
}: SpotifySongSuggestionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customSong, setCustomSong] = useState("");

  // Check if Spotify is connected
  const { data: spotifyStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/spotify/status"],
    retry: false
  });

  // Get user's top tracks from Spotify
  const { data: topTracks, isLoading: topTracksLoading } = useQuery<SpotifyTopTracksResponse>({
    queryKey: ["/api/spotify/top-tracks"],
    enabled: spotifyStatus?.connected,
    retry: false,
    staleTime: 300000 // 5 minutes
  });

  // Get recently played tracks
  const { data: recentTracks, isLoading: recentLoading } = useQuery<any>({
    queryKey: ["/api/spotify/recently-played"],
    enabled: spotifyStatus?.connected,
    retry: false,
    staleTime: 300000 // 5 minutes
  });

  // Search Spotify for tracks
  const { data: searchResults, isLoading: searchLoading } = useQuery<any>({
    queryKey: ["/api/spotify/search-tracks", searchQuery],
    enabled: spotifyStatus?.connected && searchQuery.length > 2,
    retry: false,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/spotify/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`);
      return response.json();
    }
  });

  // Format track name for display
  const formatTrackName = (track: SpotifyTrack) => {
    return `${track.name} - ${track.artists[0]?.name}`;
  };

  // Extract unique tracks from recent plays
  const recentTracksList = recentTracks?.items?.reduce((acc: SpotifyTrack[], item: any) => {
    const track: SpotifyTrack = item.track;
    const trackName = formatTrackName(track);
    if (track && !acc.some((t: SpotifyTrack) => formatTrackName(t) === trackName) && !selectedSongs.includes(trackName)) {
      acc.push(track);
    }
    return acc;
  }, []) || [];

  // Filter top tracks that aren't already selected
  const availableTopTracks = topTracks?.items?.filter(
    track => {
      const trackName = formatTrackName(track);
      return !selectedSongs.includes(trackName);
    }
  ) || [];

  // Filter search results
  const availableSearchResults = searchResults?.tracks?.items?.filter(
    (track: SpotifyTrack) => {
      const trackName = formatTrackName(track);
      return !selectedSongs.includes(trackName);
    }
  ) || [];

  const addCustomSong = () => {
    if (customSong.trim() && !selectedSongs.includes(customSong.trim())) {
      onSongSelect(customSong.trim());
      setCustomSong("");
    }
  };

  if (!spotifyStatus?.connected) {
    return (
      <div className="space-y-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800">Connect Spotify for Song Suggestions</h3>
                <p className="text-sm text-orange-600">
                  Get personalized song recommendations from your listening history
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => window.open('/api/auth/spotify', 'spotify-auth', 'width=600,height=700')}
              >
                Connect Spotify
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fallback: Manual song input */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Add custom song (Song - Artist)..."
              value={customSong}
              onChange={(e) => setCustomSong(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addCustomSong();
                }
              }}
              className="pl-10"
              data-testid="input-custom-song"
            />
            {customSong && (
              <Button
                size="sm"
                onClick={addCustomSong}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
                data-testid="button-add-custom-song"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Selected Songs Display */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Your Songs:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSongs.map((song) => (
                <Badge key={song} className="bg-music-purple text-white flex items-center gap-1" data-testid={`badge-song-${song}`}>
                  {song}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-gray-200"
                    onClick={() => onSongSelect(song)}
                    data-testid={`button-remove-song-${song}`}
                  />
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Selected: {selectedSongs.length}/8
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Top Tracks */}
      {topTracksLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading your top tracks...</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ) : availableTopTracks.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Heart className="w-5 h-5" />
              <span>Your Top Tracks on Spotify</span>
              <Sparkles className="w-4 h-4" />
            </CardTitle>
            <p className="text-sm text-green-600">Your most played songs</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableTopTracks.slice(0, 6).map((track) => {
                const trackName = formatTrackName(track);
                return (
                  <div key={track.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      {track.album.images?.[2] && (
                        <img 
                          src={track.album.images[2].url} 
                          alt={track.album.name}
                          className="w-10 h-10 rounded"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{track.name}</p>
                        <p className="text-xs text-gray-500 truncate">{track.artists[0]?.name}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSongSelect(trackName)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      data-testid={`button-top-track-${trackName}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Played Tracks */}
      {recentLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading recent tracks...</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ) : recentTracksList.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Clock className="w-5 h-5" />
              <span>Recently Played</span>
            </CardTitle>
            <p className="text-sm text-blue-600">From your recent listening activity</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentTracksList.slice(0, 4).map((track: SpotifyTrack) => {
                const trackName = formatTrackName(track);
                return (
                  <Button
                    key={track.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onSongSelect(trackName)}
                    className="rounded-full bg-white border-blue-300 hover:bg-blue-100 hover:border-blue-400 text-blue-700 text-xs"
                    data-testid={`button-recent-track-${trackName}`}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {track.name.length > 20 ? `${track.name.substring(0, 20)}...` : track.name}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tracks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Songs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Spotify for songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-songs"
            />
          </div>

          {searchLoading && searchQuery.length > 2 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          {availableSearchResults.length > 0 && (
            <div className="space-y-2">
              {availableSearchResults.slice(0, 5).map((track: SpotifyTrack) => {
                const trackName = formatTrackName(track);
                return (
                  <div key={track.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {track.album.images?.[2] && (
                        <img 
                          src={track.album.images[2].url} 
                          alt={track.album.name}
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{track.name}</p>
                        <p className="text-xs text-gray-500 truncate">{track.artists[0]?.name}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSongSelect(trackName)}
                      className="hover:border-music-purple hover:text-music-purple"
                      variant="outline"
                      data-testid={`button-search-track-${trackName}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Manual input option */}
          <div className="pt-2 border-t">
            <div className="relative">
              <Input
                type="text"
                placeholder="Or add custom song (Song - Artist)..."
                value={customSong}
                onChange={(e) => setCustomSong(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addCustomSong();
                  }
                }}
                className="pr-20"
                data-testid="input-manual-song"
              />
              {customSong && (
                <Button
                  size="sm"
                  onClick={addCustomSong}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
                  data-testid="button-add-manual-song"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Songs Display */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Your Songs:</h3>
        <div className="flex flex-wrap gap-2">
          {selectedSongs.map((song) => (
            <Badge key={song} className="bg-music-purple text-white flex items-center gap-1" data-testid={`badge-selected-song-${song}`}>
              {song.length > 30 ? `${song.substring(0, 30)}...` : song}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-gray-200"
                onClick={() => onSongSelect(song)}
                data-testid={`button-remove-selected-song-${song}`}
              />
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Selected: {selectedSongs.length}/8
        </p>
      </div>
    </div>
  );
}