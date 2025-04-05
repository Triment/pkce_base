import { useSetAtom } from 'jotai'; // Use Jotai hook
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeToken } from '../auth'; // Adjust path if needed
import { createIdentityFromResponse, identityAtom } from '../state'; // Import Jotai atom and helper
// Consider importing a Spinner component from @heroui/react if available
// import { Spinner } from '@heroui/react';

const LoginCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const setIdentity = useSetAtom(identityAtom); // Get the Jotai setter function
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processTokenExchange = async () => {
      const currentUrl = window.location.href;
      // Basic check if the URL likely contains the code from the redirect
      if (!currentUrl.includes('code=') || !currentUrl.includes('state=')) {
          setError('Invalid callback URL. Missing authorization code or state.');
          setLoading(false);
          // Optionally redirect back to login after a delay
          // setTimeout(() => navigate('/login', { replace: true }), 3000);
          return;
      }

      try {
        const tokenResponse = await exchangeToken(currentUrl);
        // Assuming exchangeToken throws on error or returns a falsy value/error structure
        if (tokenResponse) {
          const newIdentity = createIdentityFromResponse(tokenResponse); // Use helper to create identity object
          setIdentity(newIdentity); // Update Jotai state
          navigate('/dashboard', { replace: true }); // Redirect to dashboard on success
        } else {
          // Handle cases where exchangeToken might resolve successfully but indicate failure
          setError('Failed to exchange token. Response was invalid.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Token exchange failed:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred during login.');
        setLoading(false);
        // Optionally redirect back to login after a delay
        // setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    processTokenExchange();
  }, [navigate, setIdentity]); // Update dependencies for useEffect

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        {loading && (
          <div>
            {/* Placeholder for a spinner */}
            {/* <Spinner className="h-8 w-8 text-blue-500 mx-auto mb-4" /> */}
            <p className="text-lg font-semibold animate-pulse">Processing login...</p>
          </div>
        )}
        {error && (
          <div>
            <h2 className="text-xl font-semibold text-red-600 mb-4">Login Failed</h2>
            <p className="text-gray-700">{error}</p>
            {/* Optionally add a button to retry or go back to login */}
            {/* <Button onClick={() => navigate('/login')} className="mt-4">Go to Login</Button> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginCallbackPage;
