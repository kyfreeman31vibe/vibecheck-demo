import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Music } from "lucide-react";

export default function Match() {
  const [, setLocation] = useLocation();
  const { matchId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);
  }, []);

  const handleSendMessage = () => {
    setLocation(`/chat/${matchId}`);
  };

  const handleKeepSwiping = () => {
    setLocation("/discover");
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative h-screen music-gradient flex flex-col items-center justify-center text-white p-6">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      <div className="relative z-10 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 animate-bounce">It's a Match!</h1>
          <p className="text-lg opacity-90">You both love the same music</p>
        </div>

        {/* Matched Profiles */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {/* User's photo */}
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-music-purple to-music-pink flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {currentUser.name?.[0] || "U"}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Heart className="w-8 h-8 mb-2 animate-pulse text-white" />
            <span className="text-sm font-semibold">94% Music Match</span>
          </div>

          {/* Match's photo */}
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-music-orange to-music-pink flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
        </div>

        {/* Shared Song */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-8 max-w-sm">
          <p className="text-sm opacity-90 mb-2">You both have this on repeat:</p>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Bohemian Rhapsody</p>
              <p className="text-sm opacity-75">Queen</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Button
            onClick={handleSendMessage}
            className="w-full bg-white text-purple-600 font-semibold py-4 rounded-full shadow-lg hover:bg-white/90"
          >
            Send Message
          </Button>
          <Button
            onClick={handleKeepSwiping}
            variant="outline"
            className="w-full border-2 border-white text-white font-semibold py-4 rounded-full hover:bg-white/10"
          >
            Keep Swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
