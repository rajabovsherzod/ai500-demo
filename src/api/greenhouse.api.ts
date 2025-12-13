import apiClient from "@/lib/api-client";
import { Greenhouse, CreateGreenhousePayload, UpdateGreenhousePayload } from "@/types/greenhouse";

// ... (getGreenhouses, createGreenhouse, updateGreenhouse, deleteGreenhouse o'zgarishsiz) ...

export const getGreenhouses = async (): Promise<Greenhouse[]> => {
  const response = await apiClient.get<Greenhouse[]>("/greenhouses");
  return response.data;
};

export const createGreenhouse = async (data: CreateGreenhousePayload): Promise<Greenhouse> => {
  const response = await apiClient.post<Greenhouse>("/greenhouses", data);
  return response.data;
};

export const updateGreenhouse = async (id: number, data: UpdateGreenhousePayload): Promise<Greenhouse> => {
  const response = await apiClient.patch<Greenhouse>(`/greenhouses/${id}`, data);
  return response.data;
};

export const deleteGreenhouse = async (id: number): Promise<string> => {
  const response = await apiClient.delete<string>(`/greenhouses/${id}`);
  return response.data;
};

// GET ID - ⚠️ DIAGNOSTIKA LOGLARI BILAN
export const getGreenhouseById = async (id: number): Promise<Greenhouse> => {
  const response = await apiClient.get<any>(`/greenhouses/${id}`);
  const data = response.data;

  // Xom ma'lumotni ko'ramiz
  // console.log("📥 GET RAW DATA:", data);

  // Mapping
  // Agar aiMode serverda null bo'lsa, false qilamiz
  const rawAiMode = data.aiMode ?? data.ai_mode;
  const finalAiMode = Boolean(rawAiMode);

  // Agar 3-4 sekunddan keyin o'chib qolayotgan bo'lsa, konsolda aynan shu yozuv chiqadi:
  if (rawAiMode === null) {
    console.warn(`⚠️ DIQQAT: Server 'ai_mode: null' qaytardi! Biz uni 'false' ga o'girdik.`);
  }

  return {
    ...data,
    aiMode: finalAiMode,
    stats: {
        ...data.stats,
        // Stats ichida ham ai_mode bo'lishi mumkin
        aiMode: Boolean(data.stats?.ai_mode)
    }
  };
};

export const switchDevice = async (
  greenhouseId: number,
  deviceName: string,
  state: boolean
): Promise<{ ok: boolean }> => {
  const stateStr = state ? "on" : "off";
  const url = `/greenhouses/${greenhouseId}/devices/${deviceName}/switch/${stateStr}/`;
  const response = await apiClient.post(url, {});
  return response.data;
};

// AI MODE SWITCH - ⚠️ LOGLAR BILAN
export const switchGreenhouseAiMode = async (
  greenhouseId: number,
  state: boolean
): Promise<{ ok: boolean }> => {
  const stateStr = state ? "on" : "off";
  const url = `/greenhouses/${greenhouseId}/ai/switch/${stateStr}/`;
  
  console.log(`🚀 SWITCH REQUEST KETDI: ${stateStr.toUpperCase()}`);
  console.log(`👉 URL: ${url}`);

  const response = await apiClient.post(url, {});
  
  console.log("✅ SERVER JAVOBI:", response.data);
  return response.data;
};