import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { DemoUserProvider } from './demo/DemoUserContext';
import { BottomNav } from './components/BottomNav';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ProfileSetup } from './pages/ProfileSetup';
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import { Discover } from './pages/Discover';
import { Match } from './pages/Match';
import { Matches } from './pages/Matches';
import { Chat } from './pages/Chat';
import { Connections } from './pages/Connections';
import { Feed } from './pages/Feed';
import { Events } from './pages/Events';
import { SpotifySync } from './pages/SpotifySync';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { Messages } from './pages/Messages';
import { NotFound } from './pages/NotFound';
import './index.css';

function AppLayout({ children }) {
  return (
    <div className="app-root">
      <div className="app-shell">
        <main className="app-main">{children}</main>
        <p className="caption" style={{ marginTop: 4, textAlign: 'center' }}>
          Demo mode: data lives only on this device. Spotify, events, and chat use sample data.
        </p>
        <BottomNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DemoUserProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
        <Route
          path="/app/*"
          element={
            <AppLayout>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="setup" element={<ProfileSetup />} />
                <Route path="profile" element={<Profile />} />
                <Route path="discover" element={<Discover />} />
                <Route path="match/:id" element={<Match />} />
                <Route path="matches" element={<Matches />} />
                <Route path="chat/:id" element={<Chat />} />
                <Route path="connections" element={<Connections />} />
                <Route path="feed" element={<Feed />} />
                <Route path="events" element={<Events />} />
                <Route path="spotify" element={<SpotifySync />} />
                <Route path="integrations" element={<Integrations />} />
                <Route path="settings" element={<Settings />} />
                <Route path="messages" element={<Messages />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          }
        />
          <Route path="/u/:username" element={<PublicProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DemoUserProvider>
    </ThemeProvider>
  );
}

export default App;
