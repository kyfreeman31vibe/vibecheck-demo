import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";

interface MatchesProps {
  currentUser: any;
}

export default function Matches({ currentUser }: MatchesProps) {
  const [, setLocation] = useLocation();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: [`/api/matches/${currentUser?.id}`],
    enabled: !!currentUser?.id,
  });

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-music-purple rounded-full animate-pulse"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-music-purple" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Matches</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {matches.length} people who matched with you
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {matches && matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match: any) => (
              <Card
                key={match.id}
                className="dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setLocation(`/chat/${match.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-music-purple rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {match.name || `User ${match.id}`}
                        </h3>
                        <span className="text-sm text-music-purple font-medium">
                          {match.compatibilityScore || 85}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {match.bio || "Music lover looking for connections"}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{match.age || 25} years old</span>
                        <span>{match.location || "2 miles away"}</span>
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 bg-music-purple hover:bg-music-purple/90 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/chat/${match.id}`);
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No matches yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start swiping to find people who share your music taste
            </p>
            <Button
              onClick={() => setLocation("/discover")}
              className="bg-music-purple hover:bg-music-purple/90 text-white"
            >
              Start Discovering
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}