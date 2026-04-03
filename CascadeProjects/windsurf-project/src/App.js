import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { DemoUserProvider } from './demo/DemoUserContext';
import { BottomNav } from './components/BottomNav';
import { Landing } from './pages/Landing';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { ProfileSetup } from './pages/ProfileSetup';
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import { Discover } from './pages/Discover';
import { Chat } from './pages/Chat';
import { Connections } from './pages/Connections';
import { Feed } from './pages/Feed';
import { Events } from './pages/Events';
import { SpotifySync } from './pages/SpotifySync';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { Messages } from './pages/Messages';
import { Post } from './pages/Post';
import { PostDetail } from './pages/PostDetail';
import { NotFound } from './pages/NotFound';

function AppLayout({ children }) {
  const location = useLocation();
  const hideNavOnSetup = location.pathname.startsWith('/app/setup');

  return (
    <div className="app-root">
      <div className="app-shell">
        <main className="app-main">{children}</main>
        {!hideNavOnSetup && <BottomNav />}
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-root">
        <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p className="caption">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <DemoUserProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />

          <Route
            path="/app/*"
            element={
              <RequireAuth>
                <AppLayout>
                  <Routes>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="setup" element={<ProfileSetup />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="discover" element={<Discover />} />
                    <Route path="chat/:id" element={<Chat />} />
                    <Route path="connections" element={<Connections />} />
                    <Route path="feed" element={<Feed />} />
                    <Route path="events" element={<Events />} />
                    <Route path="spotify" element={<SpotifySync />} />
                    <Route path="integrations" element={<Integrations />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="post" element={<Post />} />
                    <Route path="post/:id" element={<PostDetail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </RequireAuth>
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

