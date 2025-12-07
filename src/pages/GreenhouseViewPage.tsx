import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import AiModeToggle from "@/components/greenhouse/AiModeToggle";
import SensorCard from "@/components/greenhouse/SensorCard";
import DeviceCard from "@/components/greenhouse/DeviceCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, LineChart, Loader2, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGreenhouseById, useDeviceSwitch } from "@/hooks/use-greenhouse-query";

const EXPECTED_SENSORS = [
{ key: "temperature", type: "temperature", unit: "°C", min: 0, max: 50 },
{ key: "humidity", type: "humidity", unit: "%", min: 0, max: 100 },
{ key: "moisture", type: "soil_moisture", unit: "%", min: 0, max: 100 },
{ key: "air", type: "co2", unit: " ppm", min: 0, max: 2000 },
{ key: "light", type: "light", unit: " lux", min: 0, max: 10000 },
];

const EXPECTED_DEVICES = ["fan", "led", "water_pump", "humidifier"];

// Mapping
const UI_TO_API_MAP: Record<string, string> = {
fan: "air",
led: "led",
water_pump: "moisture",
humidifier: "humidity"
};

// Parser
const parseStatValue = (value: string | number | undefined | null): number | undefined => {
if (value === undefined || value === null) return undefined;
if (typeof value === "number") return value;
if (typeof value === "string") {
if (value === "string" || value.trim() === "") return undefined;
const parsed = parseFloat(value);
return isNaN(parsed) ? undefined : parsed;
}
return undefined;
};

const GreenhouseViewPage: React.FC = () => {
const { id } = useParams<{ id: string }>();
const { t } = useTranslation();

const { data: greenhouse, isLoading, isError } = useGreenhouseById(id);
const { mutate: switchDevice } = useDeviceSwitch();

// 1. Loading va Error holatlari
if (isLoading) {
return (
<div className="min-h-screen bg-background flex items-center justify-center">
<Loader2 className="w-10 h-10 animate-spin text-primary" />
</div>
);
}

if (isError || !greenhouse) {
// ... (Error handling code)
}

// Data Extracts
const stats = greenhouse.stats || {};
const apiDevices = (greenhouse as any).devices || [];
const fetchedAiMode = (greenhouse as any).aiMode || false; // Backenddan kelgan AI rejimi

// 2. AI Mode uchun mahalliy state yaratish
// Initial holat backenddan kelgan qiymat bo'ladi.
const [localAiMode, setLocalAiMode] = useState(fetchedAiMode);

// 3. Agar greenhouse data qayta yuklansa, localAiMode ni sinxronlash
useEffect(() => {
    setLocalAiMode(fetchedAiMode);
}, [fetchedAiMode]);


// 4. AI Mode toggle funksiyasi (Dummy implementation)
const handleAiToggle = () => {
    setLocalAiMode(prev => {
        console.log(`AI Mode toggled to: ${!prev} (DUMMY ACTION)`);
        // --- BU YERDA KELAJAKDA API CHAQLIRILADI ---
        // updateAiMode({ greenhouseId: Number(id), state: !prev });
        return !prev;
    });
};


// --- TOGGLE HANDLER (Devices) ---
const handleDeviceToggle = (uiType: string, currentState: boolean) => {
const apiName = UI_TO_API_MAP[uiType];
if (!apiName) return;

// Mutatsiyani chaqiramiz. 
// Eslatma: DeviceCard da UI darhol o'zgaradi, bu faqat serverga xabar berish uchun.
switchDevice({
  greenhouseId: Number(id),
  deviceName: apiName,
  state: !currentState
});

};

// --- SLIDER HANDLER (Console log yoki kelajakdagi API uchun) ---
const handleSliderChange = (uiType: string, value: number, setting: 'brightness' | 'speed') => {
console.log(`Setting ${setting} for ${uiType} to ${value}`);
// Kelajakda bu yerda API chaqiriladi:
// updateDeviceSettings({ id, device: uiType, [setting]: value });
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
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
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
          <Link to={`/greenhouse/${id}/analytics`}><Button variant="outline"><LineChart className="w-4 h-4 mr-2" />{t("greenhouse.analytics")}</Button></Link>
          <Link to={`/greenhouse/${id}/settings`}><Button variant="outline"><Settings className="w-4 h-4 mr-2" />{t("greenhouse.settings")}</Button></Link>
        </div>
      </div>

      {/* AI MODE TOGGLE (YANGILANGAN) */}
      <motion.div className="mb-8">
        <AiModeToggle aiMode={localAiMode} onToggle={handleAiToggle} />
      </motion.div>

      {/* SENSORS SECTION (O'zgarishsiz) */}
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

      {/* DEVICES SECTION (O'zgarishsiz) */}
      <motion.section>
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-green" />
          {t("greenhouse.devices")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXPECTED_DEVICES.map((type, index) => {
            // 1. API dan qidiramiz
            let deviceData = apiDevices.find((d: any) => d.type === type);

            // 2. MOCK DATA: Agar API bo'sh bo'lsa, soxta ma'lumot beramiz
            // Shunda kartalar Online bo'lib turadi va bosish mumkin bo'ladi.
            if (!deviceData) {
              deviceData = {
                id: type,
                type: type,
                isOn: false, // Default o'chiq
                brightness: 50,
                speed: 50
              };
            }
            
            return (
              <motion.div key={type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.05 }}>
                <DeviceCard
                  type={type}
                  device={deviceData} // Endi bu yerda data bor
                  aiMode={localAiMode} // Endi local state ishlatiladi
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