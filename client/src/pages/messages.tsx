import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, User, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";

interface MessagesProps {
  currentUser: any;
}

export default function Messages({ currentUser }: MessagesProps) {
  const [, setLocation] = useLocation();

  const { data: matches = [] } = useQuery({
    queryKey: [`/api/matches/${currentUser?.id}`],
    enabled: !!currentUser,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-music-purple" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Messages</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chat with your matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Content */}
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
                    <div className="w-12 h-12 bg-music-purple rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {match.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          2m ago
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Hey! I love your music taste 🎵
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-music-purple font-medium">
                          {match.compatibilityScore}% match
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start matching with people to begin conversations
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