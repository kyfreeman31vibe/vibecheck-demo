import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Music, Users, Calendar, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import BottomNavigation from "@/components/bottom-navigation";
import { formatDistanceToNow } from "date-fns";

interface FeedItem {
  type: "spotify_share" | "new_connection" | "event_attendance";
  user: {
    id: number;
    name: string;
    username: string;
    profilePicture: string | null;
  };
  item?: any;
  connectionType?: string;
  event?: any;
  timestamp: string;
}

interface FeedProps {
  currentUser: any;
}

export default function Feed({ currentUser }: FeedProps) {
  const [, setLocation] = useLocation();

  const { data: feedItems = [], isLoading } = useQuery<FeedItem[]>({
    queryKey: ["/api/feed"],
    enabled: !!currentUser,
  });

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen tech-gradient-soft pb-20">
      {/* Header */}
      <div className="bg-gray-900/30 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg border-b border-purple-500/30 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white drop-shadow-lg">Your Feed</h1>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 tech-gradient rounded-full animate-pulse border border-purple-400/50"></div>
              <p className="text-gray-300">Loading your feed...</p>
            </div>
          </div>
        ) : feedItems.length === 0 ? (
          <Card className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 tech-gradient rounded-full flex items-center justify-center border border-purple-400/50 shadow-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No activity yet</h2>
              <p className="text-gray-300 mb-6">Connect with friends and see their music shares, new connections, and event RSVPs here!</p>
              <Button
                onClick={() => setLocation("/connections")}
                className="tech-gradient hover:opacity-90 text-white border border-purple-400/50"
              >
                Find Connections
              </Button>
            </CardContent>
          </Card>
        ) : (
          feedItems.map((item, idx) => (
            <Card
              key={idx}
              className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl hover:border-purple-400/50 transition-colors cursor-pointer"
              onClick={() => setLocation(`/u/${item.user.username}`)}
              data-testid={`feed-item-${item.type}-${idx}`}
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {item.user.profilePicture && (
                      <img
                        src={item.user.profilePicture}
                        alt={item.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{item.user.name}</p>
                      <p className="text-xs text-gray-400">@{item.user.username}</p>
                    </div>
                  </div>
                  <div className="ml-2">
                    {item.type === "spotify_share" && (
                      <Music className="w-5 h-5 text-orange-400" />
                    )}
                    {item.type === "new_connection" && (
                      <Users className="w-5 h-5 text-blue-400" />
                    )}
                    {item.type === "event_attendance" && (
                      <Calendar className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                {item.type === "spotify_share" && item.item && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      {item.item.imageUrl && (
                        <img
                          src={item.item.imageUrl}
                          alt={item.item.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          Shared {item.item.itemType === "top_artists" ? "Top Artists" : item.item.itemType === "top_songs" ? "Top Songs" : "a Playlist"}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1">{item.item.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                )}

                {item.type === "new_connection" && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">
                      You're now connected as{" "}
                      <span className="font-semibold text-white capitalize">
                        {item.connectionType}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                )}

                {item.type === "event_attendance" && item.event && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-white line-clamp-1">
                        {item.event.eventName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.event.eventVenue} • {item.event.eventDate}
                      </p>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        Status: {item.event.status}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-400">View profile</span>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}
