import apiClient from "./api-client";
import {
  Greenhouse,
  GreenhouseSettings,
  SensorData,
  DeviceData,
} from "@/contexts/GreenhouseContext";

// ============ AUTH ENDPOINTS ============

// ============ AUTH TYPES ============

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponse {
  access_token: string;
  user: User;
}

export const authAPI = {
  // Login with email and password
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post("/logout");
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
  }): Promise<User> => {
    const response = await apiClient.put<User>("/users/me", data);
    return response.data;
  },
};

// ============ GREENHOUSE ENDPOINTS ============

export const greenhouseAPI = {
  // Get all greenhouses for current user
  getAll: async (): Promise<Greenhouse[]> => {
    const response = await apiClient.get<Greenhouse[]>("/greenhouses");
    return response.data;
  },

  // Get single greenhouse by ID
  getById: async (id: string): Promise<Greenhouse> => {
    const response = await apiClient.get<Greenhouse>(`/greenhouses/${id}`);
    return response.data;
  },

  // Create new greenhouse
  create: async (data: { name: string }): Promise<Greenhouse> => {
    const response = await apiClient.post<Greenhouse>("/greenhouses", data);
    return response.data;
  },

  // Update greenhouse
  update: async (
    id: string,
    data: Partial<Greenhouse>
  ): Promise<Greenhouse> => {
    const response = await apiClient.put<Greenhouse>(
      `/greenhouses/${id}`,
      data
    );
    return response.data;
  },

  // Delete greenhouse
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/greenhouses/${id}`);
  },

  // Update greenhouse settings
  updateSettings: async (
    id: string,
    settings: GreenhouseSettings
  ): Promise<Greenhouse> => {
    const response = await apiClient.put<Greenhouse>(
      `/greenhouses/${id}/settings`,
      settings
    );
    return response.data;
  },

  // Toggle AI mode
  toggleAiMode: async (id: string): Promise<Greenhouse> => {
    const response = await apiClient.post<Greenhouse>(
      `/greenhouses/${id}/ai-mode/toggle`
    );
    return response.data;
  },
};

// ============ SENSOR ENDPOINTS ============

export const sensorAPI = {
  // Get all sensors for a greenhouse
  getByGreenhouseId: async (greenhouseId: string): Promise<SensorData[]> => {
    const response = await apiClient.get<SensorData[]>(
      `/greenhouses/${greenhouseId}/sensors`
    );
    return response.data;
  },

  // Get single sensor
  getById: async (
    greenhouseId: string,
    sensorId: string
  ): Promise<SensorData> => {
    const response = await apiClient.get<SensorData>(
      `/greenhouses/${greenhouseId}/sensors/${sensorId}`
    );
    return response.data;
  },

  // Get sensor data history
  getHistory: async (
    greenhouseId: string,
    sensorId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      interval?: "1m" | "5m" | "15m" | "1h" | "1d";
    }
  ) => {
    const response = await apiClient.get(
      `/greenhouses/${greenhouseId}/sensors/${sensorId}/history`,
      { params }
    );
    return response.data;
  },
};

// ============ DEVICE ENDPOINTS ============

export const deviceAPI = {
  // Get all devices for a greenhouse
  getByGreenhouseId: async (greenhouseId: string): Promise<DeviceData[]> => {
    const response = await apiClient.get<DeviceData[]>(
      `/greenhouses/${greenhouseId}/devices`
    );
    return response.data;
  },

  // Get single device
  getById: async (
    greenhouseId: string,
    deviceId: string
  ): Promise<DeviceData> => {
    const response = await apiClient.get<DeviceData>(
      `/greenhouses/${greenhouseId}/devices/${deviceId}`
    );
    return response.data;
  },

  // Toggle device on/off
  toggle: async (
    greenhouseId: string,
    deviceId: string
  ): Promise<DeviceData> => {
    const response = await apiClient.post<DeviceData>(
      `/greenhouses/${greenhouseId}/devices/${deviceId}/toggle`
    );
    return response.data;
  },

  // Set device brightness (for LED)
  setBrightness: async (
    greenhouseId: string,
    deviceId: string,
    brightness: number
  ): Promise<DeviceData> => {
    const response = await apiClient.put<DeviceData>(
      `/greenhouses/${greenhouseId}/devices/${deviceId}/brightness`,
      { brightness }
    );
    return response.data;
  },

  // Set device speed (for fan)
  setSpeed: async (
    greenhouseId: string,
    deviceId: string,
    speed: number
  ): Promise<DeviceData> => {
    const response = await apiClient.put<DeviceData>(
      `/greenhouses/${greenhouseId}/devices/${deviceId}/speed`,
      { speed }
    );
    return response.data;
  },

  // Toggle auto mode
  toggleAutoMode: async (
    greenhouseId: string,
    deviceId: string
  ): Promise<DeviceData> => {
    const response = await apiClient.post<DeviceData>(
      `/greenhouses/${greenhouseId}/devices/${deviceId}/auto-mode/toggle`
    );
    return response.data;
  },
};

// ============ ANALYTICS ENDPOINTS ============

export const analyticsAPI = {
  // Get greenhouse analytics
  getGreenhouseAnalytics: async (
    greenhouseId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await apiClient.get(
      `/greenhouses/${greenhouseId}/analytics`,
      { params }
    );
    return response.data;
  },

  // Get sensor statistics
  getSensorStats: async (
    greenhouseId: string,
    sensorId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await apiClient.get(
      `/greenhouses/${greenhouseId}/sensors/${sensorId}/stats`,
      { params }
    );
    return response.data;
  },
};
