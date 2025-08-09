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
    <div className="fixed bottom-0 left-0 right-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl border-t border-white/20 dark:border-white/10 shadow-2xl">
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
                className={`flex flex-col items-center space-y-1 p-2 h-auto min-w-0 transition-all duration-300 ${
                  isActive 
                    ? "text-white bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl shadow-lg" 
                    : "text-white/70 hover:text-white hover:bg-white/10 dark:text-white/60 dark:hover:text-white rounded-xl"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
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