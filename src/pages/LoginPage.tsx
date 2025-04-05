import React from 'react';
import { Button } from '@heroui/react'; // Assuming Button is the correct import
// Removed icon import for now
import { getAuthUrl } from '../auth'; // Adjust path if needed

const LoginPage: React.FC = () => {
  const handleLogin = () => {
    const authUrl = getAuthUrl();
    window.location.href = authUrl; // Redirect user to the auth provider
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-6">Welcome</h1>
        <p className="text-gray-600 mb-8">Please log in to continue to your dashboard.</p>
        <Button
          color="primary" // Adjust color/variant as per HeroUI docs
          onPress={handleLogin}
          className="inline-flex items-center gap-2" // Keep styling for potential future icon
        >
          {/* Removed icon usage for now */}
          Log In
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
