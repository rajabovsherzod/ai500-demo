import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPlantsByGreenhouseId, 
  getPlantTypes, // Endi bu ID so'raydi
  createPlant, 
  updatePlant, 
  deletePlant 
} from "@/api/plants.api";
import { CreatePlantPayload, UpdatePlantPayload } from "@/types/plant";
import { toast } from "sonner";

// 1. O'simliklarni olish
export const usePlantsByGreenhouse = (greenhouseId: number | undefined) => {
  return useQuery({
    queryKey: ["plants", greenhouseId],
    queryFn: () => getPlantsByGreenhouseId(greenhouseId!),
    enabled: !!greenhouseId, // ID bo'lmasa so'rov yubormaydi
  });
};

// 2. O'simlik turlarini olish (TUZATILDI)
// Endi bu hook ham ID qabul qilishi kerak
export const usePlantTypes = (greenhouseId: number | undefined) => {
  return useQuery({
    queryKey: ["plant-types", greenhouseId],
    queryFn: () => getPlantTypes(greenhouseId!),
    enabled: !!greenhouseId, // ID bo'lmasa 404 bermasligi uchun kutib turadi
    staleTime: 1000 * 60 * 5, // 5 minut eslab qoladi
  });
};

// 3. Create Plant
export const useCreatePlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ greenhouseId, data }: { greenhouseId: number; data: CreatePlantPayload }) => 
      createPlant(greenhouseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plants", variables.greenhouseId] });
      toast.success("O'simlik qo'shildi");
    },
    onError: () => toast.error("Xatolik yuz berdi")
  });
};

// 4. Update Plant
export const useUpdatePlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ greenhouseId, plantId, data }: { greenhouseId: number; plantId: number; data: UpdatePlantPayload }) => 
      updatePlant(greenhouseId, plantId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plants", variables.greenhouseId] });
      toast.success("Yangilandi");
    },
    onError: () => toast.error("Xatolik yuz berdi")
  });
};

// 5. Delete Plant
export const useDeletePlant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ greenhouseId, plantId }: { greenhouseId: number; plantId: number }) => 
      deletePlant(greenhouseId, plantId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plants", variables.greenhouseId] });
      toast.success("O'chirildi");
    },
    onError: () => toast.error("O'chirishda xatolik")
  });
};