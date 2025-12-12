import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGreenhouses, createGreenhouse, getGreenhouseById, updateGreenhouse, deleteGreenhouse, switchDevice } from "@/api/greenhouse.api";
import { CreateGreenhousePayload, UpdateGreenhousePayload, Greenhouse } from "@/types/greenhouse";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// 1. Issiqxonalar ro'yxatini olish
export const useGreenhouses = () => {
  return useQuery({
    queryKey: ["greenhouses"],
    queryFn: getGreenhouses,
    // REAL-TIME: Ro'yxatni har 5 soniyada yangilab turadi (sensorlar o'zgarsa ko'rinishi uchun)
    refetchInterval: 5000, 
  });
};

// 2. Issiqxona yaratish (Optimistik yangilash shart emas, chunki ID yo'q)
export const useCreateGreenhouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGreenhousePayload) => createGreenhouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
      toast.success("Issiqxona yaratildi!");
    },
    onError: (error: any) => {
      console.error("Create Greenhouse Error:", error);
      toast.error(error.message || "Xatolik yuz berdi");
    }
  });
};

// 3. Bitta issiqxona ma'lumotlari
export const useGreenhouseById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["greenhouse", id],
    queryFn: () => getGreenhouseById(Number(id)),
    enabled: !!id,
    // REAL-TIME: Sensor ma'lumotlari (temp, namlik) tez o'zgarishi uchun
    // har 2 soniyada orqa fonda yangilab turamiz.
    refetchInterval: 2000, 
  });
};

// 4. Issiqxonani yangilash (OPTIMISTIC UPDATE ⚡️)
export const useUpdateGreenhouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGreenhousePayload }) => 
      updateGreenhouse(id, data),

    // Serverga so'rov ketishidan OLDIN ishga tushadi
    onMutate: async ({ id, data }) => {
      // 1. Keshdagi eski so'rovlarni to'xtatib turamiz (urishib ketmasligi uchun)
      await queryClient.cancelQueries({ queryKey: ["greenhouse", String(id)] });
      await queryClient.cancelQueries({ queryKey: ["greenhouses"] });

      // 2. Oldingi holatni saqlab olamiz (agar xato bo'lsa qaytarish uchun)
      const previousGreenhouse = queryClient.getQueryData(["greenhouse", String(id)]);
      const previousList = queryClient.getQueryData(["greenhouses"]);

      // 3. Keshni yangi ma'lumot bilan darhol yangilaymiz (UI da o'zgarish ko'rinadi)
      queryClient.setQueryData(["greenhouse", String(id)], (old: any) => ({
        ...old,
        ...data, // Yangi nom yoki description darhol o'zgaradi
      }));

      // Ro'yxatdagi nomni ham yangilaymiz
      queryClient.setQueryData(["greenhouses"], (oldList: any[]) => {
        return oldList?.map(item => item.id === id ? { ...item, ...data } : item);
      });

      // Context qaytaramiz (onError da ishlatish uchun)
      return { previousGreenhouse, previousList };
    },

    onError: (err, newTodo, context: any) => {
      // Xato bo'lsa, eski holatga qaytaramiz
      queryClient.setQueryData(["greenhouse", String(newTodo.id)], context.previousGreenhouse);
      queryClient.setQueryData(["greenhouses"], context.previousList);
      toast.error("O'zgartirish saqlanmadi. Internetni tekshiring.");
    },

    onSettled: (data, error, variables) => {
      // Muvaffaqiyatli yoki xato bo'lsa ham, serverdan aniq ma'lumotni qayta yuklaymiz
      queryClient.invalidateQueries({ queryKey: ["greenhouse", String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
      if (!error) toast.success("Muvaffaqiyatli saqlandi!");
    },
  });
};

// 5. O'chirish (OPTIMISTIC UPDATE ⚡️)
export const useDeleteGreenhouse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: number) => deleteGreenhouse(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["greenhouses"] });
      const previousList = queryClient.getQueryData(["greenhouses"]);

      // Ro'yxatdan darhol o'chirib tashlaymiz
      queryClient.setQueryData(["greenhouses"], (old: any[]) => 
        old?.filter(item => item.id !== id)
      );

      return { previousList };
    },

    onSuccess: () => {
      toast.success("O'chirildi");
      navigate("/dashboard", { replace: true });
    },

    onError: (err, id, context: any) => {
      // Xato bo'lsa ro'yxatni tiklaymiz
      queryClient.setQueryData(["greenhouses"], context.previousList);
      toast.error("O'chirishda xatolik.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
    }
  });
};

// 6. Qurilmalarni boshqarish (OPTIMISTIC UPDATE ⚡️) - Eng muhimi shu
export const useDeviceSwitch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      greenhouseId, 
      deviceName, 
      state 
    }: { 
      greenhouseId: number; 
      deviceName: string; 
      state: boolean 
    }) => switchDevice(greenhouseId, deviceName, state),

    // Switch bosilishi bilan darhol ishlaydi
    onMutate: async ({ greenhouseId, deviceName, state }) => {
      // 1. So'rovlarni to'xtatamiz
      await queryClient.cancelQueries({ queryKey: ["greenhouse", String(greenhouseId)] });

      // 2. Eski holatni saqlaymiz
      const previousGreenhouse = queryClient.getQueryData(["greenhouse", String(greenhouseId)]);

      // 3. UI ni yangilaymiz (Switch darhol 'on' yoki 'off' bo'ladi)
      queryClient.setQueryData(["greenhouse", String(greenhouseId)], (old: any) => {
        if (!old) return old;
        
        // Bu yerda API tuzilmasiga qarab 'stats' yoki boshqa joyni o'zgartirish kerak
        // Taxminan stats ichida turadi deb hisoblaymiz:
        const updatedStats = { ...old.stats };
        
        // Mapping (UI dagi nomni API dagi nomga moslash)
        // Agar sizda mapping bo'lmasa, to'g'ridan-to'g'ri yozishingiz mumkin
        if (deviceName === 'fan') updatedStats.fan = state ? 1 : 0;
        if (deviceName === 'led') updatedStats.led = state ? 1 : 0;
        if (deviceName === 'moisture') updatedStats.soil_water_pump = state ? 1 : 0; // Taxmin
        if (deviceName === 'humidity') updatedStats.air_water_pump = state ? 1 : 0; // Taxmin

        return {
          ...old,
          stats: updatedStats
        };
      });

      return { previousGreenhouse };
    },

    onError: (err, variables, context: any) => {
      // Xato bo'lsa switch joyiga qaytadi
      queryClient.setQueryData(["greenhouse", String(variables.greenhouseId)], context.previousGreenhouse);
      toast.error("Qurilmani boshqarishda xatolik!");
    },

    onSettled: (data, error, variables) => {
      // Serverdan haqiqiy holatni tekshirish uchun qayta yuklaymiz
      queryClient.invalidateQueries({ queryKey: ["greenhouse", String(variables.greenhouseId)] });
      
      if (!error) {
        if (variables.state) toast.success("Muvaffaqiyatli yoqildi! 🟢");
        else toast.success("Muvaffaqiyatli o'chirildi! 🔴");
      }
    }
  });
};