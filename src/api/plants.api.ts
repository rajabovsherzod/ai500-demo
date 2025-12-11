import apiClient from "@/lib/api-client";
import { Plant, CreatePlantPayload, UpdatePlantPayload } from "@/types/plant";

// O'simlik turlari ro'yxati
export const getPlantTypes = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get<string[]>("/plant-types");
    return response.data;
  } catch (error) {
    console.error("getPlantTypes error:", error);
    // Fallback - default turlar
    return ["tomato", "cucumber", "pepper", "eggplant", "lettuce", "carrot"];
  }
};

// Issiqxonadagi barcha o'simliklar
export const getPlantsByGreenhouse = async (greenhouseId: number): Promise<Plant[]> => {
  try {
    const response = await apiClient.get<Plant[]>(`/greenhouses/${greenhouseId}/plants`);
    return response.data;
  } catch (error) {
    console.error("getPlantsByGreenhouse error:", error);
    return []; // Bo'sh array qaytaramiz
  }
};

// Bitta o'simlik
export const getPlantById = async (greenhouseId: number, plantId: number): Promise<Plant> => {
  const response = await apiClient.get<Plant>(`/greenhouses/${greenhouseId}/plants/${plantId}`);
  return response.data;
};

// Yangi o'simlik yaratish
export const createPlant = async (greenhouseId: number, data: CreatePlantPayload): Promise<Plant> => {
  const response = await apiClient.post<Plant>(`/greenhouses/${greenhouseId}/plants`, data);
  return response.data;
};

// O'simlikni yangilash
export const updatePlant = async (
  greenhouseId: number, 
  plantId: number, 
  data: UpdatePlantPayload
): Promise<Plant> => {
  const response = await apiClient.patch<Plant>(`/greenhouses/${greenhouseId}/plants/${plantId}`, data);
  return response.data;
};

// O'simlikni o'chirish
export const deletePlant = async (greenhouseId: number, plantId: number): Promise<string> => {
  const response = await apiClient.delete<string>(`/greenhouses/${greenhouseId}/plants/${plantId}`);
  return response.data;
};