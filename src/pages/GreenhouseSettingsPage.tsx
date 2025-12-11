import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save, Trash2, Bell, Thermometer, Droplets, Wind, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useGreenhouseById } from "@/hooks/use-greenhouse-query";
import AgroLoader from "@/components/ui/agro-loader";

const GreenhouseSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  
  const { data: greenhouse, isLoading, isError } = useGreenhouseById(id);

  const [name, setName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [tempMin, setTempMin] = useState(18);
  const [tempMax, setTempMax] = useState(28);
  const [humidityMin, setHumidityMin] = useState(40);
  const [humidityMax, setHumidityMax] = useState(70);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (greenhouse) {
      setName(greenhouse.name || "");
    }
  }, [greenhouse]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success(t("settings.saved") || "Sozlamalar saqlandi!");
    setIsSaving(false);
  };

  const handleDelete = () => {
    toast.error(t("settings.deleteConfirm") || "Issiqxonani o'chirish hozircha mavjud emas");
  };

  if (isLoading) {
    return <AgroLoader text="Sozlamalar yuklanmoqda" size="lg" />;
  }

  if (isError || !greenhouse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Ma'lumot topilmadi</h2>
        <Link to="/dashboard">
          <Button variant="outline">Orqaga qaytish</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/greenhouse/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              <span className="text-foreground">{t("settings.title") || "Sozlamalar"}</span>
            </h1>
            <p className="text-muted-foreground text-sm">{greenhouse.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>{t("settings.general") || "Umumiy"}</CardTitle>
              <CardDescription>{t("settings.generalDesc") || "Issiqxona asosiy sozlamalari"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("settings.name") || "Nomi"}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Issiqxona nomi"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                {t("settings.notifications") || "Bildirishnomalar"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("settings.enableNotifications") || "Bildirishnomalarni yoqish"}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notificationsDesc") || "Ogohlantirish xabarlarini olish"}
                  </p>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
            </CardContent>
          </Card>

          {/* Temperature Thresholds */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-500" />
                {t("settings.tempThresholds") || "Harorat chegaralari"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{t("settings.minimum") || "Minimum"}</span>
                  <span className="text-primary font-mono">{tempMin}°C</span>
                </div>
                <Slider value={[tempMin]} onValueChange={(v) => setTempMin(v[0])} min={0} max={50} step={1} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{t("settings.maximum") || "Maximum"}</span>
                  <span className="text-primary font-mono">{tempMax}°C</span>
                </div>
                <Slider value={[tempMax]} onValueChange={(v) => setTempMax(v[0])} min={0} max={50} step={1} />
              </div>
            </CardContent>
          </Card>

          {/* Humidity Thresholds */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                {t("settings.humidityThresholds") || "Namlik chegaralari"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{t("settings.minimum") || "Minimum"}</span>
                  <span className="text-primary font-mono">{humidityMin}%</span>
                </div>
                <Slider value={[humidityMin]} onValueChange={(v) => setHumidityMin(v[0])} min={0} max={100} step={1} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{t("settings.maximum") || "Maximum"}</span>
                  <span className="text-primary font-mono">{humidityMax}%</span>
                </div>
                <Slider value={[humidityMax]} onValueChange={(v) => setHumidityMax(v[0])} min={0} max={100} step={1} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="neon" onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {t("settings.save") || "Saqlash"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              {t("settings.delete") || "O'chirish"}
            </Button>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default GreenhouseSettingsPage;