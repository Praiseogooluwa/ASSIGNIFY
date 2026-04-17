import axios from "axios";
import { API_BASE } from "@/config";

// ─── Admin API instance ───────────────────────────────────────────────────────
// Separate instance — attaches ap_admin_token only, NEVER the lecturer token
// Import this in AdminDashboard and AdminLogin instead of the default api
export const adminApi = axios.create({
  baseURL: API_BASE,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("ap_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin") && currentPath !== "/admin/x9p2k/login") {
        localStorage.removeItem("ap_admin_token");
        window.location.href = "/admin/x9p2k/login";
      }
    }
    return Promise.reject(error);
  }
);

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ap_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on an auth page or admin page — prevents refresh loop
      const isAuthPage = ["/login", "/register", "/forgot-password"].includes(currentPath);
      const isAdminPage = currentPath.startsWith("/admin");
      const isSubmitPage = currentPath.startsWith("/submit");

      if (!isAuthPage && !isAdminPage && !isSubmitPage) {
        localStorage.removeItem("ap_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const downloadBlob = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};