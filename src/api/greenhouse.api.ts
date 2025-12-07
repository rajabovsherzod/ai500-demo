import apiClient from "@/lib/api-client";
import { Greenhouse, CreateGreenhousePayload, UpdateGreenhousePayload } from "@/types/greenhouse";

// Barcha issiqxonalarni olish (GET)
export const getGreenhouses = async (): Promise<Greenhouse[]> => {
  const response = await apiClient.get<Greenhouse[]>("/greenhouses");
  return response.data;
};

// Yangi issiqxona yaratish (POST)
export const createGreenhouse = async (data: CreateGreenhousePayload): Promise<Greenhouse> => {
  const response = await apiClient.post<Greenhouse>("/greenhouses", data);
  return response.data;
};

export const getGreenhouseById = async (id: number): Promise<Greenhouse> => {
  const response = await apiClient.get<Greenhouse>(`/greenhouses/${id}`);
  return response.data;
};

export const updateGreenhouse = async (id: number, data: UpdateGreenhousePayload): Promise<Greenhouse> => {
  const response = await apiClient.patch<Greenhouse>(`/greenhouses/${id}`, data);
  return response.data;
};

export const deleteGreenhouse = async (id: number): Promise<string> => {
  // Swaggerga ko'ra string qaytadi (Masalan: "Deleted successfully")
  const response = await apiClient.delete<string>(`/greenhouses/${id}`);
  return response.data;
};

export const switchDevice = async (
  greenhouseId: number,
  deviceName: string,
  state: boolean
): Promise<{ ok: boolean }> => {
  const stateStr = state ? "on" : "off";
  
  // O'ZGARISH: URL oxiriga slash "/" qo'shildi
  const url = `/greenhouses/${greenhouseId}/devices/${deviceName}/switch/${stateStr}`;
  
  console.log("➡️ API Request URL:", url);

  // Ikkinchi parametr bo'sh obyekt {} bo'lishi shart
  const response = await apiClient.post(url, {});
  
  return response.data;
};