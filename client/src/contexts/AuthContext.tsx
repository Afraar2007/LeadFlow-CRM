import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User, AuthState, LoginRequest, RegisterRequest } from '@/types/auth';
import { authApi } from '@/api/authApi';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Use ref to track if initialization is in progress
  const initInProgressRef = useRef(false);

  const setAuth = useCallback((user: User, accessToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ user, accessToken, isAuthenticated: true, isLoading: false });
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  }, []);

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initInProgressRef.current) return;
    initInProgressRef.current = true;

    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            // Verify token is still valid
            const user = await authApi.getMe();
            setState({ user, accessToken: token, isAuthenticated: true, isLoading: false });
            return; // Success - don't fall through to loading=false
          } catch (error) {
            // Token expired or invalid - clear auth
            console.debug('Auth token validation failed, clearing auth');
            clearAuth();
          }
        } else {
          // No stored auth - set loading to false
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } finally {
        // Ensure loading state is cleared (only reached if initAuth didn't return early)
        setState((prev) => {
          // Don't override isAuthenticated if it was already set to true
          if (prev.isAuthenticated) return prev;
          return { ...prev, isLoading: false };
        });
      }
    };

    initAuth();
  }, [clearAuth]);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      // Explicitly set loading state before API call
      setState((prev) => ({ ...prev, isLoading: true }));
      
      // Validate that response contains expected data before proceeding
      const response = await authApi.login(data);
      
      if (!response || !response.accessToken || !response.user) {
        throw new Error('Invalid response from server - missing authentication data');
      }
      
      const { user, accessToken } = response;
      
      // Update auth state - this ensures context subscribers are notified
      setAuth(user, accessToken);
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [setAuth]);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const { user, accessToken } = await authApi.register(data);
      setAuth(user, accessToken);
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}