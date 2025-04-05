import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils'; // For persisting userInfo

// --- User Info State ---

type UserInfo = {
  username: string;
  avatar: string;
  email: string;
};

// Use atomWithStorage to persist userInfo in localStorage
export const userInfoAtom = atomWithStorage<UserInfo | null>('userInfo', null);

// --- Identity State ---

type Identity = {
  AccessToken: string;
  TokenType: string;
  ExpiresIn: number; // Store as timestamp (Date.now() + expiresIn * 1000)
  IDToken: string;
  RefreshToken: string;
};

const initialIdentity: Identity = {
  AccessToken: '',
  TokenType: '',
  ExpiresIn: 0,
  IDToken: '',
  RefreshToken: '',
};

// Use atomWithStorage to persist identity information in localStorage
export const identityAtom = atomWithStorage<Identity>('identity', initialIdentity);

// --- Auth Loading State ---
// Atom to track if the initial authentication check/refresh is in progress
export const authLoadingAtom = atom<boolean>(true); // Start as true

// --- Derived Atoms ---

// Atom to check if the user is authenticated
export const isAuthenticatedAtom = atom<boolean>((get) => {
  const identity = get(identityAtom);
  // Check if token exists and hasn't expired
  return !!identity.AccessToken && identity.ExpiresIn > Date.now();
});

// Atom to get the ID token
export const idTokenAtom = atom<string>((get) => get(identityAtom).IDToken);

// Atom to get the Access token
export const accessTokenAtom = atom<string>((get) => get(identityAtom).AccessToken);

// Atom to get the token type
export const tokenTypeAtom = atom<string>((get) => get(identityAtom).TokenType);

// --- Helper Functions (can be used with useSetAtom) ---

// Helper to create the Identity object from a login response
export const createIdentityFromResponse = (response: any): Identity => {
  if (!response) return initialIdentity;
  return {
    AccessToken: response.access_token || '',
    TokenType: response.token_type || 'Bearer',
    // Calculate expiry timestamp immediately
    ExpiresIn: response.expires_in ? Date.now() + response.expires_in * 1000 : 0,
    IDToken: response.id_token || '',
    RefreshToken: response.refresh_token || '',
  };
};

// Helper to get the initial identity state (e.g., for clearing)
export const getInitialIdentity = (): Identity => initialIdentity;
