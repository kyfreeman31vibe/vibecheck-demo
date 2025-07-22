import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Music, Star, ExternalLink } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";

interface MusicEvent {
  id: string;
  name: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  price: string;
  genre: string;
  distance: string;
  image?: string;
}

// Sample events data - in a real app, this would come from an API like Ticketmaster or Bandsintown
const SAMPLE_EVENTS: MusicEvent[] = [
  {
    id: "1",
    name: "Summer Indie Fest",
    artist: "Tame Impala, Bon Iver, The 1975",
    venue: "Golden Gate Park",
    date: "2025-08-15",
    time: "6:00 PM",
    price: "$85 - $150",
    genre: "Indie",
    distance: "2.3 miles"
  },
  {
    id: "2", 
    name: "Electronic Nights",
    artist: "Flume, ODESZA, Disclosure",
    venue: "The Warfield",
    date: "2025-08-22",
    time: "8:00 PM",
    price: "$45 - $75",
    genre: "Electronic",
    distance: "1.8 miles"
  },
  {
    id: "3",
    name: "Jazz Under Stars",
    artist: "Norah Jones",
    venue: "Davies Symphony Hall",
    date: "2025-08-29",
    time: "7:30 PM",
    price: "$55 - $120",
    genre: "Jazz",
    distance: "3.1 miles"
  },
  {
    id: "4",
    name: "Pop Royalty Tour",
    artist: "Taylor Swift",
    venue: "Chase Center",
    date: "2025-09-05",
    time: "7:00 PM",
    price: "$125 - $350",
    genre: "Pop",
    distance: "4.2 miles"
  },
  {
    id: "5",
    name: "Rock Revival",
    artist: "Foo Fighters, Red Hot Chili Peppers",
    venue: "Outside Lands",
    date: "2025-09-12",
    time: "5:00 PM",
    price: "$95 - $200",
    genre: "Rock",
    distance: "2.7 miles"
  }
];

export default function Events() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
  }, []);

  const userGenres = currentUser?.favoriteGenres || [];
  const genres = ["All", ...Array.from(new Set(SAMPLE_EVENTS.map(event => event.genre)))];
  
  const filteredEvents = selectedGenre === "All" 
    ? SAMPLE_EVENTS 
    : SAMPLE_EVENTS.filter(event => event.genre === selectedGenre);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isUserGenre = (eventGenre: string) => {
    return userGenres.some((genre: string) => 
      genre.toLowerCase() === eventGenre.toLowerCase()
    );
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold music-gradient bg-clip-text text-transparent text-center">
            Music Events Near You
          </h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            Based on your location in {currentUser.location || "San Francisco, CA"}
          </p>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="p-4">
        <div className="max-w-md mx-auto">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {genres.map((genre) => (
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
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="px-4 space-y-4">
        <div className="max-w-md mx-auto space-y-4">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{event.name}</h3>
                      {isUserGenre(event.genre) && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" title="Matches your taste!" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{event.artist}</p>
                    <div className="flex items-center space-x-1 mb-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          isUserGenre(event.genre) 
                            ? "bg-music-purple/10 text-music-purple" 
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {event.genre}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {event.distance}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(event.date)}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{event.price}</span>
                    <Button 
                      size="sm" 
                      className="music-gradient-purple-pink text-white text-xs px-3 py-1 h-auto"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Get Tickets
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <Music className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No events found</h3>
              <p className="text-sm text-gray-500">
                Try selecting a different genre or check back later for new events.
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}