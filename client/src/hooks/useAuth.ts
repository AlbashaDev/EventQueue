import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// Default admin credentials
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "jobbtorg2023";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check if user is already logged in
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (e) {
        return { isAuthenticated: false, username: null };
      }
    }
    return { isAuthenticated: false, username: null };
  });

  // Update localStorage when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem("auth", JSON.stringify(authState));
    } else {
      localStorage.removeItem("auth");
    }
  }, [authState]);

  const login = (username: string, password: string): boolean => {
    // Validate credentials - in a real app, this would be an API call
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      setAuthState({ isAuthenticated: true, username });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, username: null });
    setLocation("/");
  };

  const requireAuth = (callback: () => void) => {
    if (!authState.isAuthenticated) {
      setLocation("/login");
    } else {
      callback();
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    username: authState.username,
    login,
    logout,
    requireAuth
  };
}