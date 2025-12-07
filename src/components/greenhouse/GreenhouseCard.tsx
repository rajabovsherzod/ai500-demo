import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Settings, ArrowRight, Thermometer, Droplets, Wind, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Greenhouse } from "@/types/greenhouse";

// --- TUZATILGAN FUNKSIYA ---
const parseStatValue = (value: string | number | undefined | null): number | undefined => {
  // 1. Agar qiymat yo'q bo'lsa
  if (value === undefined || value === null) return undefined;
  
  // 2. Agar qiymat allaqachon raqam bo'lsa (Backend number yuborsa)
  if (typeof value === "number") return value;

  // 3. Agar qiymat string bo'lsa
  if (typeof value === "string") {
    // "string" so'zi yoki bo'sh joy bo'lsa
    if (value === "string" || value.trim() === "") return undefined;
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
};

interface GreenhouseCardProps {
  greenhouse: Greenhouse;
}

const GreenhouseCard: React.FC<GreenhouseCardProps> = ({ greenhouse }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // API dan kelgan stats (string yoki number bo'lishi mumkin)
  const tempVal = parseStatValue(greenhouse.stats?.temperature);
  const humidityVal = parseStatValue(greenhouse.stats?.humidity);
  const moistureVal = parseStatValue(greenhouse.stats?.moisture);
  
  const isOffline = tempVal === undefined && humidityVal === undefined;

  let statusColor = "neon-green"; 
  let statusLabel = t("greenhouse.healthy") || "Stabil";

  if (isOffline) {
    statusColor = "muted";
    statusLabel = "Offline";
  } else if ((tempVal || 0) > 35 || (tempVal || 0) < 10) {
    statusColor = "neon-coral";
    statusLabel = t("greenhouse.critical") || "Kritik";
  }

  const renderValue = (value: number | undefined, unit: string) => {
    if (value !== undefined) {
      return (
        <span className="text-lg font-display font-bold text-foreground flex items-center justify-center">
          {value.toFixed(0)}{unit}
        </span>
      );
    }
    return <WifiOff className="w-5 h-5 mx-auto text-muted-foreground/50" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="glow" className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300"
                style={{
                  backgroundColor: isOffline ? "hsl(var(--muted) / 0.2)" : `hsl(var(--${statusColor}) / 0.2)`,
                  border: isOffline ? "1px solid hsl(var(--muted))" : `1px solid hsl(var(--${statusColor}) / 0.4)`,
                  boxShadow: isOffline ? "none" : `0 0 15px hsl(var(--${statusColor}) / 0.3)`,
                }}
              >
                <Leaf className="w-6 h-6" style={{ color: isOffline ? "hsl(var(--muted-foreground))" : `hsl(var(--${statusColor}))` }} />
              </div>
              
              <div>
                <CardTitle className="text-lg">{greenhouse.name}</CardTitle>
                <span
                  className="text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                  style={{ color: isOffline ? "hsl(var(--muted-foreground))" : `hsl(var(--${statusColor}))` }}
                >
                  {statusLabel}
                </span>
              </div>
            </div>

            {!isOffline && (
              <div
                className="w-3 h-3 rounded-full animate-glow-pulse"
                style={{
                  backgroundColor: `hsl(var(--${statusColor}))`,
                  boxShadow: `0 0 10px hsl(var(--${statusColor}))`,
                }}
              />
            )}
            {isOffline && <WifiOff className="w-4 h-4 text-muted-foreground" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50 h-20 flex flex-col items-center justify-center">
              <Thermometer className="w-4 h-4 mx-auto mb-1 text-primary" />
              {renderValue(tempVal, "°")}
            </div>

            <div className="text-center p-2 rounded-lg bg-muted/50 h-20 flex flex-col items-center justify-center">
              <Wind className="w-4 h-4 mx-auto mb-1 text-primary" />
              {renderValue(humidityVal, "%")}
            </div>

            <div className="text-center p-2 rounded-lg bg-muted/50 h-20 flex flex-col items-center justify-center">
              <Droplets className="w-4 h-4 mx-auto mb-1 text-primary" />
              {renderValue(moistureVal, "%")}
            </div>
          </div>

          <div className="text-center py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground">
             {t("greenhouse.manualControl") || "Standart Rejim"}
          </div>

          <div className="flex gap-2">
            <Button
              variant="neon"
              className="flex-1"
              onClick={() => navigate(`/greenhouse/${greenhouse.id}`)}
            >
              {t("greenhouse.open") || "Kirish"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/greenhouse/${greenhouse.id}/settings`)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GreenhouseCard;