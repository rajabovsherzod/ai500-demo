import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// URL oxiridagi ortiqcha slashni olib tashlaymiz
const BASE_URL = API_BASE_URL.replace(/\/$/, "");

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Render serveri sekin uyg'onishi mumkin, vaqtni 30s qildik
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agroai_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const { response, config } = error;

    // 401 Unauthorized
    if (response?.status === 401) {
      // Agar so'rov login sahifasidan ketgan bo'lsa, redirect QILMAYMIZ.
      // Shunda foydalanuvchi "Parol xato" degan xabarni ko'ra oladi.
      const isLoginRequest = config?.url?.includes("/auth/login");

      if (!isLoginRequest) {
        localStorage.removeItem("agroai_token");
        localStorage.removeItem("agroai_user");
        
        // Sahifani to'liq yangilash yoki login ga yo'naltirish
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;