import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true, //allow cookies/session headers
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("Axios error", error.response, localStorage);
      // Handle 401 (Unauthorized) or 403 (Forbidden) errors
      if (error.response.status === 401 || error.response.status === 403) {
        console.log("***removing localStorage");
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("empData");

        // Show error message
        toast.error("Session expired. Please login again.");

        // Dispatch custom event for navigation
        window.dispatchEvent(new CustomEvent("auth:sessionTimeout"));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
