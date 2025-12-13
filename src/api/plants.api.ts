import apiClient from "@/lib/api-client";
import { Plant, CreatePlantPayload, UpdatePlantPayload } from "@/types/plant";

// 1. Issiqxonaga tegishli o'simliklarni olish
// Swagger: GET /api/greenhouses/{greenhouse_id}/plants
export const getPlantsByGreenhouseId = async (greenhouseId: number): Promise<Plant[]> => {
  const response = await apiClient.get<Plant[]>(`/greenhouses/${greenhouseId}/plants`);
  return response.data;
};

// 2. Mavjud o'simlik turlarini olish
// Swagger: GET /api/greenhouses/{greenhouse_id}/plants/plant-types
// XATO SHU YERDA EDI: Bu global emas, ID talab qiladi
export const getPlantTypes = async (greenhouseId: number): Promise<string[]> => {
  // Agar ID yo'q bo'lsa (masalan sahifa yuklanayotganda), bo'sh array qaytaramiz
  if (!greenhouseId) return [];
  
  const response = await apiClient.get<string[]>(`/greenhouses/${greenhouseId}/plants/plant-types`);
  return response.data;
};

// 3. O'simlik yaratish
// Swagger bo'yicha taxminan: POST /api/greenhouses/{id}/plants
export const createPlant = async (greenhouseId: number, data: CreatePlantPayload): Promise<Plant> => {
  const response = await apiClient.post<Plant>(`/greenhouses/${greenhouseId}/plants`, data);
  return response.data;
};

// 4. O'simlikni yangilash
export const updatePlant = async (greenhouseId: number, plantId: number, data: UpdatePlantPayload): Promise<Plant> => {
  // Swaggerga qarab URL o'zgarishi mumkin, odatda bunday bo'ladi:
  const response = await apiClient.patch<Plant>(`/greenhouses/${greenhouseId}/plants/${plantId}`, data);
  return response.data;
};

// 5. O'simlikni o'chirish
export const deletePlant = async (greenhouseId: number, plantId: number): Promise<void> => {
  await apiClient.delete(`/greenhouses/${greenhouseId}/plants/${plantId}`);
};