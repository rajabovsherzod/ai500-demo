import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Types faylingizdan import qiling yoki shu yerda interface ishlating
// import { SensorData } from "@/types/greenhouse"; 
import { Droplets, Thermometer, Wind, Cloud, Sun, LineChart, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const iconMap: any = {
  soil_moisture: Droplets,
  humidity: Cloud,
  temperature: Thermometer,
  co2: Wind,
  light: Sun,
};

const statusColors: any = {
  good: "neon-green",
  warning: "neon-amber",
  critical: "neon-coral",
  offline: "muted-foreground", // Offline rangi
};

const sensorNameKeys: Record<string, string> = {
  soil_moisture: "sensors.soilMoisture",
  humidity: "sensors.airHumidity",
  temperature: "sensors.temperature",
  co2: "sensors.co2Level",
  light: "sensors.lightIntensity",
};

interface SensorCardProps {
  // Sensor optional bo'ldi, chunki ma'lumot kelmasligi mumkin
  sensor?: {
    id: string;
    type: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    status: "good" | "warning" | "critical";
  };
  type: string; // Sensor tipi (temp, humidity...) majburiy, icon uchun
  greenhouseId: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor, type, greenhouseId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Agar sensor data bo'lmasa, offline deb hisoblaymiz
  const isOffline = !sensor;
  
  const Icon = iconMap[type] || WifiOff;
  // Offline bo'lsa rangni kulrang qilamiz
  const statusColor = isOffline ? statusColors.offline : statusColors[sensor?.status || "good"];
  const sensorName = t(sensorNameKeys[type] || "Unknown");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="sensor" className="relative overflow-hidden">
        {/* Pulse animation faqat online bo'lsa ishlaydi */}
        {!isOffline && (
          <motion.div
            animate={{
              opacity: [0, 0.5, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-4 right-4 w-2 h-2 rounded-full"
            style={{ backgroundColor: `hsl(var(--${statusColor}))` }}
          />
        )}
        
        {/* Offline Icon indicator */}
        {isOffline && (
           <div className="absolute top-4 right-4">
             <WifiOff className="w-4 h-4 text-muted-foreground/50" />
           </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
              style={{
                backgroundColor: `hsl(var(--${statusColor}) / 0.2)`,
                boxShadow: `0 0 15px hsl(var(--${statusColor}) / 0.3)`,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: `hsl(var(--${statusColor}))` }} />
            </div>
            <CardTitle className="text-base">{sensorName}</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Value Display */}
            <div className="text-center py-4">
              {isOffline ? (
                // Offline bo'lsa chiziqcha
                <span className="font-display text-4xl font-bold text-muted-foreground/30">
                  --.-
                </span>
              ) : (
                <motion.span
                  key={sensor?.value}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="font-display text-4xl font-bold"
                  style={{
                    color: `hsl(var(--${statusColor}))`,
                    textShadow: `0 0 20px hsl(var(--${statusColor}) / 0.5)`,
                  }}
                >
                  {sensor?.value.toFixed(1)}
                </motion.span>
              )}
              <span className="text-muted-foreground ml-1 text-lg">
                {isOffline ? "" : sensor?.unit}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("sensors.min")}: {sensor?.min || 0}</span>
                <span>{t("sensors.max")}: {sensor?.max || 100}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  animate={{
                    width: isOffline ? "0%" : `${Math.min(100, Math.max(0, (((sensor?.value || 0) - (sensor?.min || 0)) / ((sensor?.max || 100) - (sensor?.min || 0))) * 100))}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: `hsl(var(--${statusColor}))`,
                    boxShadow: `0 0 10px hsl(var(--${statusColor}) / 0.5)`,
                  }}
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                style={{
                  backgroundColor: `hsl(var(--${statusColor}) / 0.2)`,
                  color: `hsl(var(--${statusColor}))`,
                  border: `1px solid hsl(var(--${statusColor}) / 0.4)`,
                }}
              >
                {isOffline ? "NO SIGNAL" : t(`sensors.${sensor?.status}`)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={isOffline}
                onClick={() => navigate(`/greenhouse/${greenhouseId}/analytics?sensor=${sensor?.id}`)}
                className="text-muted-foreground hover:text-primary disabled:opacity-50"
              >
                <LineChart className="w-4 h-4 mr-1" />
                {t("sensors.chart")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SensorCard;