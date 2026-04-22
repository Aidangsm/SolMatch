import axios from "axios";

const BASE = window.location.hostname === "localhost"
  ? "http://localhost:3001/api"
  : "https://backend-production-fa44.up.railway.app/api";

export const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // sends httpOnly refresh-token cookie automatically
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        // Cookie is sent automatically — no body needed
        const refreshBase = window.location.hostname === "localhost"
          ? "http://localhost:3001/api"
          : "https://backend-production-fa44.up.railway.app/api";
        const { data } = await axios.post(`${refreshBase}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem("accessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        queue.forEach((cb) => cb(data.accessToken));
        queue = [];
        return api(original);
      } catch {
        localStorage.removeItem("accessToken");
        queue = [];
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);
