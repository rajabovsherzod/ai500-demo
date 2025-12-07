import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  authAPI,
  greenhouseAPI,
  sensorAPI,
  deviceAPI,
  analyticsAPI,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "@/lib/api";
import { Greenhouse, GreenhouseSettings } from "@/contexts/GreenhouseContext";

// ============ AUTH HOOKS ============

export const useLogin = (
  options?: UseMutationOptions<LoginResponse, Error, LoginRequest>
) => {
  return useMutation({
    mutationFn: authAPI.login,
    ...options,
  });
};

export const useRegister = (
  options?: UseMutationOptions<RegisterResponse, Error, RegisterRequest>
) => {
  return useMutation({
    mutationFn: authAPI.register,
    ...options,
  });
};

export const useLogout = (options?: UseMutationOptions<void, Error, void>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.clear();
    },
    ...options,
  });
};

export const useProfile = (
  options?: UseQueryOptions<User, Error, User, string[]>
) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: authAPI.getProfile,
    ...options,
  });
};

export const useUpdateProfile = (
  options?: UseMutationOptions<
    User,
    Error,
    { first_name?: string; last_name?: string }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    ...options,
  });
};

// ============ GREENHOUSE HOOKS ============

export const useGreenhouses = (
  options?: UseQueryOptions<Greenhouse[], Error, Greenhouse[], string[]>
) => {
  return useQuery({
    queryKey: ["greenhouses"],
    queryFn: greenhouseAPI.getAll,
    ...options,
  });
};

export const useGreenhouse = (
  id: string,
  options?: UseQueryOptions<Greenhouse, Error, Greenhouse, string[]>
) => {
  return useQuery({
    queryKey: ["greenhouses", id],
    queryFn: () => greenhouseAPI.getById(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateGreenhouse = (
  options?: UseMutationOptions<Greenhouse, Error, { name: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: greenhouseAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
    },
    ...options,
  });
};

export const useUpdateGreenhouse = (
  options?: UseMutationOptions<
    Greenhouse,
    Error,
    { id: string; data: Partial<Greenhouse> }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => greenhouseAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
      queryClient.invalidateQueries({ queryKey: ["greenhouses", data.id] });
    },
    ...options,
  });
};

export const useDeleteGreenhouse = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: greenhouseAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
    },
    ...options,
  });
};

export const useUpdateGreenhouseSettings = (
  options?: UseMutationOptions<
    Greenhouse,
    Error,
    { id: string; settings: GreenhouseSettings }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, settings }) =>
      greenhouseAPI.updateSettings(id, settings),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
      queryClient.invalidateQueries({ queryKey: ["greenhouses", data.id] });
    },
    ...options,
  });
};

export const useToggleAiMode = (
  options?: UseMutationOptions<Greenhouse, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: greenhouseAPI.toggleAiMode,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["greenhouses", data.id] });
    },
    ...options,
  });
};

// ============ SENSOR HOOKS ============

export const useSensors = (
  greenhouseId: string,
  options?: UseQueryOptions<any[], Error, any[], string[]>
) => {
  return useQuery({
    queryKey: ["sensors", greenhouseId],
    queryFn: () => sensorAPI.getByGreenhouseId(greenhouseId),
    enabled: !!greenhouseId,
    ...options,
  });
};

export const useSensor = (
  greenhouseId: string,
  sensorId: string,
  options?: UseQueryOptions<any, Error, any, string[]>
) => {
  return useQuery({
    queryKey: ["sensors", greenhouseId, sensorId],
    queryFn: () => sensorAPI.getById(greenhouseId, sensorId),
    enabled: !!greenhouseId && !!sensorId,
    ...options,
  });
};

export const useSensorHistory = (
  greenhouseId: string,
  sensorId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    interval?: "1m" | "5m" | "15m" | "1h" | "1d";
  },
  options?: UseQueryOptions<any, Error, any, string[]>
) => {
  return useQuery({
    queryKey: ["sensors", greenhouseId, sensorId, "history", params],
    queryFn: () => sensorAPI.getHistory(greenhouseId, sensorId, params),
    enabled: !!greenhouseId && !!sensorId,
    ...options,
  });
};

// ============ DEVICE HOOKS ============

export const useDevices = (
  greenhouseId: string,
  options?: UseQueryOptions<any[], Error, any[], string[]>
) => {
  return useQuery({
    queryKey: ["devices", greenhouseId],
    queryFn: () => deviceAPI.getByGreenhouseId(greenhouseId),
    enabled: !!greenhouseId,
    ...options,
  });
};

export const useDevice = (
  greenhouseId: string,
  deviceId: string,
  options?: UseQueryOptions<any, Error, any, string[]>
) => {
  return useQuery({
    queryKey: ["devices", greenhouseId, deviceId],
    queryFn: () => deviceAPI.getById(greenhouseId, deviceId),
    enabled: !!greenhouseId && !!deviceId,
    ...options,
  });
};

export const useToggleDevice = (
  options?: UseMutationOptions<
    any,
    Error,
    { greenhouseId: string; deviceId: string }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ greenhouseId, deviceId }) =>
      deviceAPI.toggle(greenhouseId, deviceId),
    onSuccess: (data, { greenhouseId, deviceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["devices", greenhouseId, deviceId],
      });
      queryClient.invalidateQueries({ queryKey: ["devices", greenhouseId] });
    },
    ...options,
  });
};

export const useSetDeviceBrightness = (
  options?: UseMutationOptions<
    any,
    Error,
    { greenhouseId: string; deviceId: string; brightness: number }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ greenhouseId, deviceId, brightness }) =>
      deviceAPI.setBrightness(greenhouseId, deviceId, brightness),
    onSuccess: (data, { greenhouseId, deviceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["devices", greenhouseId, deviceId],
      });
      queryClient.invalidateQueries({ queryKey: ["devices", greenhouseId] });
    },
    ...options,
  });
};

export const useSetDeviceSpeed = (
  options?: UseMutationOptions<
    any,
    Error,
    { greenhouseId: string; deviceId: string; speed: number }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ greenhouseId, deviceId, speed }) =>
      deviceAPI.setSpeed(greenhouseId, deviceId, speed),
    onSuccess: (data, { greenhouseId, deviceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["devices", greenhouseId, deviceId],
      });
      queryClient.invalidateQueries({ queryKey: ["devices", greenhouseId] });
    },
    ...options,
  });
};

export const useToggleDeviceAutoMode = (
  options?: UseMutationOptions<
    any,
    Error,
    { greenhouseId: string; deviceId: string }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ greenhouseId, deviceId }) =>
      deviceAPI.toggleAutoMode(greenhouseId, deviceId),
    onSuccess: (data, { greenhouseId, deviceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["devices", greenhouseId, deviceId],
      });
      queryClient.invalidateQueries({ queryKey: ["devices", greenhouseId] });
    },
    ...options,
  });
};

// ============ ANALYTICS HOOKS ============

export const useGreenhouseAnalytics = (
  greenhouseId: string,
  params?: {
    startDate?: string;
    endDate?: string;
  },
  options?: UseQueryOptions<any, Error, any, string[]>
) => {
  return useQuery({
    queryKey: ["analytics", greenhouseId, params],
    queryFn: () => analyticsAPI.getGreenhouseAnalytics(greenhouseId, params),
    enabled: !!greenhouseId,
    ...options,
  });
};

export const useSensorStats = (
  greenhouseId: string,
  sensorId: string,
  params?: {
    startDate?: string;
    endDate?: string;
  },
  options?: UseQueryOptions<any, Error, any, string[]>
) => {
  return useQuery({
    queryKey: ["sensor-stats", greenhouseId, sensorId, params],
    queryFn: () =>
      analyticsAPI.getSensorStats(greenhouseId, sensorId, params),
    enabled: !!greenhouseId && !!sensorId,
    ...options,
  });
};
