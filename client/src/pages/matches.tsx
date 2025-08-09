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
      <div className="min-h-screen tech-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 tech-gradient rounded-full animate-pulse border border-purple-400/50"></div>
          <p className="text-gray-300">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tech-gradient-soft pb-20">
      {/* Header */}
      <div className="bg-gray-900/30 dark:bg-gray-900/50 backdrop-blur-xl shadow-lg border-b border-purple-500/30">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Your Matches</h1>
              <p className="text-sm text-gray-300">
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
                className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl cursor-pointer hover:bg-gray-800/60 transition-all duration-300"
                onClick={() => setLocation(`/chat/${match.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">
                          {match.name || `User ${match.id}`}
                        </h3>
                        <span className="text-sm text-cyan-400 font-medium">
                          {match.compatibilityScore || 85}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {match.bio || "Music lover looking for connections"}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{match.age || 25} years old</span>
                        <span>{match.location || "2 miles away"}</span>
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 accent-coral-lime text-white shadow-lg border border-coral-400/50"
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
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-white mb-2">
              No matches yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start swiping to find people who share your music taste
            </p>
            <Button
              onClick={() => setLocation("/discover")}
              className="tech-gradient hover:opacity-90 text-white border border-purple-400/50"
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