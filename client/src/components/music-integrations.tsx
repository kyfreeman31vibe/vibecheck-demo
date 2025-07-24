import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Music, ExternalLink, Check, Loader2, Play } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackCount: number;
  image?: string;
  tracks?: Array<{
    name: string;
    artist: string;
    album: string;
  }>;
}

interface MusicIntegrationsProps {
  onPlaylistsSelected: (playlists: Playlist[]) => void;
  selectedPlaylists: Playlist[];
}

export default function MusicIntegrations({ onPlaylistsSelected, selectedPlaylists }: MusicIntegrationsProps) {
  const { toast } = useToast();
  const [connectedServices, setConnectedServices] = useState<string[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>(
    selectedPlaylists.map(p => p.id)
  );

  // Check connection status
  const { data: spotifyStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/spotify/status"],
    retry: false
  });

  const spotifyConnected = spotifyStatus?.connected || false;

  // Fetch Spotify playlists
  const { data: spotifyPlaylists = [], isLoading: spotifyLoading, refetch: refetchSpotify } = useQuery<Playlist[]>({
    queryKey: ["/api/spotify/playlists"],
    enabled: spotifyConnected,
    retry: false
  });

  // Connect to Spotify
  const connectSpotify = async () => {
    console.log('Attempting to connect to Spotify...');
    
    try {
      // First, let's get the config to debug
      const configResponse = await fetch('/api/spotify/config');
      const config = await configResponse.json();
      console.log('Spotify config:', config);
      
      // Now redirect to Spotify
      console.log('Redirecting to:', '/api/auth/spotify');
      window.location.href = "/api/auth/spotify";
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Spotify. Check console for details.",
        variant: "destructive"
      });
    }
  };

  // Connect to Apple Music
  const connectAppleMusic = async () => {
    try {
      // Get developer token first
      const response = await apiRequest("GET", "/api/apple-music/developer-token");
      const { developerToken } = await response.json();
      
      // Initialize Apple Music JS
      if (window.MusicKit) {
        await window.MusicKit.configure({
          developerToken,
          app: {
            name: 'VibeCheck',
            build: '1.0.0'
          }
        });

        const musicInstance = window.MusicKit.getInstance();
        await musicInstance.authorize();
        
        if (musicInstance.isAuthorized) {
          setConnectedServices(prev => [...prev, 'apple-music']);
          toast({
            title: "Connected to Apple Music",
            description: "You can now import your playlists"
          });
        }
      } else {
        toast({
          title: "Apple Music not available",
          description: "Apple Music requires Safari browser",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Could not connect to Apple Music",
        variant: "destructive"
      });
    }
  };

  const togglePlaylist = (playlist: Playlist) => {
    const isSelected = selectedPlaylistIds.includes(playlist.id);
    const newSelectedIds = isSelected 
      ? selectedPlaylistIds.filter(id => id !== playlist.id)
      : [...selectedPlaylistIds, playlist.id];
    
    setSelectedPlaylistIds(newSelectedIds);
    
    const newSelectedPlaylists = isSelected
      ? selectedPlaylists.filter(p => p.id !== playlist.id)
      : [...selectedPlaylists, playlist];
    
    onPlaylistsSelected(newSelectedPlaylists);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Music className="w-12 h-12 mx-auto text-music-purple mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Connect Your Music</h2>
        <p className="text-gray-600 dark:text-gray-400">Import playlists from your favorite music platforms</p>
      </div>

      {/* Service Connection Cards */}
      <div className="grid gap-4">
        {/* Spotify */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-gray-100">Spotify</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Import your playlists and listening history</p>
                </div>
              </div>
              {spotifyConnected ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Button onClick={connectSpotify} size="sm" className="bg-green-500 hover:bg-green-600">
                  Connect
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          
          {spotifyConnected && (
            <CardContent>
              {spotifyLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Loading playlists...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Found {spotifyPlaylists.length} playlists. Select the ones that best represent your music taste:
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {spotifyPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        onClick={() => togglePlaylist(playlist)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPlaylistIds.includes(playlist.id)
                            ? "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600"
                            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden">
                            {playlist.image ? (
                              <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">{playlist.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {playlist.trackCount} tracks
                            </p>
                          </div>
                          {selectedPlaylistIds.includes(playlist.id) && (
                            <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Apple Music */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-gray-100">Apple Music</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connect your Apple Music library</p>
                </div>
              </div>
              {connectedServices.includes('apple-music') ? (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Button onClick={connectAppleMusic} size="sm" className="bg-red-500 hover:bg-red-600">
                  Connect
                </Button>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Selected Playlists Summary */}
      {selectedPlaylists.length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-gray-100">Selected Playlists ({selectedPlaylists.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedPlaylists.map((playlist) => (
                <Badge key={playlist.id} variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                  {playlist.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <p>Your playlists help us understand your music taste and find better matches.</p>
        <p>We only access playlist names and track information - never your personal data.</p>
      </div>
    </div>
  );
}

// Add Apple Music types to window
declare global {
  interface Window {
    MusicKit: any;
  }
}