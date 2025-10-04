import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data.tokens;
          Cookies.set("accessToken", accessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, clear tokens but don't redirect during initialization
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        // Only redirect if we're not in the initial auth check
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          // Small delay to avoid redirect during initialization
          setTimeout(() => {
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }, 100);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
