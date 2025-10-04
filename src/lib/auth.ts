import api from "./api";
import Cookies from "js-cookie";
import { LoginCredentials, RegisterData, AuthResponse, User } from "@/types";

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Add timeout to prevent infinite loading
    const response = await Promise.race([
      api.post("/auth/login", credentials),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Login request timeout")), 10000)
      ),
    ]);

    const { user, tokens } = response.data.data;
    const { accessToken, refreshToken } = tokens;

    // Store tokens in cookies
    Cookies.set("accessToken", accessToken, { expires: 1 }); // 1 day
    Cookies.set("refreshToken", refreshToken, { expires: 7 }); // 7 days

    return { user, accessToken, refreshToken };
  },

  // Register user
  async register(userData: RegisterData): Promise<AuthResponse> {
    // Add timeout to prevent infinite loading
    const response = await Promise.race([
      api.post("/auth/register", userData),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Register request timeout")), 10000)
      ),
    ]);

    const { user, tokens } = response.data.data;
    const { accessToken, refreshToken } = tokens;

    // Store tokens in cookies
    Cookies.set("accessToken", accessToken, { expires: 1 });
    Cookies.set("refreshToken", refreshToken, { expires: 7 });

    return { user, accessToken, refreshToken };
  },

  // Get user profile
  async getProfile(): Promise<User> {
    // Add timeout to prevent infinite loading
    const response = await Promise.race([
      api.get("/auth/profile"),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Profile request timeout")), 5000)
      ),
    ]);

    return response.data.data.user;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = Cookies.get("accessToken");
    return !!token;
  },

  // Get current user from token (basic implementation)
  getCurrentUser(): User | null {
    const token = Cookies.get("accessToken");
    if (!token) return null;

    try {
      // In a real app, you might decode the JWT token
      // For now, we'll return null and fetch from API
      return null;
    } catch {
      return null;
    }
  },
};
