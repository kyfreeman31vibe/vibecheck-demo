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
      label: "Matches",
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
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-purple-300 dark:border-purple-600 shadow-xl transition-colors duration-300" style={{ zIndex: 1000, minHeight: '80px' }}>
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex justify-around items-center">
          {navItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 py-2 px-3 rounded-lg transition-all duration-300 min-w-[60px] ${
                item.isActive 
                  ? "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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