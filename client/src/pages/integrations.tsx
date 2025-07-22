import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/bottom-navigation";
import MusicIntegrations from "@/components/music-integrations";
import EventsIntegration from "@/components/events-integration";
import { Link, Music, Calendar, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Integrations() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPlaylists, setSelectedPlaylists] = useState<any[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/setup")}
          title="Back to Profile"
          className="text-gray-600 dark:text-gray-300"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
          Music & Events
        </h2>
        <div className="w-6"></div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <Link className="w-12 h-12 mx-auto text-music-purple mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Connect Your Music World
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Import playlists and discover live events to enhance your profile
          </p>
        </div>

        <Tabs defaultValue="music" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
            <TabsTrigger value="music" className="flex items-center space-x-2 dark:data-[state=active]:bg-gray-700">
              <Music className="w-4 h-4" />
              <span>Music Platforms</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2 dark:data-[state=active]:bg-gray-700">
              <Calendar className="w-4 h-4" />
              <span>Live Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="music" className="space-y-6">
            <MusicIntegrations
              onPlaylistsSelected={setSelectedPlaylists}
              selectedPlaylists={selectedPlaylists}
            />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <EventsIntegration
              userGenres={currentUser.favoriteGenres || []}
              userLocation={currentUser.location}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}