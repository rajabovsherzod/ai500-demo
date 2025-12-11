import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPlantTypes, 
  getPlantsByGreenhouse, 
  getPlantById, 
  createPlant, 
  updatePlant, 
  deletePlant 
} from "@/api/plants.api";
import { CreatePlantPayload, UpdatePlantPayload } from "@/types/plant";
import { toast } from "sonner";

// Fallback plant types (agar API ishlamasa)
const FALLBACK_PLANT_TYPES = ["tomato", "cucumber", "pepper", "eggplant", "lettuce", "carrot", "onion", "garlic"];

// O'simlik turlari ro'yxati
export const usePlantTypes = () => {
  return useQuery({
    queryKey: ["plant-types"],
    queryFn: getPlantTypes,
    staleTime: 1000 * 60 * 60,
    retry: 1,
    placeholderData: FALLBACK_PLANT_TYPES, // API ishlamasa fallback
  });
};

// Issiqxonadagi o'simliklar
export const usePlantsByGreenhouse = (greenhouseId: number | undefined) => {
  return useQuery({
    queryKey: ["plants", greenhouseId],
    queryFn: () => getPlantsByGreenhouse(greenhouseId!),
    enabled: !!greenhouseId && greenhouseId > 0,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    placeholderData: [], // Placeholder bo'sh array
  });
};

// Bitta o'simlik
export const usePlantById = (greenhouseId: number | undefined, plantId: number | undefined) => {
  return useQuery({
    queryKey: ["plant", greenhouseId, plantId],
    queryFn: () => getPlantById(greenhouseId!, plantId!),
    enabled: !!greenhouseId && !!plantId,
  });
};

// O'simlik yaratish
export const useCreatePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ greenhouseId, data }: { greenhouseId: number; data: CreatePlantPayload }) => 
      createPlant(greenhouseId, data),
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plants", variables.greenhouseId] });
      toast.success("O'simlik muvaffaqiyatli qo'shildi! 🌱");
    },
    onError: (error: any) => {
      console.error("Create Plant Error:", error);
      toast.error(error.message || "O'simlik qo'shishda xatolik");
    }
  });
};

// O'simlikni yangilash
export const useUpdatePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      greenhouseId, 
      plantId, 
      data 
    }: { 
      greenhouseId: number; 
      plantId: number; 
      data: UpdatePlantPayload 
    }) => updatePlant(greenhouseId, plantId, data),
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plants", variables.greenhouseId] });
      queryClient.invalidateQueries({ queryKey: ["plant", variables.greenhouseId, variables.plantId] });
      toast.success("O'simlik yangilandi! ✏️");
    },
    onError: (error: any) => {
      console.error("Update Plant Error:", error);
      toast.error(error.message || "Yangilashda xatolik");
    }
  });
};

// O'simlikni o'chirish
export const useDeletePlant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ greenhouseId, plantId }: { greenhouseId: number; plantId: number }) => 
      deletePlant(greenhouseId, plantId),
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plants", variables.greenhouseId] });
      toast.success("O'simlik o'chirildi! 🗑️");
    },
    onError: (error: any) => {
      console.error("Delete Plant Error:", error);
      toast.error(error.message || "O'chirishda xatolik");
    }
  });
};