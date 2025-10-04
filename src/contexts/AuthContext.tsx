"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { authService } from "@/lib/auth";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "admin" | "teacher" | "student"
  ) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log("AuthContext: Timeout reached, setting loading to false");
        setLoading(false);
      }, 2000); // 2 second timeout

      try {
        if (authService.isAuthenticated()) {
          try {
            const userData = await authService.getProfile();
            setUser(userData);
          } catch (error) {
            console.error("AuthContext: Failed to get user profile:", error);
            // Clear invalid tokens silently - don't redirect during initialization
            Cookies.remove("accessToken");
            Cookies.remove("refreshToken");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("AuthContext: Error during initialization:", error);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      return { user: response.user };
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "admin" | "teacher" | "student"
  ) => {
    try {
      const response = await authService.register({
        name,
        email,
        password,
        role,
      });
      setUser(response.user);
      return { user: response.user };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
