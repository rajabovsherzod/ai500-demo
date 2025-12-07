import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGreenhouses, createGreenhouse, getGreenhouseById, updateGreenhouse, deleteGreenhouse, switchDevice } from "@/api/greenhouse.api";
import { CreateGreenhousePayload, UpdateGreenhousePayload } from "@/types/greenhouse";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// 1. Issiqxonalar ro'yxatini olish uchun hook
export const useGreenhouses = () => {
  return useQuery({
    queryKey: ["greenhouses"], // Kesh kaliti
    queryFn: getGreenhouses,
    staleTime: 1000 * 60 * 5, // 5 daqiqa davomida ma'lumotni yangi deb hisoblaydi
  });
};

// 2. Issiqxona yaratish uchun hook
export const useCreateGreenhouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGreenhousePayload) => createGreenhouse(data),
    
    onSuccess: () => {
      // Muvaffaqiyatli qo'shilganda:
      // 1. Keshdagi "greenhouses" ro'yxatini eskirgan deb belgilaymiz (shunda u qayta yuklanadi)
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
    },
    onError: (error: any) => {
      console.error("Create Greenhouse Error:", error);
      // Xatolik xabari toast orqali (agar api-clientda global handle qilinmagan bo'lsa)
      toast.error(error.message || "Issiqxona yaratishda xatolik yuz berdi");
    }
  });
};

export const useGreenhouseById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["greenhouse", id],
    queryFn: () => getGreenhouseById(Number(id)),
    enabled: !!id, // ID bo'lmasa so'rov yubormaydi
    retry: 1,
  });
};


export const useUpdateGreenhouse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGreenhousePayload }) => 
      updateGreenhouse(id, data),
      
    onSuccess: (updatedGreenhouse) => {
      // 1. Keshdagi aniq bitta issiqxonani yangilaymiz
      queryClient.invalidateQueries({ queryKey: ["greenhouse", String(updatedGreenhouse.id)] });
      
      // 2. Umumiy ro'yxatni ham yangilaymiz (Dashboarddagi nom o'zgarishi uchun)
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
      
      // toast.success("Muvaffaqiyatli saqlandi!"); // Sahifada o'zimiz chiqaramiz
    },
    onError: (error: any) => {
      console.error("Update Error:", error);
      toast.error(error.message || "Xatolik yuz berdi");
    }
  });
};


export const useDeleteGreenhouse = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: number) => deleteGreenhouse(id),
    
    onSuccess: () => {
      // 1. Dashboarddagi ro'yxatni yangilaymiz (keshni tozalaymiz)
      queryClient.invalidateQueries({ queryKey: ["greenhouses"] });
      
      // 2. Xabar beramiz
      toast.success("Issiqxona muvaffaqiyatli o'chirildi!");
      
      // 3. Dashboardga yo'naltiramiz
      navigate("/dashboard", { replace: true });
    },
    onError: (error: any) => {
      console.error("Delete Error:", error);
      toast.error(error.message || "O'chirishda xatolik yuz berdi");
    }
  });
};


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

    onSuccess: (_, variables) => {
      // Muvaffaqiyatli bo'lsa, ma'lumotlarni yangilaymiz
      queryClient.invalidateQueries({ queryKey: ["greenhouse", String(variables.greenhouseId)] });
      
      const status = variables.state ? "yoqildi" : "o'chirildi";
      toast.success(`Qurilma muvaffaqiyatli ${status}!`);
    },
    onError: (error: any) => {
      console.error("Switch Error:", error);
      toast.error("Qurilmani boshqarishda xatolik yuz berdi");
    }
  });
};