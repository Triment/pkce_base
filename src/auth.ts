import { createRemoteJWKSet, jwtVerify } from 'jose';
import PKCE from 'js-pkce';
// URL constructor is globally available in modern browsers/environments

// --- Configuration ---
const AUTH_DOMAIN = 'openid.nmmm.top'; // Define domain centrally
const WEB_CLIENT_ID = 'f9b1d60f-f1df-43b6-9787-bb6d91fc81d4';
const DESKTOP_CLIENT_ID = '5c86e993-1d56-498d-b461-514f7ee88ca7';
const WEB_REDIRECT_URI = 'http://localhost:1420/login/callback'; // Ensure this matches your dev server
const DESKTOP_REDIRECT_URI = 'games-helper://localhost/'; // Custom scheme for Tauri

// --- Platform Detection ---
type Platform = 'web' | 'desktop';

export const getPlatform = (): Platform => {
  // 检查window对象上是否存在__TAURI__属性
  return typeof window !== 'undefined' && '__TAURI__' in window ? 'desktop' : 'web';
};

// --- PKCE Setup ---
const platform = getPlatform();
const CLIENT_ID = platform === 'web' ? WEB_CLIENT_ID : DESKTOP_CLIENT_ID;
const REDIRECT_URI = platform === 'web' ? WEB_REDIRECT_URI : DESKTOP_REDIRECT_URI;

const pkceInstance = new PKCE({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  authorization_endpoint: `https://${AUTH_DOMAIN}/authorize`,
  token_endpoint: `https://${AUTH_DOMAIN}/api/token`,
  revoke_endpoint: `https://${AUTH_DOMAIN}/api/end-session`,
  requested_scopes: 'openid email', // Add other scopes if needed
  storage: typeof sessionStorage !== 'undefined' ? sessionStorage : undefined // Use sessionStorage only in web
});

// --- Public Functions ---

/**
 * Generates the authorization URL to redirect the user for login.
 */
export const getAuthUrl = (): string => {
  return pkceInstance.authorizeUrl();
};

/**
 * Exchanges the authorization code from the redirect URL for an access token.
 * @param url The full redirect URL containing the authorization code.
 */
export const exchangeToken = async (url: string) => {
  // Note: js-pkce automatically handles storage and retrieval of code_verifier
  return await pkceInstance.exchangeForAccessToken(url);
};

/**
 * Attempts to refresh the access token using a refresh token.
 * @param refreshToken The refresh token to use.
 * @returns The new token response object (similar to exchangeToken).
 */
export const refreshTokenFlow = async (refreshToken: string) => {
  const tokenEndpoint = `https://${AUTH_DOMAIN}/api/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  params.append('client_id', CLIENT_ID);
  // Note: PKCE code_verifier is NOT sent during refresh token grant

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error details
      console.error('Refresh token request failed:', response.status, errorData);
      throw new Error(`Failed to refresh token: ${response.status} ${errorData.error_description || response.statusText}`);
    }

    const tokenData = await response.json();
    // The response should contain new access_token, potentially a new refresh_token, expires_in, etc.
    return tokenData;
  } catch (error) {
    console.error('Error during token refresh:', error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

// --- Token Verification ---

// Create a remote JWK set instance pointing to the provider's JWKS endpoint
const JWKS_URL = new URL(`https://${AUTH_DOMAIN}/api/jwks`);
const JWKS = createRemoteJWKSet(JWKS_URL);

/**
 * Verifies the ID token using the dynamically fetched public keys.
 * @param id_token The ID token received after successful authentication.
 */
export async function verifyToken(id_token: string) {
  try {
    const { payload } = await jwtVerify(id_token, JWKS, {
      algorithms: ['ES256'], // Specify allowed algorithms
      issuer: `https://${AUTH_DOMAIN}`, // Expected issuer
      audience: CLIENT_ID // Expected audience (client ID)
    });
    console.log('Token verified successfully. Payload:', payload);
    return payload; // Return the verified token payload
  } catch (error) {
    console.error('Token verification failed:', error);
    // Consider more specific error handling or re-throwing
    throw new Error(`Token verification failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
