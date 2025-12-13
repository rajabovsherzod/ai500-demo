import React, { useState, useEffect } from "react";
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
  type: string;
  aiMode: boolean;
  onToggle?: (newState: boolean) => void;
  onSpeedChange?: (value: number) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  type,
  aiMode,
  onToggle,
  onSpeedChange,
}) => {
  const { t } = useTranslation();
  const Icon = iconMap[type] || WifiOff;

  const isOffline = !device;
  const isDisabled = isOffline || aiMode;

  const deviceName = t(deviceNameKeys[type] || "Unknown Device");

  // --- LOCAL STATE ---
  const [isOn, setIsOn] = useState(false);
  const [speed, setSpeed] = useState(0);

  // --- SYNC WITH SERVER ---
  useEffect(() => {
    if (device) {
      setIsOn(device.isOn);
      if (device.speed !== undefined) {
        setSpeed(device.speed);
      }
    }
  }, [device]);

  // --- HANDLERS ---
  const handleSwitch = (checked: boolean) => {
    setIsOn(checked); // Darhol vizual o'zgarish
    if (onToggle) {
        onToggle(checked); // API ga so'rov
    }
  };

  // Slider sudrab yurilganda (Faqat vizual o'zgaradi)
  const handleSliderChange = (val: number[]) => {
    setSpeed(val[0]);
  };

  // Slider qo'yib yuborilganda (API ga ketadi)
  const handleSliderCommit = (val: number[]) => {
    if (onSpeedChange) {
        onSpeedChange(val[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="device"
        className={`relative transition-all duration-300 
          ${isDisabled ? "opacity-70 grayscale-[0.3]" : ""} 
          ${isOn ? "border-primary/60 ring-1 ring-primary/20" : ""}`}
      >
        {/* Status Indicator */}
        <div
          className={`absolute top-4 right-4 w-3 h-3 rounded-full transition-all duration-300 ${
            isOffline
              ? "bg-red-500/50"
              : isOn
              ? "bg-neon-green animate-glow-pulse"
              : "bg-muted"
          }`}
          style={
            isOn && !isOffline
              ? { boxShadow: "0 0 10px hsl(var(--neon-green))" }
              : undefined
          }
        />

        {isOffline && (
          <WifiOff className="absolute top-4 right-8 w-3 h-3 text-muted-foreground" />
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isOn
                  ? "bg-primary/20 border border-primary/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-muted border border-muted"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-colors duration-300 ${
                  isOn ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <div>
              <CardTitle className="text-base">{deviceName}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {isOffline
                  ? "Offline"
                  : aiMode
                  ? t("devices.aiControlled")
                  : t("devices.manualMode")}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 1. POWER SWITCH (Hamma uchun, LED uchun ham) */}
          {onToggle && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("devices.power")}</span>
              <Switch
                checked={isOn}
                onCheckedChange={handleSwitch}
                disabled={isDisabled}
                className="data-[state=checked]:bg-primary transition-colors"
              />
            </div>
          )}

          {/* 2. SPEED SLIDER (Faqat FAN uchun) */}
          {type === "fan" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("devices.fanSpeed")}</span>
                <span className="text-primary font-mono">{speed}%</span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderCommit}
                max={100}
                step={1}
                disabled={isDisabled || !isOn}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary cursor-pointer touch-none"
              />
            </div>
          )}

          {/* Status Badge */}
          <div
            className={`text-center py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
              isOffline
                ? "bg-muted text-muted-foreground"
                : isOn
                ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isOffline
              ? "Not Connected"
              : isOn
              ? t("devices.active")
              : t("devices.inactive")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeviceCard;