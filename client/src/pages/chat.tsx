import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Music, Send, MoreVertical, Heart, Users, Ticket } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/bottom-navigation";
import type { User } from "@shared/schema";

interface ChatProps {
  currentUser: any;
}

export default function Chat({ currentUser }: ChatProps) {
  const [, setLocation] = useLocation();
  const { matchId } = useParams();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const userId = matchId ? parseInt(matchId) : null;

  const { data: messages = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/messages", matchId],
    enabled: !!matchId,
  });

  const { data: matches = [] } = useQuery<any[]>({
    queryKey: ["/api/matches", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: socialConnections = [] } = useQuery<any[]>({
    queryKey: ["/api/social/connections", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const currentMatch = matches.find((match: any) => match.id === parseInt(matchId || "0"));
  
  const currentConnection = socialConnections.find((conn: any) => 
    conn.status === "accepted" && 
    (conn.requesterId === userId || conn.receiverId === userId)
  );

  const isMatch = !!currentMatch;
  const isConnection = !!currentConnection;

  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      refetch();
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser || !matchId) return;

    sendMessageMutation.mutate({
      matchId: parseInt(matchId),
      senderId: currentUser.id,
      content: message.trim(),
      messageType: "text",
    });
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (!isMatch && !isConnection) {
    return <div>Loading...</div>;
  }

  let partner: any;
  let connectionType: string = "";
  let compatibilityScore: number = 0;

  if (isMatch && currentMatch) {
    partner = currentMatch.partner;
    compatibilityScore = currentMatch.compatibilityScore || 0;
  } else if (isConnection && currentConnection) {
    const partnerId = currentConnection.requesterId === currentUser.id 
      ? currentConnection.receiverId 
      : currentConnection.requesterId;
    partner = currentConnection.requesterId === currentUser.id 
      ? currentConnection.receiver 
      : currentConnection.requester;
    connectionType = currentConnection.connectionType || "friend";
  }

  const getConnectionBadge = () => {
    if (isMatch) {
      return (
        <Badge variant="outline" className="bg-pink-500/20 border-pink-400/50 text-pink-600 text-xs font-medium">
          <Heart className="w-3 h-3 mr-1" />
          Dating
        </Badge>
      );
    }
    
    switch (connectionType) {
      case "friend":
        return (
          <Badge variant="outline" className="bg-blue-500/20 border-blue-400/50 text-blue-600 text-xs font-medium">
            <Users className="w-3 h-3 mr-1" />
            Friend
          </Badge>
        );
      case "music_buddy":
        return (
          <Badge variant="outline" className="bg-purple-500/20 border-purple-400/50 text-purple-600 text-xs font-medium">
            <Music className="w-3 h-3 mr-1" />
            Music Buddy
          </Badge>
        );
      case "event_buddy":
        return (
          <Badge variant="outline" className="bg-orange-500/20 border-orange-400/50 text-orange-600 text-xs font-medium">
            <Ticket className="w-3 h-3 mr-1" />
            Event Buddy
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col pb-20">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/messages")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-music-purple to-music-orange flex items-center justify-center">
            <span className="text-white font-bold">
              {partner?.name?.[0] || "?"}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{partner?.name}</p>
              {getConnectionBadge()}
            </div>
            <p className="text-xs text-green-500">Online now</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Music Compatibility Bar */}
      {isMatch && (
        <div className="music-gradient-purple-pink p-3">
          <div className="flex items-center justify-center space-x-2 text-white">
            <Music className="w-4 h-4" />
            <span className="text-sm font-medium">
              {compatibilityScore}% Music Match • You both love great music!
            </span>
          </div>
        </div>
      )}
      {isConnection && (
        <div className="music-gradient-purple-pink p-3">
          <div className="flex items-center justify-center space-x-2 text-white">
            <Music className="w-4 h-4" />
            <span className="text-sm font-medium">
              Connected through music • Start chatting!
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Match/Connection Message */}
        <div className="text-center">
          <div className="inline-block music-gradient-purple-pink text-white px-4 py-2 rounded-full text-sm font-medium mb-2">
            {isMatch ? "🎵 You matched on music taste! 🎵" : "🎵 You're connected! 🎵"}
          </div>
          <p className="text-xs text-gray-500">Today</p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${
                msg.senderId === currentUser.id ? "justify-end" : ""
              }`}
            >
              {msg.senderId !== currentUser.id && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-music-purple to-music-orange flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {partner?.name?.[0] || "?"}
                  </span>
                </div>
              )}
              <div className="max-w-xs">
                <div
                  className={`rounded-2xl p-3 ${
                    msg.senderId === currentUser.id
                      ? "music-gradient-purple-pink text-white rounded-tr-md"
                      : "bg-gray-100 text-gray-800 rounded-tl-md"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
                <p
                  className={`text-xs text-gray-500 mt-1 ${
                    msg.senderId === currentUser.id ? "text-right mr-3" : "ml-3"
                  }`}
                >
                  {new Date(msg.createdAt!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100"
          >
            <Music className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pr-12 rounded-full focus:ring-2 focus:ring-music-purple focus:border-transparent"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 music-gradient-purple-pink rounded-full p-0"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </form>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}
