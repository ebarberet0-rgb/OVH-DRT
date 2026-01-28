import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DEALER' | 'INSTRUCTOR';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Use environment variable for API URL
        const apiUrl = import.meta.env.VITE_API_URL;

        if (!apiUrl) {
          throw new Error(
            'Configuration error: VITE_API_URL is not defined.'
          );
        }

        try {
          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            // Provide more specific error feedback
            if (response.status === 401 || response.status === 404) {
              throw new Error('Identifiants ou mot de passe incorrects.');
            }
            throw new Error(
              `Erreur du serveur (code: ${response.status}). Veuillez réessayer.`
            );
          }

          const data = await response.json();

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login error:', error);
          // Re-throw the error to be caught by the component
          if (error instanceof Error && error.message.startsWith('NetworkError')) {
            throw new Error("Erreur réseau. L'API est-elle accessible ?");
          }
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'tablet-auth-storage',
    }
  )
);
