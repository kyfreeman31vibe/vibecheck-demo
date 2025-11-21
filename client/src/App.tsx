import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
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
import Settings from "@/pages/settings";
import PublicProfile from "@/pages/public-profile";
import Connections from "@/pages/connections";
import SpotifySync from "@/pages/spotify-sync";

function Router() {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
      <Route path="/discover">
        {currentUser ? (
          <Discover currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/match/:matchId">
        {currentUser ? (
          <Match currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/matches">
        {currentUser ? (
          <Matches currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/chat/:matchId">
        {currentUser ? (
          <Chat currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/events">
        {currentUser ? (
          <Events currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/integrations">
        {currentUser ? (
          <Integrations currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/settings">
        {currentUser ? (
          <Settings currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/u/:username" component={PublicProfile} />
      <Route path="/connections">
        {currentUser ? (
          <Connections currentUser={currentUser} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/spotify-sync">
        {currentUser ? (
          <SpotifySync />
        ) : (
          <Landing />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vibecheck-theme">
        <TooltipProvider>
          <AuthProvider>
            <div className="max-w-md mx-auto bg-white dark:bg-gray-900 shadow-2xl min-h-screen relative overflow-hidden transition-colors duration-300">
              <Toaster />
              <Router />
            </div>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
