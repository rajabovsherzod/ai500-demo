import apiClient from "../lib/api-client";
import { LoginPayload, LoginResponse } from "../types/auth";

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  // "/auth/login" bo'lishi shart (boshida slash bilan)
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
};