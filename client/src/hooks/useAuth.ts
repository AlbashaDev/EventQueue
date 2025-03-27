import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: number;
  username: string;
  isAdmin: boolean;
  isApproved: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  isAdmin: boolean;
  userId: number | null;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check if user is already logged in
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (e) {
        return { 
          isAuthenticated: false, 
          username: null, 
          isAdmin: false,
          userId: null
        };
      }
    }
    return { 
      isAuthenticated: false, 
      username: null, 
      isAdmin: false,
      userId: null
    };
  });

  // Update localStorage when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem("auth", JSON.stringify(authState));
    } else {
      localStorage.removeItem("auth");
    }
  }, [authState]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await apiRequest<AuthUser>({
        method: "POST",
        url: "/api/auth/login",
        data: { username, password }
      });
      
      setAuthState({ 
        isAuthenticated: true, 
        username: userData.username, 
        isAdmin: userData.isAdmin,
        userId: userData.id
      });
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "Login failed");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setAuthState({ 
      isAuthenticated: false, 
      username: null, 
      isAdmin: false,
      userId: null
    });
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
    isAdmin: authState.isAdmin,
    userId: authState.userId,
    isLoading,
    error,
    login,
    logout,
    requireAuth
  };
}