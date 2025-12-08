import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import AiModeToggle from "@/components/greenhouse/AiModeToggle";
import SensorCard from "@/components/greenhouse/SensorCard";
import DeviceCard from "@/components/greenhouse/DeviceCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, LineChart, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGreenhouseById, useDeviceSwitch } from "@/hooks/use-greenhouse-query"; // Hook manzili sizda qayerda bo'lsa o'sha yerdan

// --- CONSTANTS (Komponent tashqarisida) ---
const EXPECTED_SENSORS = [
  { key: "temperature", type: "temperature", unit: "°C", min: 0, max: 50 },
  { key: "humidity", type: "humidity", unit: "%", min: 0, max: 100 },
  { key: "moisture", type: "soil_moisture", unit: "%", min: 0, max: 100 },
  { key: "air", type: "co2", unit: " ppm", min: 0, max: 2000 },
  { key: "light", type: "light", unit: " lux", min: 0, max: 10000 },
];

const EXPECTED_DEVICES = ["fan", "led", "water_pump", "humidifier"];

const UI_TO_API_MAP: Record<string, string> = {
  fan: "air",
  led: "led",
  water_pump: "moisture",
  humidifier: "humidity"
};

const parseStatValue = (value: string | number | undefined | null): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    if (value.trim() === "") return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const GreenhouseViewPage: React.FC = () => {
  // --------------------------------------------------------
  // 1. BARCHA HOOKLAR ENG TEPADA (IF/RETURN DAN OLDIN)
  // --------------------------------------------------------
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  // Data olish
  const { data: greenhouse, isLoading, isError } = useGreenhouseById(id);
  
  // Mutatsiya
  const { mutate: switchDevice } = useDeviceSwitch();

  // AI Mode uchun Local State
  const [localAiMode, setLocalAiMode] = useState(false);

  // Effect: Ma'lumot kelganda local stateni yangilash
  useEffect(() => {
    if (greenhouse?.aiMode !== undefined) {
      setLocalAiMode(greenhouse.aiMode);
    }
  }, [greenhouse]);

  // --------------------------------------------------------
  // 2. HANDLERS (FUNKSIYALAR)
  // --------------------------------------------------------

  const handleAiToggle = () => {
    setLocalAiMode((prev) => {
      console.log(`AI Mode toggled to: ${!prev} (DUMMY ACTION)`);
      // Kelajakda API chaqiruv shu yerda bo'ladi
      return !prev;
    });
  };

  const handleDeviceToggle = (uiType: string, currentState: boolean) => {
    const apiName = UI_TO_API_MAP[uiType];
    if (!apiName || !id) return;

    // Mutatsiyani ishga tushiramiz
    switchDevice({
      greenhouseId: Number(id),
      deviceName: apiName,
      state: !currentState
    });
  };

  const handleSliderChange = (uiType: string, value: number, setting: 'brightness' | 'speed') => {
    console.log(`Setting ${setting} for ${uiType} to ${value}`);
  };

  // --------------------------------------------------------
  // 3. SHARTLI RENDERING (LOADING / ERROR)
  // Bu qism hooklardan KEYIN bo'lishi shart!
  // --------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !greenhouse) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Ma'lumot topilmadi</h2>
        <Link to="/dashboard">
           <Button variant="outline">Orqaga qaytish</Button>
        </Link>
      </div>
    );
  }

  // --------------------------------------------------------
  // 4. MA'LUMOTLARNI TAYYORLASH
  // --------------------------------------------------------
  const stats = greenhouse.stats || {};
  // `any` ishlatishdan qochish uchun type assertion ishlatildi, 
  // lekin loyihangizda Greenhouse type ichida devices array bo'lishi kerak.
  const apiDevices = (greenhouse as any).devices || [];

  // --------------------------------------------------------
  // 5. ASOSIY RENDER (JSX)
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  <span className="text-foreground">{greenhouse.name}</span>
                </h1>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  {t("greenhouse.realTimeMonitoring")}
                  <span className="text-xs px-2 py-0.5 bg-primary/10 rounded text-primary">
                    ID: {greenhouse.id}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/greenhouse/${id}/analytics`}>
                <Button variant="outline">
                  <LineChart className="w-4 h-4 mr-2" />
                  {t("greenhouse.analytics")}
                </Button>
              </Link>
              <Link to={`/greenhouse/${id}/settings`}>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  {t("greenhouse.settings")}
                </Button>
              </Link>
            </div>
          </div>

          {/* AI MODE TOGGLE */}
          <motion.div className="mb-8">
            <AiModeToggle aiMode={localAiMode} onToggle={handleAiToggle} />
          </motion.div>

          {/* SENSORS SECTION */}
          <motion.section className="mb-10">
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
              {t("greenhouse.sensors")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {EXPECTED_SENSORS.map((def, index) => {
                const rawValue = (stats as any)[def.key];
                const value = parseStatValue(rawValue);
                const sensorData = value !== undefined ? {
                  id: def.key,
                  type: def.type,
                  value: value,
                  unit: def.unit,
                  min: def.min,
                  max: def.max,
                  status: "good" as const
                } : undefined;

                return (
                  <motion.div 
                    key={def.key} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <SensorCard type={def.type} sensor={sensorData} greenhouseId={id || ""} />
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* DEVICES SECTION */}
          <motion.section>
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {t("greenhouse.devices")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXPECTED_DEVICES.map((type, index) => {
                // API dan qidiramiz
                let deviceData = apiDevices.find((d: any) => d.type === type);

                // Mock Data (agar API da bo'lmasa)
                if (!deviceData) {
                  deviceData = {
                    id: type,
                    type: type,
                    isOn: false,
                    brightness: 50,
                    speed: 50
                  };
                }

                return (
                  <motion.div 
                    key={type} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <DeviceCard
                      type={type}
                      device={deviceData}
                      aiMode={localAiMode}
                      onToggle={() => handleDeviceToggle(type, deviceData?.isOn || false)}
                      onBrightnessChange={(val) => handleSliderChange(type, val, 'brightness')}
                      onSpeedChange={(val) => handleSliderChange(type, val, 'speed')}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

        </motion.div>
      </main>
    </div>
  );
};

export default GreenhouseViewPage;