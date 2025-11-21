import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Music, MessageCircle, Trash2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SpotifyItem, SpotifyItemComment } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface SpotifyMusicSectionProps {
  userId: number;
  isOwnProfile?: boolean;
}

export default function SpotifyMusicSection({ userId, isOwnProfile = false }: SpotifyMusicSectionProps) {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<SpotifyItem | null>(null);
  const [commentContent, setCommentContent] = useState("");

  const { data: items = [], isLoading: itemsLoading } = useQuery<SpotifyItem[]>({
    queryKey: ["/api/spotify/items", userId],
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<(SpotifyItemComment & { user: any })[]>({
    queryKey: ["/api/spotify/items", selectedItem?.id, "comments"],
    enabled: !!selectedItem,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/spotify/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spotify/items", userId] });
      toast({
        title: "Success",
        description: "Item removed from your profile",
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ itemId, content }: { itemId: number; content: string }) => {
      const response = await apiRequest("POST", `/api/spotify/items/${itemId}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spotify/items", selectedItem?.id, "comments"] });
      setCommentContent("");
      toast({
        title: "Success",
        description: "Comment added!",
      });
    },
  });

  const handleAddComment = () => {
    if (!selectedItem || !commentContent.trim()) return;
    addCommentMutation.mutate({
      itemId: selectedItem.id,
      content: commentContent,
    });
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.itemType]) {
      acc[item.itemType] = [];
    }
    acc[item.itemType].push(item);
    return acc;
  }, {} as Record<string, SpotifyItem[]>);

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "playlist":
        return "Playlists";
      case "top_artist":
        return "Top Artists";
      case "top_track":
        return "Top Tracks";
      default:
        return type;
    }
  };

  if (itemsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg animate-pulse" />
        <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6 text-center">
          <Music className="w-12 h-12 mx-auto mb-3 text-purple-400" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {isOwnProfile 
              ? "Connect your Spotify to share your music!" 
              : "No Spotify music shared yet"}
          </p>
          {isOwnProfile && (
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.href = "/integrations"}
              data-testid="button-connect-spotify"
            >
              Connect Spotify
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([type, typeItems]) => (
        <Card key={type} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-800" data-testid={`card-spotify-${type}`}>
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Music className="w-5 h-5" />
              {getItemTypeLabel(type)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {typeItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                  data-testid={`item-spotify-${item.id}`}
                >
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full aspect-square object-cover rounded-md mb-2"
                    />
                  )}
                  <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1" data-testid={`text-item-name-${item.id}`}>
                    {item.name}
                  </p>
                  {item.metadata && typeof item.metadata === 'object' && 'artist' in item.metadata && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {String(item.metadata.artist)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      data-testid={`button-comment-${item.id}`}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Comment
                    </Button>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItemMutation.mutate(item.id);
                        }}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <Card className="w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="card-comment-modal">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                {selectedItem.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Comments</h3>
                {commentsLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first!</p>
                ) : (
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3" data-testid={`comment-${comment.id}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {comment.user?.profilePicture && (
                            <img src={comment.user.profilePicture} alt={comment.user.name} className="w-6 h-6 rounded-full" />
                          )}
                          <span className="font-medium text-sm text-gray-900 dark:text-white">{comment.user?.name || "Unknown"}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="resize-none"
                  rows={2}
                  data-testid="input-comment"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!commentContent.trim() || addCommentMutation.isPending}
                  size="sm"
                  className="self-end"
                  data-testid="button-submit-comment"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
