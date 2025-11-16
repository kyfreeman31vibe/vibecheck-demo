import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, UserPlus, UserCheck, UserX, Music, Ticket, Heart } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";

interface ConnectionsProps {
  currentUser: any;
}

const getConnectionBadge = (connectionType: string) => {
  const types: Record<string, { label: string; icon: any; className: string }> = {
    friend: {
      label: "Friend",
      icon: Users,
      className: "bg-blue-500/20 border-blue-400/50 text-blue-300",
    },
    music_buddy: {
      label: "Music Buddy",
      icon: Music,
      className: "bg-purple-500/20 border-purple-400/50 text-purple-300",
    },
    event_buddy: {
      label: "Event Buddy",
      icon: Ticket,
      className: "bg-orange-500/20 border-orange-400/50 text-orange-300",
    },
    dating: {
      label: "Dating",
      icon: Heart,
      className: "bg-pink-500/20 border-pink-400/50 text-pink-300",
    },
  };

  const config = types[connectionType] || types.friend;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} text-xs font-medium`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export default function Connections({ currentUser }: ConnectionsProps) {
  const { toast } = useToast();

  const { data: connections = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/social/connections", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/social/connect/${connectionId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/connections", currentUser?.id] });
      toast({
        title: "Success",
        description: "Connection updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update connection",
        variant: "destructive",
      });
    },
  });

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen tech-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 tech-gradient rounded-full animate-pulse border border-purple-400/50"></div>
          <p className="text-gray-300">Loading connections...</p>
        </div>
      </div>
    );
  }

  const pendingReceived = connections.filter(
    (c: any) => c.status === "pending" && c.receiverId === currentUser.id
  );
  const pendingSent = connections.filter(
    (c: any) => c.status === "pending" && c.requesterId === currentUser.id
  );
  const accepted = connections.filter((c: any) => c.status === "accepted");

  return (
    <div className="min-h-screen tech-gradient-soft pb-20">
      {/* Header */}
      <div className="bg-gray-900/30 backdrop-blur-xl shadow-lg border-b border-purple-500/30">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Connections</h1>
              <p className="text-sm text-gray-300">
                {accepted.length} friends • {pendingReceived.length} requests
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/40 border border-purple-500/30">
            <TabsTrigger 
              value="friends" 
              className="data-[state=active]:tech-gradient data-[state=active]:text-white"
              data-testid="tab-friends"
            >
              Friends ({accepted.length})
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="data-[state=active]:tech-gradient data-[state=active]:text-white"
              data-testid="tab-requests"
            >
              Requests ({pendingReceived.length})
            </TabsTrigger>
            <TabsTrigger 
              value="sent" 
              className="data-[state=active]:tech-gradient data-[state=active]:text-white"
              data-testid="tab-sent"
            >
              Sent ({pendingSent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4 space-y-3">
            {accepted.length > 0 ? (
              accepted.map((connection: any) => {
                const friend = connection.requesterId === currentUser.id 
                  ? connection.receiver 
                  : connection.requester;
                
                return (
                  <Link key={connection.id} href={`/u/${friend?.username}`}>
                    <Card
                      className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl hover:bg-gray-800/60 transition-all cursor-pointer"
                      data-testid={`connection-${connection.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
                              {friend?.profilePicture ? (
                                <img
                                  src={friend.profilePicture}
                                  alt={friend.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-bold text-white">
                                  {friend?.name?.[0] || "?"}
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-white" data-testid={`text-friend-name-${connection.id}`}>
                                {friend?.name || "Unknown"}
                              </h3>
                              <p className="text-sm text-gray-400">@{friend?.username || "unknown"}</p>
                              <div className="mt-1">
                                {getConnectionBadge(connection.connectionType)}
                              </div>
                            </div>
                          </div>
                          <UserCheck className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No connections yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start connecting with music lovers!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4 space-y-3">
            {pendingReceived.length > 0 ? (
              pendingReceived.map((connection: any) => (
                <Card
                  key={connection.id}
                  className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl"
                  data-testid={`request-${connection.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
                          {connection.requester?.profilePicture ? (
                            <img
                              src={connection.requester.profilePicture}
                              alt={connection.requester.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {connection.requester?.name?.[0] || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white" data-testid={`text-requester-name-${connection.id}`}>
                            {connection.requester?.name || "Unknown"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            @{connection.requester?.username || "unknown"}
                          </p>
                          <div className="mt-1">
                            {getConnectionBadge(connection.connectionType)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 tech-gradient text-white border border-purple-400/50"
                        onClick={() =>
                          updateConnectionMutation.mutate({
                            connectionId: connection.id,
                            status: "accepted",
                          })
                        }
                        disabled={updateConnectionMutation.isPending}
                        data-testid={`button-accept-${connection.id}`}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-white/5 border-purple-500/30 text-white hover:bg-red-500/20"
                        onClick={() =>
                          updateConnectionMutation.mutate({
                            connectionId: connection.id,
                            status: "declined",
                          })
                        }
                        disabled={updateConnectionMutation.isPending}
                        data-testid={`button-decline-${connection.id}`}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No pending requests</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4 space-y-3">
            {pendingSent.length > 0 ? (
              pendingSent.map((connection: any) => (
                <Card
                  key={connection.id}
                  className="bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 shadow-xl"
                  data-testid={`sent-${connection.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 tech-gradient rounded-full flex items-center justify-center shadow-lg border border-purple-400/50">
                          {connection.receiver?.profilePicture ? (
                            <img
                              src={connection.receiver.profilePicture}
                              alt={connection.receiver.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {connection.receiver?.name?.[0] || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white" data-testid={`text-receiver-name-${connection.id}`}>
                            {connection.receiver?.name || "Unknown"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            @{connection.receiver?.username || "unknown"}
                          </p>
                          <div className="mt-1 flex gap-2">
                            {getConnectionBadge(connection.connectionType)}
                            <Badge className="bg-yellow-500/20 border-yellow-500/30 text-yellow-300 text-xs">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No sent requests</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}
