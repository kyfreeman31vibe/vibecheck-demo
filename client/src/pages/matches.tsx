import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import type { User } from "@shared/schema";

export default function Matches() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
  }, []);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/matches", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 music-gradient rounded-full animate-pulse"></div>
          <p className="text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  const newMatches = matches.filter(match => !match.lastMessage);
  const conversations = matches.filter(match => match.lastMessage);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/discover")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-bold text-gray-800">Your Matches</h2>
        <div className="w-6"></div>
      </div>

      {/* New Matches Section */}
      {newMatches.length > 0 && (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New Matches</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {newMatches.map((match) => (
              <div
                key={match.id}
                className="flex-shrink-0 text-center cursor-pointer"
                onClick={() => setLocation(`/chat/${match.id}`)}
              >
                <div className="w-16 h-16 rounded-full border-3 border-music-pink overflow-hidden mb-2 relative bg-gradient-to-br from-music-purple to-music-orange flex items-center justify-center">
                  <span className="text-white font-bold">
                    {match.partner?.name?.[0] || "?"}
                  </span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <p className="text-xs font-medium">{match.partner?.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div className="px-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Messages</h3>
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">Start matching to begin chatting!</p>
            </div>
          ) : (
            conversations.map((match) => (
              <div
                key={match.id}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition"
                onClick={() => setLocation(`/chat/${match.id}`)}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-music-purple to-music-orange flex items-center justify-center">
                    <span className="text-white font-bold">
                      {match.partner?.name?.[0] || "?"}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{match.partner?.name}</p>
                    <span className="text-xs text-gray-500">
                      {match.lastMessage ? "2m" : "now"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {match.lastMessage?.content || "Say hello! 👋"}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-music-purple font-medium">
                      {match.compatibilityScore}% match
                    </span>
                    {match.unreadCount > 0 && (
                      <div className="w-2 h-2 bg-music-pink rounded-full ml-auto"></div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}
