import React, { useEffect } from 'react'; // Import useEffect
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai'; // Import useAtom, useSetAtom
import {
  identityAtom,
  isAuthenticatedAtom,
  authLoadingAtom,
  createIdentityFromResponse,
  getInitialIdentity,
} from './state'; // Import necessary atoms and helpers
import { refreshTokenFlow } from './auth'; // Import refresh function
import LoginPage from './pages/LoginPage';
import LoginCallbackPage from './pages/LoginCallbackPage';
import DashboardPage from './pages/DashboardPage'; // Assuming default exports
import ProtectedRoute from './components/ProtectedRoute'; // Assuming default export

/**
 * Root component responsible for setting up application routes.
 */
export const App = () => {
  const isAuth = useAtomValue(isAuthenticatedAtom);
  const [identity, setIdentity] = useAtom(identityAtom); // Get identity state and setter
  const setAuthLoading = useSetAtom(authLoadingAtom); // Get loading state setter

  // Effect to check auth state and attempt refresh on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if access token is expired but refresh token exists
      if (!isAuth && identity.RefreshToken && identity.ExpiresIn <= Date.now()) {
        console.log('Access token expired, attempting refresh...');
        try {
          const refreshedTokenData = await refreshTokenFlow(identity.RefreshToken);
          const newIdentity = createIdentityFromResponse(refreshedTokenData);
          setIdentity(newIdentity); // Update state with fresh tokens
          console.log('Token refresh successful.');
        } catch (error) {
          console.error('Token refresh failed, clearing identity:', error);
          setIdentity(getInitialIdentity()); // Clear tokens on refresh failure
        }
      }
      // Mark initialization as complete regardless of outcome
      setAuthLoading(false);
    };

    initializeAuth();
    // Run only once on mount, dependencies ensure correct state access
  }, [isAuth, identity, setIdentity, setAuthLoading]);


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/callback" element={<LoginCallbackPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Root Redirect Logic */}
      <Route
        path="/"
        element={
          isAuth ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Optional: Catch-all route for 404 Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
      {/* Or render a dedicated 404 component: <Route path="*" element={<NotFoundPage />} /> */}

    </Routes>
  );
};
