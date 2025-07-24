import { useLocation } from "wouter";
import { Home, Heart, MessageCircle, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  currentUser: any;
}

export default function BottomNavigation({ currentUser }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();

  if (!currentUser) return null;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/matches", icon: Heart, label: "Matches" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/events", icon: Calendar, label: "Events" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center space-y-1 p-2 h-auto min-w-0 ${
                  isActive 
                    ? "text-music-purple" 
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}