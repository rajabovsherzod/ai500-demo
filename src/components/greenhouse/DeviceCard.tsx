import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Droplets, Wind, Lightbulb, Fan, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

const iconMap: any = {
  water_pump: Droplets,
  humidifier: Wind,
  led: Lightbulb,
  fan: Fan,
};

const deviceNameKeys: Record<string, string> = {
  water_pump: "devices.soilWaterPump",
  humidifier: "devices.airHumidifier",
  led: "devices.ledGrowLight",
  fan: "devices.ventilationFan",
};

interface DeviceCardProps {
  device?: {
    id: string;
    type: string;
    isOn: boolean;
    brightness?: number;
    speed?: number;
  };
  type: string; // Device tipi majburiy
  aiMode: boolean;
  onToggle: () => void;
  onBrightnessChange?: (value: number) => void;
  onSpeedChange?: (value: number) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  type,
  aiMode,
  onToggle,
  onBrightnessChange,
  onSpeedChange,
}) => {
  const { t } = useTranslation();
  const Icon = iconMap[type] || WifiOff;
  
  // Agar device ma'lumoti bo'lmasa, offline
  const isOffline = !device;
  const isDisabled = aiMode || isOffline;
  
  const deviceName = t(deviceNameKeys[type] || "Unknown Device");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="device"
        className={`relative ${isDisabled ? "opacity-60" : ""} ${
          device?.isOn ? "border-primary/60" : ""
        }`}
      >
        {/* Status Indicator */}
        <div
          className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
            isOffline
              ? "bg-red-500/50" // Offline bo'lsa qizil
              : device?.isOn ? "bg-neon-green animate-glow-pulse" : "bg-muted"
          }`}
          style={
            device?.isOn && !isOffline
              ? { boxShadow: "0 0 10px hsl(var(--neon-green))" }
              : undefined
          }
        />
        
        {/* Offline Icon */}
        {isOffline && (
           <WifiOff className="absolute top-4 right-8 w-3 h-3 text-muted-foreground" />
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                device?.isOn
                  ? "bg-primary/20 border border-primary/40"
                  : "bg-muted border border-muted"
              }`}
              style={
                device?.isOn
                  ? { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" }
                  : undefined
              }
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  device?.isOn ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <CardTitle className="text-base">{deviceName}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {isOffline 
                  ? "Offline" 
                  : aiMode ? t("devices.aiControlled") : t("devices.manualMode")}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Power Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("devices.power")}</span>
            <Switch
              checked={device?.isOn || false}
              onCheckedChange={onToggle}
              disabled={isDisabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Brightness Slider for LED */}
          {type === "led" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("devices.brightness")}</span>
                <span className="text-primary">{device?.brightness || 0}%</span>
              </div>
              <Slider
                value={[device?.brightness || 0]}
                onValueChange={(value) => onBrightnessChange?.(value[0])}
                max={100}
                step={1}
                disabled={isDisabled || !device?.isOn || isOffline}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
              />
            </div>
          )}

          {/* Speed Slider for Fan */}
          {type === "fan" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("devices.fanSpeed")}</span>
                <span className="text-primary">{device?.speed || 0}%</span>
              </div>
              <Slider
                value={[device?.speed || 0]}
                onValueChange={(value) => onSpeedChange?.(value[0])}
                max={100}
                step={1}
                disabled={isDisabled || !device?.isOn || isOffline}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
              />
            </div>
          )}

          {/* Status Badge */}
          <div
            className={`text-center py-2 rounded-lg text-sm font-medium ${
              isOffline
                ? "bg-muted text-muted-foreground"
                : device?.isOn
                ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isOffline 
              ? "Not Connected" 
              : device?.isOn ? t("devices.active") : t("devices.inactive")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeviceCard;
