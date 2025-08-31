import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Music, Search, Plus, X, Sparkles, Heart, Clock, TrendingUp, Loader2 } from "lucide-react";

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: Array<{ url: string; height: number; width: number }>;
  followers: { total: number };
}

interface SpotifyArtistSuggestionsProps {
  selectedGenres: string[];
  selectedArtists: string[];
  onArtistSelect: (artist: string) => void;
}

interface SpotifyTopResponse {
  items: SpotifyArtist[];
}

export default function SpotifyArtistSuggestions({
  selectedGenres,
  selectedArtists,
  onArtistSelect,
}: SpotifyArtistSuggestionsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customArtist, setCustomArtist] = useState("");

  // Check if Spotify is connected
  const { data: spotifyStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/spotify/status"],
    retry: false
  });

  // Get user's top artists from Spotify
  const { data: topArtists, isLoading: topArtistsLoading } = useQuery<SpotifyTopResponse>({
    queryKey: ["/api/spotify/top-artists"],
    enabled: spotifyStatus?.connected,
    retry: false,
    staleTime: 300000 // 5 minutes
  });

  // Get recently played tracks to extract artists
  const { data: recentTracks, isLoading: recentLoading } = useQuery<any>({
    queryKey: ["/api/spotify/recently-played"],
    enabled: spotifyStatus?.connected,
    retry: false,
    staleTime: 300000 // 5 minutes
  });

  // Search Spotify for artists
  const { data: searchResults, isLoading: searchLoading } = useQuery<any>({
    queryKey: ["/api/spotify/search", searchQuery],
    enabled: spotifyStatus?.connected && searchQuery.length > 2,
    retry: false,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/spotify/search?q=${encodeURIComponent(searchQuery)}&type=artist&limit=10`);
      return response.json();
    }
  });

  // Extract unique artists from recent tracks
  const recentArtists = recentTracks?.items?.reduce((acc: string[], item: any) => {
    const artistName = item.track?.artists?.[0]?.name;
    if (artistName && !acc.includes(artistName) && !selectedArtists.includes(artistName)) {
      acc.push(artistName);
    }
    return acc;
  }, []) || [];

  // Filter top artists that aren't already selected
  const availableTopArtists = topArtists?.items?.filter(
    artist => !selectedArtists.includes(artist.name)
  ) || [];

  // Filter search results
  const availableSearchResults = searchResults?.artists?.items?.filter(
    (artist: SpotifyArtist) => !selectedArtists.includes(artist.name)
  ) || [];

  const addCustomArtist = () => {
    if (customArtist.trim() && !selectedArtists.includes(customArtist.trim())) {
      onArtistSelect(customArtist.trim());
      setCustomArtist("");
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
                <h3 className="font-semibold text-orange-800">Connect Spotify for Personalized Suggestions</h3>
                <p className="text-sm text-orange-600">
                  Get artist recommendations based on your actual listening history
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

        {/* Fallback: Manual artist input */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Add custom artist..."
              value={customArtist}
              onChange={(e) => setCustomArtist(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addCustomArtist();
                }
              }}
              className="pl-10"
              data-testid="input-custom-artist"
            />
            {customArtist && (
              <Button
                size="sm"
                onClick={addCustomArtist}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
                data-testid="button-add-custom-artist"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Selected Artists Display */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Your Artists:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedArtists.map((artist) => (
                <Badge key={artist} className="bg-music-pink text-white flex items-center gap-1" data-testid={`badge-artist-${artist}`}>
                  {artist}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-gray-200"
                    onClick={() => onArtistSelect(artist)}
                    data-testid={`button-remove-artist-${artist}`}
                  />
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Selected: {selectedArtists.length}/10
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Your Top Artists */}
      {topArtistsLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading your top artists...</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ) : availableTopArtists.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Heart className="w-5 h-5" />
              <span>Your Top Artists on Spotify</span>
              <Sparkles className="w-4 h-4" />
            </CardTitle>
            <p className="text-sm text-green-600">Based on your listening history</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableTopArtists.slice(0, 8).map((artist) => (
                <Button
                  key={artist.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onArtistSelect(artist.name)}
                  className="rounded-full bg-white border-green-300 hover:bg-green-100 hover:border-green-400 text-green-700"
                  data-testid={`button-top-artist-${artist.name}`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {artist.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Played Artists */}
      {recentLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading recent artists...</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ) : recentArtists.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Clock className="w-5 h-5" />
              <span>Recently Played Artists</span>
            </CardTitle>
            <p className="text-sm text-blue-600">From your recent listening activity</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentArtists.slice(0, 6).map((artist: string) => (
                <Button
                  key={artist}
                  variant="outline"
                  size="sm"
                  onClick={() => onArtistSelect(artist)}
                  className="rounded-full bg-white border-blue-300 hover:bg-blue-100 hover:border-blue-400 text-blue-700"
                  data-testid={`button-recent-artist-${artist}`}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {artist}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Artists */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Artists</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Spotify for artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-artists"
            />
          </div>

          {searchLoading && searchQuery.length > 2 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          {availableSearchResults.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableSearchResults.map((artist: SpotifyArtist) => (
                <Button
                  key={artist.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onArtistSelect(artist.name)}
                  className="rounded-full hover:border-music-pink hover:text-music-pink"
                  data-testid={`button-search-artist-${artist.name}`}
                >
                  {artist.name}
                </Button>
              ))}
            </div>
          )}

          {/* Manual input option */}
          <div className="pt-2 border-t">
            <div className="relative">
              <Input
                type="text"
                placeholder="Or add custom artist..."
                value={customArtist}
                onChange={(e) => setCustomArtist(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addCustomArtist();
                  }
                }}
                className="pr-20"
                data-testid="input-manual-artist"
              />
              {customArtist && (
                <Button
                  size="sm"
                  onClick={addCustomArtist}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
                  data-testid="button-add-manual-artist"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Artists Display */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-700">Your Artists:</h3>
        <div className="flex flex-wrap gap-2">
          {selectedArtists.map((artist) => (
            <Badge key={artist} className="bg-music-pink text-white flex items-center gap-1" data-testid={`badge-selected-artist-${artist}`}>
              {artist}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-gray-200"
                onClick={() => onArtistSelect(artist)}
                data-testid={`button-remove-selected-artist-${artist}`}
              />
            </Badge>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Selected: {selectedArtists.length}/10
        </p>
      </div>
    </div>
  );
}