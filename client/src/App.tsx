import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import ProfileSetup from "@/pages/profile-setup";
import Discover from "@/pages/discover";
import Match from "@/pages/match";
import Matches from "@/pages/matches";
import Chat from "@/pages/chat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/setup" component={ProfileSetup} />
      <Route path="/discover" component={Discover} />
      <Route path="/match/:matchId" component={Match} />
      <Route path="/matches" component={Matches} />
      <Route path="/chat/:matchId" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="max-w-md mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
