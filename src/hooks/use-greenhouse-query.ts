import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getGreenhouses, 
  createGreenhouse, 
  getGreenhouseById, 
  updateGreenhouse, 
  deleteGreenhouse, 
  switchDevice,
  switchGreenhouseAiMode 
} from "@/api/greenhouse.api";
import { CreateGreenhousePayload, UpdateGreenhousePayload } from "@/types/greenhouse";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// ... (Boshqa hooklar: useGreenhouses, useCreate, useUpdate, useDelete, useDeviceSwitch - o'zgarishsiz) ...
// (Qisqartirish uchun yozmadim, ular avvalgidek qoladi)

// 1. Get List
export const useGreenhouses = () => {
  return useQuery({
    queryKey: ["greenhouses"],
    queryFn: getGreenhouses,
    refetchInterval: 5000, 
  });
};

// 2. Create
export const useCreateGreenhouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGreenhousePayload) => createGreenhouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
      toast.success("Issiqxona yaratildi!");
    },
    onError: (error: any) => toast.error(error.message)
  });
};

// 3. Get by ID (Refetch vaqtini biroz ko'paytiramiz)
export const useGreenhouseById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["greenhouse", id],
    queryFn: () => getGreenhouseById(Number(id)),
    enabled: !!id,
    refetchInterval: 4000, // 4 sekund har safar yangilanadi (shu sabab o'chib qolyapti)
  });
};

// 4. Update
export const useUpdateGreenhouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGreenhousePayload }) => 
      updateGreenhouse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["greenhouse", String(variables.id)] });
      toast.success("Saqlandi");
    }
  });
};

// 5. Delete
export const useDeleteGreenhouse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (id: number) => deleteGreenhouse(id),
    onSuccess: () => navigate("/dashboard", { replace: true })
  });
};

// 6. Device Switch
export const useDeviceSwitch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ greenhouseId, deviceName, state }: { greenhouseId: number; deviceName: string; state: boolean }) => 
      switchDevice(greenhouseId, deviceName, state),
    onMutate: async ({ greenhouseId, deviceName, state }) => {
       await queryClient.cancelQueries({ queryKey: ["greenhouse", String(greenhouseId)] });
       const previous = queryClient.getQueryData(["greenhouse", String(greenhouseId)]);
       queryClient.setQueryData(["greenhouse", String(greenhouseId)], (old: any) => {
         if(!old) return old;
         const stats = {...old.stats};
         if(deviceName === 'fan') stats.fan = state ? 1 : 0;
         if(deviceName === 'led') stats.led = state ? 1 : 0;
         if(deviceName === 'moisture') stats.soil_water_pump = state ? 1 : 0;
         if(deviceName === 'humidity') stats.air_water_pump = state ? 1 : 0;
         return {...old, stats};
       });
       return { previous };
    },
    onError: (err, vars, ctx: any) => {
       queryClient.setQueryData(["greenhouse", String(vars.greenhouseId)], ctx.previous);
       toast.error("Xatolik");
    },
    onSettled: (data, err, vars) => queryClient.invalidateQueries({ queryKey: ["greenhouse", String(vars.greenhouseId)] })
  });
};


// ⚠️ TUZATILGAN AI HOOK
export const useAiModeSwitch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ greenhouseId, state }: { greenhouseId: number; state: boolean }) => 
      switchGreenhouseAiMode(greenhouseId, state),
    
    // 1. Optimistic Update
    onMutate: async ({ greenhouseId, state }) => {
      console.log(`⚡ UI YANGILANDI (Optimistic): ${state}`);
      
      // Avtomatik yangilanishni vaqtincha to'xtatib turamiz (urishib ketmasligi uchun)
      await queryClient.cancelQueries({ queryKey: ["greenhouse", String(greenhouseId)] });

      const previousGreenhouse = queryClient.getQueryData(["greenhouse", String(greenhouseId)]);

      queryClient.setQueryData(["greenhouse", String(greenhouseId)], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          aiMode: state, 
          ai_mode: state 
        };
      });

      return { previousGreenhouse };
    },

    onSuccess: (data, variables) => {
      console.log("✅ SERVER QABUL QILDI. Keshni saqlab qolamiz.");
      // Biz bu yerda invalidateQueries QILMAYMIZ.
      // Agar qilsak, backenddagi NULL qiymatni olib kelib, tugmani o'chirib qo'yadi.
      toast.success(variables.state ? "AI Yoqildi" : "AI O'chirildi");
    },

    onError: (err, variables, context: any) => {
      console.error("❌ XATOLIK BO'LDI:", err);
      queryClient.setQueryData(["greenhouse", String(variables.greenhouseId)], context.previousGreenhouse);
      toast.error("Amalga oshmadi");
    }
  });
};