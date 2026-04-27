import axios from "axios";


export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Only attempt refresh when we got a 401 and the request wasn't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.clear();
        // avoid forcing navigation in test/jsdom environments
        try {
          window.location.href = "/login";
        } catch (e) {}
        return Promise.reject(error);
      }

      try {
        const res = await api.post("/refresh", { refreshToken });
        console.log("refresh request sent");
        if (res.data.success) {
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // refresh failed
      }

      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default api;
