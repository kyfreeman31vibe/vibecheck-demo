import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, DollarSign, ExternalLink, Loader2, Search } from "lucide-react";

interface Event {
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
  url: string;
  source: 'ticketmaster' | 'eventbrite' | 'stubhub';
  genres: string[];
}

interface EventsIntegrationProps {
  userGenres: string[];
  userLocation?: string;
}

export default function EventsIntegration({ userGenres, userLocation }: EventsIntegrationProps) {
  const [location, setLocation] = useState(userLocation || "");
  const [searchRadius, setSearchRadius] = useState(25);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Auto-detect user location
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding to get city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const cityName = data.city || data.locality || data.principalSubdivision;
            if (cityName) {
              setLocation(cityName);
              setShouldFetch(true);
            }
          } catch (error) {
            console.error('Location detection failed:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    } else if (userLocation) {
      setShouldFetch(true);
    }
  }, [userLocation]);

  // Fetch events
  const { data: events = [], isLoading, error, refetch } = useQuery<Event[]>({
    queryKey: ["/api/events", location, userGenres.join(','), searchRadius],
    enabled: shouldFetch && !!location,
    retry: false
  });

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      setShouldFetch(true);
      refetch();
    }
  };

  const formatPrice = (price: Event['price']) => {
    if (!price.min && !price.max) return "Price TBA";
    if (price.min === price.max) return `${price.currency} ${price.min}`;
    if (price.min && price.max) return `${price.currency} ${price.min} - ${price.max}`;
    if (price.min) return `From ${price.currency} ${price.min}`;
    return "Price varies";
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`);
      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };
    } catch {
      return { date: dateStr, time: timeStr };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="w-12 h-12 mx-auto text-music-purple mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Live Music Events</h2>
        <p className="text-gray-600 dark:text-gray-400">Discover concerts and shows in your area</p>
      </div>

      {/* Location Search */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 dark:text-gray-100">
            <MapPin className="w-5 h-5" />
            <span>Your Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter your city (e.g., San Francisco, CA)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              We'll search for events within {searchRadius} miles of your location
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Events Results */}
      {shouldFetch && location && (
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500 dark:text-gray-400">Finding live music events...</span>
            </div>
          )}

          {error && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Unable to load events at the moment. Please try again later.
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && events.length === 0 && (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-6 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No events found in {location}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Try a different city or check back later for new events
                </p>
              </CardContent>
            </Card>
          )}

          {events.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Upcoming Events ({events.length})
                </h3>
                <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                  Based on your music taste
                </Badge>
              </div>

              <div className="grid gap-4">
                {events.slice(0, 10).map((event) => {
                  const { date, time } = formatDate(event.date, event.time);
                  
                  return (
                    <Card key={event.id} className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex space-x-4">
                          {/* Event Image */}
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                            {event.image ? (
                              <img 
                                src={event.image} 
                                alt={event.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Event Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                              {event.name}
                            </h4>
                            
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{date} at {time}</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">
                                  {event.venue.name}, {event.venue.city}
                                  {event.venue.state && `, ${event.venue.state}`}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-3 h-3" />
                                <span>{formatPrice(event.price)}</span>
                              </div>
                            </div>

                            {/* Genres */}
                            {event.genres.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {event.genres.slice(0, 3).map((genre, index) => (
                                  <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                                    {genre}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="flex flex-col justify-between items-end">
                            <Badge className={`text-xs ${
                              event.source === 'ticketmaster' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              event.source === 'eventbrite' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            }`}>
                              {event.source}
                            </Badge>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(event.url, '_blank')}
                              className="mt-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Tickets
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {events.length > 10 && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing first 10 events. Visit individual platforms for complete listings.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}