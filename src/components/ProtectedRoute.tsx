import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai/react';
import { isAuthenticatedAtom, authLoadingAtom } from '../state'; // Import authLoadingAtom

// Placeholder for a loading component/spinner
const LoadingIndicator: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <p className="text-lg animate-pulse">Loading authentication...</p>
  </div>
);

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isLoading = useAtomValue(authLoadingAtom);
  const isAuth = useAtomValue(isAuthenticatedAtom);

  if (isLoading) {
    // Show loading indicator while checking auth/refreshing token
    return <LoadingIndicator />;
  }

  if (!isAuth) {
    // User not authenticated after loading, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User authenticated, render the child components
  return <>{children}</>;
};

export default ProtectedRoute;
