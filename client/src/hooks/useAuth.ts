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
      console.log("Auth state updated: User is authenticated");
    } else {
      localStorage.removeItem("auth");
      console.log("Auth state updated: User is not authenticated");
    }
  }, [authState]);
  
  // Check authentication state on page load/refresh
  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          setAuthState(authData);
          console.log("Auth state loaded from localStorage");
        } catch (e) {
          console.error("Failed to parse auth data from localStorage");
        }
      }
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting login for user:", username);
      
      const userData = await apiRequest<AuthUser>({
        method: "POST",
        url: "/api/auth/login",
        data: { username, password }
      });
      
      console.log("Login successful, user data:", userData);
      
      const newAuthState = { 
        isAuthenticated: true, 
        username: userData.username, 
        isAdmin: userData.isAdmin,
        userId: userData.id
      };
      
      console.log("Setting new auth state:", newAuthState);
      setAuthState(newAuthState);
      
      // Double-check localStorage is being updated
      setTimeout(() => {
        const storedAuth = localStorage.getItem("auth");
        console.log("Stored auth after login:", storedAuth);
      }, 100);
      
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Login failed:", err);
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