import apiClient from "../lib/api-client";
import { LoginPayload, LoginResponse, User } from "../types/auth";

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  // "/auth/login" bo'lishi shart (boshida slash bilan)
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
};

export const whoAmI = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/whoami");
  return response.data;
};