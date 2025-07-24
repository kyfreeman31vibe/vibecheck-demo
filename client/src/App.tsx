import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import ProfileSetup from "@/pages/profile-setup";
import Discover from "@/pages/discover";
import Match from "@/pages/match";
import Matches from "@/pages/matches";
import Chat from "@/pages/chat";
import Events from "@/pages/events";
import Integrations from "@/pages/integrations";

function Router() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <Switch>
      <Route path="/">
        {currentUser ? (
          <Dashboard currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/dashboard">
        {currentUser ? (
          <Dashboard currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/profile">
        {currentUser ? (
          <Profile currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/messages">
        {currentUser ? (
          <Messages currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/setup" component={ProfileSetup} />
      <Route path="/discover" component={Discover} />
      <Route path="/match/:matchId" component={Match} />
      <Route path="/matches">
        {currentUser ? (
          <Matches currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/chat/:matchId" component={Chat} />
      <Route path="/events">
        {currentUser ? (
          <Events currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/integrations" component={Integrations} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vibecheck-theme">
        <TooltipProvider>
          <div className="max-w-md mx-auto bg-white dark:bg-gray-900 shadow-2xl min-h-screen relative overflow-hidden transition-colors duration-300">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
