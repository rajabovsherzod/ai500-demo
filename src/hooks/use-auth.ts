import { useState, useCallback } from 'react';
import { login as loginApi } from '../api/auth.api';
import { LoginPayload, LoginResponse, User, AuthState } from '../types/auth';
import { AxiosError } from 'axios';

// Xatolarni o'qish uchun yordamchi
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as any;
    if (data?.detail && typeof data.detail === 'string') return data.detail;
    if (data?.detail && Array.isArray(data.detail)) return data.detail[0]?.msg || "Xatolik";
  }
  return "Server bilan aloqa yo'q";
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  
  // State ni to'g'ridan-to'g'ri LocalStorage dan initsializatsiya qilamiz
  const [authData, setAuthData] = useState<AuthState>(() => {
    const token = localStorage.getItem("agroai_token");
    const userJson = localStorage.getItem("agroai_user");
    let user = null;
    try {
       user = userJson ? JSON.parse(userJson) : null;
    } catch (e) {
      // JSON buzuq bo'lsa tozalaymiz
      localStorage.removeItem("agroai_token");
      localStorage.removeItem("agroai_user");
    }
    return { user, token };
  });

  // --- LOGIN ---
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const payload: LoginPayload = { email, password };
      const result: LoginResponse = await loginApi(payload);
      
      // Tokenlarni saqlaymiz
      localStorage.setItem("agroai_token", result.access_token);
      localStorage.setItem("agroai_user", JSON.stringify(result.user));
      
      setAuthData({ user: result.user, token: result.access_token });
      return result;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // --- LOGOUT (Siz so'ragan qism) ---
  const logout = useCallback(() => {
    // 1. Tokenni o'chiramiz
    localStorage.removeItem("agroai_token");
    localStorage.removeItem("agroai_user");
    
    // 2. Statni tozalaymiz
    setAuthData({ user: null, token: null });

    // 3. AuthContext bo'lmagani uchun, brauzerni majburan Login sahifasiga yuboramiz.
    // Bu eng ishonchli yo'l (Contextsiz ishlaganda).
    window.location.href = "/login";
  }, []);

  return {
    ...authData,
    loading,
    login,
    logout,
    // Agar token bor bo'lsa true qaytadi
    isAuthenticated: !!authData.token,
  };
};