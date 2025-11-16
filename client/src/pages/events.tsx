import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Music, Star, ExternalLink, Search, Users, Heart, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

interface EventAttendee {
  id: number;
  userId: number;
  eventId: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profilePicture?: string;
    favoriteGenres: string[];
    personalityType?: string;
  } | null;
}

export default function Events({ currentUser }: EventsProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [location, setLocation] = useState<string>("New York");
  const [searchLocation, setSearchLocation] = useState<string>("New York");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch attendees for each event
  const getEventAttendees = (eventId: string) => {
    return useQuery({
      queryKey: ["/api/events", eventId, "attendees"],
      queryFn: async () => {
        const response = await fetch(`/api/events/${eventId}/attendees`);
        if (!response.ok) {
          throw new Error('Failed to fetch attendees');
        }
        return response.json();
      },
    });
  };

  // Mutation for attending events
  const attendEventMutation = useMutation({
    mutationFn: async ({ eventId, eventData, status }: { eventId: string; eventData: any; status: string }) => {
      await apiRequest("POST", `/api/events/${eventId}/attend`, {
        status,
        eventName: eventData.name,
        eventDate: eventData.date,
        eventVenue: eventData.venue.name,
        eventCity: eventData.venue.city,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", variables.eventId, "attendees"] });
      toast({
        title: "Event updated",
        description: `You're now ${variables.status} for this event!`,
      });
    },
    onError: (error: any) => {
      console.error("Event attendance error:", error);
      if (error.message && error.message.includes("401")) {
        toast({
          title: "Authentication required",
          description: "Please log in to attend events. Your session may have expired.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update event attendance",
          variant: "destructive",
        });
      }
    },
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

  const handleAttendEvent = (event: MusicEvent, status: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to attend events",
        variant: "destructive",
      });
      return;
    }

    attendEventMutation.mutate({
      eventId: event.id,
      eventData: event,
      status,
    });
  };

  return (
    <div className="min-h-screen tech-gradient-soft pb-20">
      {/* Header */}
      <div className="bg-gray-900/30 backdrop-blur-xl shadow-lg border-b border-purple-500/30">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 tech-gradient rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Music Events</h1>
              <p className="text-sm text-gray-300">Discover live music near you</p>
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
              className="tech-gradient text-white border border-purple-400/50"
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
                    ? "tech-gradient text-white border border-purple-400/50" 
                    : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
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
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">Finding events...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Unable to load events</p>
              <p className="text-sm text-gray-400">Check your connection and try again</p>
            </div>
          )}

          {!isLoading && !error && events.length === 0 && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">No events found</p>
              <p className="text-sm text-gray-400">Try searching in a different city or change genre filters</p>
            </div>
          )}

          {!isLoading && !error && events.length > 0 && (
            <div className="space-y-4">
              {events.map((event: MusicEvent) => {
                const EventAttendeesComponent = () => {
                  const { data: attendees = [], isLoading: attendeesLoading } = getEventAttendees(event.id);
                  
                  return (
                    <EventSocialComponent 
                      event={event}
                      attendees={attendees}
                      attendeesLoading={attendeesLoading}
                      currentUser={currentUser}
                      onAttend={handleAttendEvent}
                    />
                  );
                };

                return <EventAttendeesComponent key={event.id} />;
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}

// Social component for individual events
function EventSocialComponent({ 
  event, 
  attendees, 
  attendeesLoading, 
  currentUser, 
  onAttend 
}: {
  event: MusicEvent;
  attendees: EventAttendee[];
  attendeesLoading: boolean;
  currentUser: any;
  onAttend: (event: MusicEvent, status: string) => void;
}) {
  const userGenres = currentUser?.favoriteGenres || [];
  
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

  const userAttendance = attendees.find(a => a.userId === currentUser?.id);
  const goingCount = attendees.filter(a => a.status === 'going').length;
  const interestedCount = attendees.filter(a => a.status === 'interested').length;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
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

        {/* Social Section */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Attendance Stats */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
              <Users className="w-3 h-3" />
              <span>{goingCount} going</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
              <Heart className="w-3 h-3" />
              <span>{interestedCount} interested</span>
            </div>
          </div>

          {/* Attendee Avatars */}
          {!attendeesLoading && attendees.length > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex -space-x-2">
                {attendees.slice(0, 5).map((attendee, index) => (
                  <Link key={attendee.id} href={`/u/${attendee.user?.username}`}>
                    <Avatar className="w-6 h-6 border-2 border-white dark:border-gray-800 cursor-pointer hover:scale-110 transition-transform">
                      <AvatarImage src={attendee.user?.profilePicture} />
                      <AvatarFallback className="text-xs bg-music-purple/10 text-music-purple">
                        {attendee.user?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ))}
                {attendees.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">+{attendees.length - 5}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                VibeCheckers attending
              </span>
            </div>
          )}

          {/* Attendance Buttons */}
          <div className="flex space-x-2 mb-3">
            <Button
              size="sm"
              variant={userAttendance?.status === 'going' ? 'default' : 'outline'}
              className={`flex-1 text-xs ${
                userAttendance?.status === 'going' 
                  ? 'music-gradient-purple-pink text-white' 
                  : 'hover:border-music-purple'
              }`}
              onClick={() => onAttend(event, 'going')}
              data-testid={`button-going-${event.id}`}
            >
              <Users className="w-3 h-3 mr-1" />
              Going
            </Button>
            <Button
              size="sm"
              variant={userAttendance?.status === 'interested' ? 'default' : 'outline'}
              className={`flex-1 text-xs ${
                userAttendance?.status === 'interested' 
                  ? 'music-gradient-purple-pink text-white' 
                  : 'hover:border-music-purple'
              }`}
              onClick={() => onAttend(event, 'interested')}
              data-testid={`button-interested-${event.id}`}
            >
              <Heart className="w-3 h-3 mr-1" />
              Interested
            </Button>
          </div>

          {/* View Tickets Button */}
          {event.url && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}