import apiClient from "@/lib/api-client";

// Backendga ketadigan history formati
export interface ChatHistoryItem {
  role: "user" | "model"; // yoki "assistant", backendga qarab
  content: string;
}

// Request body strukturasi
export interface ChatRequestPayload {
  message: string;
  history: ChatHistoryItem[];
}

// Response strukturasi
export interface ChatResponse {
  reply: string;
}

// Chat API call
export const sendChatMessage = async (payload: ChatRequestPayload): Promise<ChatResponse> => {
  // POST /api/ai/chat
  // endpoint URL'ni o'zingizning backend routingingizga moslang,
  // masalan: "/ai/chat" yoki to'g'ridan-to'g'ri "/chat" bo'lishi mumkin.
  // Siz bergan ma'lumotga ko'ra: /api/ai/chat
  const response = await apiClient.post<ChatResponse>("/ai/chat", payload);
  return response.data;
};