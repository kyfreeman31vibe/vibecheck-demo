import { Play, Heart, Music } from "lucide-react";
import { getSharedInterests } from "@/lib/music-compatibility";
import { useEffect, useState } from "react";

interface ProfileCardProps {
  user: any; // Extended user with compatibility data
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(userData);
  }, []);

  if (!currentUser) return null;

  const sharedInterests = getSharedInterests(currentUser, user);

  return (
    <div className="relative bg-gray-800/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-xl overflow-hidden h-full">
      {/* Profile Image */}
      <div className="relative h-2/3">
        <div className="w-full h-full tech-gradient flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-32 h-32 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-purple-400/50">
              <span className="text-6xl font-bold">{user.name?.[0] || "?"}</span>
            </div>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Music Compatibility Badge */}
        <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-2 flex items-center space-x-2 border border-purple-500/30">
          <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse-slow"></div>
          <span className="text-sm font-semibold text-white">
            {user.compatibilityScore}% Match
          </span>
        </div>

        {/* Currently Playing */}
        <div className="absolute bottom-4 left-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-xl p-3 border border-purple-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 tech-gradient rounded-lg flex items-center justify-center border border-purple-400/50">
              <Play className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.favoriteSongs?.[0] || "Bohemian Rhapsody"}
              </p>
              <p className="text-xs text-gray-300 truncate">
                {user.favoriteArtists?.[0] || "Queen"}
              </p>
            </div>
            <Heart className="w-4 h-4 text-coral-400" />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-white">
            {user.name}, {user.age}
          </h2>
          <div className="flex items-center space-x-1">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">
              {user.location || "Nearby"}
            </span>
          </div>
        </div>

        {/* Shared Music Interests */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            You both love:
          </h3>
          <div className="flex flex-wrap gap-2">
            {sharedInterests.length > 0 ? (
              sharedInterests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 tech-gradient text-white rounded-full text-xs font-medium border border-purple-400/50"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-gray-700/40 border border-purple-500/30 text-gray-300 rounded-full text-xs font-medium">
                Music
              </span>
            )}
          </div>
        </div>

        {/* Music Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-purple-400">
              {user.favoriteGenres?.length || 0}
            </p>
            <p className="text-xs text-gray-400">Genres</p>
          </div>
          <div>
            <p className="text-lg font-bold text-cyan-400">
              {user.favoriteArtists?.length || 0}
            </p>
            <p className="text-xs text-gray-400">Artists</p>
          </div>
          <div>
            <p className="text-lg font-bold text-lime-400">
              {Math.floor(Math.random() * 20) + 5}
            </p>
            <p className="text-xs text-gray-400">Concerts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
