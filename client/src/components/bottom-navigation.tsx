import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, MessageCircle, Heart, Calendar } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      path: "/setup",
      isActive: location === "/setup"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: "Messages",
      path: "/matches",
      isActive: location === "/matches" || location.startsWith("/chat")
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Discover",
      path: "/discover",
      isActive: location === "/discover" || location.startsWith("/match")
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Events",
      path: "/events",
      isActive: location === "/events"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                item.isActive 
                  ? "text-music-purple bg-music-purple/10" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}