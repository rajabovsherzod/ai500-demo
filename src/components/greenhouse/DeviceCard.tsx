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
  onToggle: (newState: boolean) => void; // O'ZGARISH: Yangi state qabul qiladi
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

  // Offline yoki Disabled holatlari
  const isOffline = !device;
  // Agar AI rejimida bo'lsa yoki Device yo'q bo'lsa - bloklaymiz
  const isDisabled = isOffline || aiMode;

  const deviceName = t(deviceNameKeys[type] || "Unknown Device");

  // --- LOCAL STATE ---
  // Bular faqat UI silliq ishlashi uchun
  const [isOn, setIsOn] = useState(device?.isOn || false);
  const [brightness, setBrightness] = useState(device?.brightness || 0);
  const [speed, setSpeed] = useState(device?.speed || 0);

  // --- SYNC WITH SERVER ---
  // Serverdan yangi ma'lumot kelsa, local stateni yangilaymiz.
  useEffect(() => {
    if (device) {
      setIsOn(device.isOn);
      if (device.brightness !== undefined) setBrightness(device.brightness);
      if (device.speed !== undefined) setSpeed(device.speed);
    }
  }, [device?.isOn, device?.brightness, device?.speed]);

  // --- HANDLERS ---

  // 1. Switch bosilganda
  const handleSwitch = (checked: boolean) => {
    setIsOn(checked);    // 1. Darhol vizual o'zgartiramiz
    onToggle(checked);   // 2. O'ZGARISH: Yangi state ni API ga yuboramiz
  };

  // 2. Slider surilayotganda (Faqat vizual)
  const handleSliderMove = (val: number[], mode: "brightness" | "speed") => {
    if (mode === "brightness") setBrightness(val[0]);
    if (mode === "speed") setSpeed(val[0]);
  };

  // 3. Slider qo'yib yuborilganda (API call)
  const handleSliderCommit = (val: number[], mode: "brightness" | "speed") => {
    if (mode === "brightness" && onBrightnessChange) onBrightnessChange(val[0]);
    if (mode === "speed" && onSpeedChange) onSpeedChange(val[0]);
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
          {/* Power Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("devices.power")}</span>

            {/* SWITCH: Local State (isOn) ga bog'langan */}
            <Switch
              checked={isOn}
              onCheckedChange={handleSwitch}
              disabled={isDisabled}
              className="data-[state=checked]:bg-primary transition-colors"
            />
          </div>

          {/* Brightness Slider */}
          {type === "led" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("devices.brightness")}</span>
                <span className="text-primary font-mono">{brightness}%</span>
              </div>
              <Slider
                value={[brightness]}
                onValueChange={(val) => handleSliderMove(val, "brightness")}
                onValueCommit={(val) => handleSliderCommit(val, "brightness")}
                max={100}
                step={1}
                disabled={isDisabled || !isOn}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary cursor-pointer"
              />
            </div>
          )}

          {/* Speed Slider */}
          {type === "fan" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t("devices.fanSpeed")}</span>
                <span className="text-primary font-mono">{speed}%</span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={(val) => handleSliderMove(val, "speed")}
                onValueCommit={(val) => handleSliderCommit(val, "speed")}
                max={100}
                step={1}
                disabled={isDisabled || !isOn}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary cursor-pointer"
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