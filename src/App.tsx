import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isAuthenticated } from './state'; // Import Recoil state for auth check

// Import Pages and ProtectedRoute from the separate games-helper directory
// Use default imports as components are likely exported using 'export default'

/**
 * Root component responsible for setting up application routes.
 */
export const App = () => {
  const isAuth = useRecoilValue(isAuthenticated);

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
