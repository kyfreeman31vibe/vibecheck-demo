import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Clock, Music, Star, ExternalLink, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";

interface MusicEvent {
  id: string;
  name: string;
  description?: string;
  date: string;
  time: string;
  venue: {
    name: string;
    city: string;
    state?: string;
    country: string;
    address?: string;
  };
  price: {
    min?: number;
    max?: number;
    currency: string;
  };
  image?: string;
  url?: string;
  source: string;
  genres: string[];
}

interface EventsProps {
  currentUser: any;
}

export default function Events({ currentUser }: EventsProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [location, setLocation] = useState<string>("New York");
  const [searchLocation, setSearchLocation] = useState<string>("New York");

  // Fetch events from Ticketmaster API
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["/api/events", searchLocation, selectedGenre],
    queryFn: async () => {
      const params = new URLSearchParams({
        location: searchLocation,
      });
      
      if (selectedGenre !== "All") {
        params.append("genres", selectedGenre.toLowerCase());
      }
      
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    enabled: !!searchLocation,
  });

  const userGenres = currentUser?.favoriteGenres || [];
  const allGenres = ["All", "Pop", "Rock", "Hip-Hop", "Electronic", "Indie", "Country", "Jazz", "Classical"];
  
  const isUserGenre = (genre: string) => {
    return userGenres.some((userGenre: string) => 
      userGenre.toLowerCase() === genre.toLowerCase()
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (priceInfo: { min?: number; max?: number; currency: string }) => {
    if (!priceInfo.min && !priceInfo.max) {
      return "Price TBA";
    }
    
    if (priceInfo.min && priceInfo.max) {
      return `$${priceInfo.min} - $${priceInfo.max}`;
    }
    
    return `$${priceInfo.min || priceInfo.max}`;
  };

  const handleLocationSearch = () => {
    setSearchLocation(location);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <Music className="w-8 h-8 text-music-purple" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Music Events</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Discover live music near you</p>
            </div>
          </div>

          {/* Location Search */}
          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Enter city name"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
              data-testid="input-location"
            />
            <Button 
              onClick={handleLocationSearch}
              size="sm"
              className="music-gradient-purple-pink text-white"
              data-testid="button-search-location"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Genre Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {allGenres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className={`flex-shrink-0 ${
                  selectedGenre === genre 
                    ? "music-gradient-purple-pink text-white" 
                    : "hover:border-music-purple"
                }`}
                data-testid={`button-genre-${genre.toLowerCase()}`}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="px-4 py-4">
        <div className="max-w-md mx-auto">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-music-purple border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Finding events...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Unable to load events</p>
              <p className="text-sm text-gray-400">Check your connection and try again</p>
            </div>
          )}

          {!isLoading && !error && events.length === 0 && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No events found</p>
              <p className="text-sm text-gray-400">Try searching in a different city or change genre filters</p>
            </div>
          )}

          {!isLoading && !error && events.length > 0 && (
            <div className="space-y-4">
              {events.map((event: MusicEvent) => (
                <Card key={event.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{event.name}</h3>
                          {event.genres.some(genre => isUserGenre(genre)) && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{event.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {event.genres.slice(0, 2).map((genre, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className={`text-xs ${
                                isUserGenre(genre)
                                  ? "bg-music-purple/10 text-music-purple" 
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                              data-testid={`badge-genre-${genre.toLowerCase()}`}
                            >
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                        <div className="font-medium text-music-purple">
                          {formatPrice(event.price)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(event.date)}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.venue.name}, {event.venue.city}</span>
                      </div>
                    </div>

                    {event.url && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full text-xs hover:border-music-purple"
                          data-testid={`button-view-tickets-${event.id}`}
                        >
                          <a href={event.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Tickets
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}