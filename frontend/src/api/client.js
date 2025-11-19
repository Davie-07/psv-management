import axios from "axios";
import { sanitizeError } from "../utils/security.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 30000, // 30 second timeout
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("td_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to sanitize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sanitize error before passing to components
    const sanitizedError = {
      ...error,
      message: sanitizeError(error),
    };
    return Promise.reject(sanitizedError);
  }
);

export const parcelClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 30000,
});

parcelClient.interceptors.request.use(
  (config) => {
    const parcelToken = sessionStorage.getItem("td_parcel_token");
    if (parcelToken) {
      config.headers["x-parcel-token"] = parcelToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

parcelClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const sanitizedError = {
      ...error,
      message: sanitizeError(error),
    };
    return Promise.reject(sanitizedError);
  }
);

export default api;


