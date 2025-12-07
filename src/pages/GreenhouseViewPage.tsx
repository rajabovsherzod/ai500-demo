import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import AiModeToggle from "@/components/greenhouse/AiModeToggle";
import SensorCard from "@/components/greenhouse/SensorCard";
import DeviceCard from "@/components/greenhouse/DeviceCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, LineChart, Loader2, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
// Hooklarni import qilamiz
import { useGreenhouseById, useDeviceSwitch } from "@/hooks/use-greenhouse-query";

const EXPECTED_SENSORS = [
  { key: "temperature", type: "temperature", unit: "°C", min: 0, max: 50 },
  { key: "humidity", type: "humidity", unit: "%", min: 0, max: 100 },
  { key: "moisture", type: "soil_moisture", unit: "%", min: 0, max: 100 },
  { key: "air", type: "co2", unit: " ppm", min: 0, max: 2000 },
  { key: "light", type: "light", unit: " lux", min: 0, max: 10000 },
];

const EXPECTED_DEVICES = ["fan", "led", "water_pump", "humidifier"];

// --- MUHIM: UI nomlarini API nomlariga o'girish ---
const UI_TO_API_MAP: Record<string, string> = {
  fan: "air",          // Ventilyator -> air
  led: "led",          // Chiroq -> led
  water_pump: "moisture", // Nasos -> moisture (suv bilan bog'liq bo'lgani uchun)
  humidifier: "humidity"  // Namlagich -> humidity
};

const parseStatValue = (value: string | undefined | null): number | undefined => {
  if (!value || value === "string" || value.trim() === "") return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

const GreenhouseViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: greenhouse, isLoading, isError } = useGreenhouseById(id);
  // Switch hookini chaqiramiz
  const { mutate: switchDevice } = useDeviceSwitch();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !greenhouse) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <WifiOff className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h1 className="font-display text-2xl font-bold mb-4">{t("greenhouse.notFound") || "Topilmadi"}</h1>
          <Link to="/dashboard">
            <Button variant="neon">{t("greenhouse.backToDashboard")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = greenhouse.stats || {};
  
  // Hozircha API dan devices kelmayapti, shuning uchun array bo'sh bo'lishi mumkin.
  // Lekin biz "mock" qilib, agar data kelmasa ham kartani ko'rsatib turamiz (Switch ishlashini tekshirish uchun),
  // yoki DeviceCard o'zi "Offline" bo'lib turadi.
  const apiDevices = (greenhouse as any).devices || [];
  const aiMode = (greenhouse as any).aiMode || false;

  // Toggle funksiyasi
  const handleDeviceToggle = (uiType: string, currentState: boolean) => {
    // 1. API ga kerakli nomni topamiz
    const apiName = UI_TO_API_MAP[uiType];
    
    if (!apiName) {
      console.error("Noma'lum qurilma turi:", uiType);
      return;
    }

    // 2. Mutatsiyani chaqiramiz
    switchDevice({
      greenhouseId: Number(id),
      deviceName: apiName,
      state: !currentState // Hozirgi holatni teskarisiga o'zgartiramiz
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
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
                   <span className="text-xs px-2 py-0.5 bg-primary/10 rounded text-primary">ID: {greenhouse.id}</span>
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

          <motion.div className="mb-8">
            <AiModeToggle aiMode={aiMode} onToggle={() => {}} />
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
                  id: def.key, type: def.type, value: value, unit: def.unit, min: def.min, max: def.max, status: "good" as const
                } : undefined;
                
                return (
                  <motion.div key={def.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.05 }}>
                    <SensorCard type={def.type} sensor={sensorData} greenhouseId={id || ""} />
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* DEVICES SECTION */}
          <motion.section>
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green" />
              {t("greenhouse.devices")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXPECTED_DEVICES.map((type, index) => {
                const deviceData = apiDevices.find((d: any) => d.type === type);
                
                // DIQQAT: Agar deviceData undefined bo'lsa (Offline), switch ishlamaydi (Disabled bo'ladi).
                // Agar siz API ni test qilmoqchi bo'lsangiz, vaqtincha fake obyekt berib turishingiz mumkin.
                // Masalan: device={deviceData || { id: type, type: type, isOn: false }}
                
                return (
                  <motion.div key={type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.05 }}>
                    <DeviceCard
                      type={type}
                      device={deviceData} 
                      aiMode={aiMode}
                      // Toggle bosilganda bizning funksiya ishlaydi
                      onToggle={() => handleDeviceToggle(type, deviceData?.isOn || false)}
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