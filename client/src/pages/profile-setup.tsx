import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_GENRES = [
  "Pop", "Rock", "Hip-Hop", "Electronic", "Indie", "Jazz", "Country", "R&B",
  "Classical", "Folk", "Reggae", "Blues", "Punk", "Metal", "Alternative", "Soul"
];

const POPULAR_ARTISTS = [
  "The Beatles", "Taylor Swift", "Drake", "Beyoncé", "Ed Sheeran", "Adele",
  "Post Malone", "Billie Eilish", "Ariana Grande", "The Weeknd", "Dua Lipa",
  "Harry Styles", "Olivia Rodrigo", "Bad Bunny", "Daft Punk", "Queen"
];

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [artistSearch, setArtistSearch] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const response = await apiRequest("PUT", `/api/users/${currentUser.id}`, data);
      return response.json();
    },
    onSuccess: (user) => {
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setLocation("/discover");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const addArtist = (artist: string) => {
    if (!selectedArtists.includes(artist)) {
      setSelectedArtists(prev => [...prev, artist]);
      setArtistSearch("");
    }
  };

  const removeArtist = (artist: string) => {
    setSelectedArtists(prev => prev.filter(a => a !== artist));
  };

  const handleComplete = () => {
    if (selectedGenres.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one genre",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      favoriteGenres: selectedGenres,
      favoriteArtists: selectedArtists,
      favoriteSongs: [] // Can be extended later
    });
  };

  const filteredArtists = POPULAR_ARTISTS.filter(artist =>
    artist.toLowerCase().includes(artistSearch.toLowerCase()) &&
    !selectedArtists.includes(artist)
  );

  return (
    <div className="p-6 pt-12 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-8">
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

      <div className="space-y-6">
        {/* Profile Photo Upload */}
        <div className="text-center">
          <div className="w-32 h-32 mx-auto music-gradient-purple-pink rounded-full flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <Button variant="ghost" className="text-music-purple font-semibold">
            Add Photo
          </Button>
        </div>

        {/* Music Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Music Taste</h3>

          {/* Favorite Genres */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Genres (Select at least 1)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GENRES.map((genre) => (
                <Button
                  key={genre}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleGenre(genre)}
                  className={`rounded-full transition ${
                    selectedGenres.includes(genre)
                      ? "bg-music-purple text-white border-music-purple hover:bg-music-purple/90"
                      : "border-gray-300 text-gray-700 hover:border-music-purple hover:text-music-purple"
                  }`}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {/* Favorite Artists */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top Artists
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search and add your favorite artists..."
                value={artistSearch}
                onChange={(e) => setArtistSearch(e.target.value)}
                className="focus:ring-2 focus:ring-music-purple focus:border-transparent"
              />
              {artistSearch && filteredArtists.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredArtists.slice(0, 5).map((artist) => (
                    <button
                      key={artist}
                      onClick={() => addArtist(artist)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedArtists.map((artist) => (
                <span
                  key={artist}
                  className="px-3 py-1 bg-music-purple text-white rounded-full text-sm flex items-center gap-1"
                >
                  {artist}
                  <button
                    onClick={() => removeArtist(artist)}
                    className="ml-1 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleComplete}
          disabled={updateProfileMutation.isPending || selectedGenres.length === 0}
          className="w-full music-gradient-purple-pink text-white font-semibold py-4 rounded-xl shadow-lg hover:opacity-90"
        >
          {updateProfileMutation.isPending ? "Setting up..." : "Complete Profile"}
        </Button>
      </div>
    </div>
  );
}
