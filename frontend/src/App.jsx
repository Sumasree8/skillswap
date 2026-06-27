import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Spinner } from './components/ui';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import SwapsPage from './pages/SwapsPage';
import SwapDetailPage from './pages/SwapDetailPage';
import SessionsPage from './pages/SessionsPage';
import CirclesPage from './pages/CirclesPage';
import CreditsPage from './pages/CreditsPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';

// Show spinner while auth state is being determined (initial load only)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-0">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not loading and no user → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Redirect already-authenticated users away from login/register
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-0">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/discover" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/discover" replace />} />

          {/* Auth pages - redirect to /discover if already logged in */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Protected App shell */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/swaps" element={<SwapsPage />} />
            <Route path="/swaps/:id" element={<SwapDetailPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/circles" element={<CirclesPage />} />
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users/:id" element={<UserProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/discover" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
