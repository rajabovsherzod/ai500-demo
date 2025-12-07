import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  ArrowLeft, Save, Thermometer, Droplets, Wind, Cloud, Check, 
  Loader2, WifiOff, Trash2, AlertTriangle 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

// Hooklar
import { useGreenhouseById, useUpdateGreenhouse, useDeleteGreenhouse } from "@/hooks/use-greenhouse-query";

// 1-MUAMMO YECHIMI: Inputlar bo'sh bo'lishi mumkin, shuning uchun string | number ishlatamiz
interface LocalSettings {
  tempMin: number | string;
  tempMax: number | string;
  humidityMin: number | string;
  humidityMax: number | string;
  soilMoistureMin: number | string;
  soilMoistureMax: number | string;
  co2Min: number | string;
  co2Max: number | string;
}

const GreenhouseSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  
  const { data: greenhouse, isLoading, isError } = useGreenhouseById(id);
  const { mutate: updateGreenhouse, isPending: isSaving } = useUpdateGreenhouse();
  const { mutate: deleteGreenhouse, isPending: isDeleting } = useDeleteGreenhouse();

  // State
  const [name, setName] = useState("");
  
  // Default qiymatlar
  const [settings, setSettings] = useState<LocalSettings>({
    tempMin: 18, tempMax: 28,
    humidityMin: 40, humidityMax: 80,
    soilMoistureMin: 30, soilMoistureMax: 70,
    co2Min: 400, co2Max: 1000
  });

  const [saved, setSaved] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 3-MUAMMO YECHIMI: Ma'lumot kelganda yangilash
  useEffect(() => {
    if (greenhouse) {
      // Nomni har doim yangilaymiz (agar bo'sh bo'lsa)
      if (!name) setName(greenhouse.name);
      
      // DIQQAT: Agar serverdan settings kelsa, uni olamiz.
      // Agar kelmasa (backend hali tayyor emas), o'zimizdagi defaultni saqlab qolamiz.
      // Shunda "Save" bosgandan keyin reset bo'lib qolmaydi.
      if (greenhouse.settings) {
        setSettings({
          tempMin: greenhouse.settings.tempMin ?? 18,
          tempMax: greenhouse.settings.tempMax ?? 28,
          humidityMin: greenhouse.settings.humidityMin ?? 40,
          humidityMax: greenhouse.settings.humidityMax ?? 80,
          soilMoistureMin: greenhouse.settings.soilMoistureMin ?? 30,
          soilMoistureMax: greenhouse.settings.soilMoistureMax ?? 70,
          co2Min: greenhouse.settings.co2Min ?? 400,
          co2Max: greenhouse.settings.co2Max ?? 1000,
        });
      }
    }
    // Dependency arraydan 'settings'ni olib tashladik, loop bo'lmasligi uchun
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greenhouse]); 

  // 1-MUAMMO YECHIMI: Input o'zgarganda "0" bo'lib qolmasligi uchun logika
  const handleSettingChange = (key: keyof LocalSettings, value: string) => {
    // Agar bo'sh bo'lsa, string holatida saqlaymiz (0 bo'lib qolmaydi)
    if (value === "") {
      setSettings(prev => ({ ...prev, [key]: "" }));
      return;
    }
    
    // Raqamga o'tkazishga harakat qilamiz
    const numValue = parseFloat(value);
    
    // Agar raqam bo'lsa yozamiz
    if (!isNaN(numValue)) {
      setSettings(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Nom kiritish majburiy!");
      return;
    }

    // Yuborishdan oldin hamma qiymatlarni aniq raqamga o'tkazamiz (bo'sh bo'lsa 0 ga)
    const apiSettings = {
      tempMin: Number(settings.tempMin) || 0,
      tempMax: Number(settings.tempMax) || 0,
      humidityMin: Number(settings.humidityMin) || 0,
      humidityMax: Number(settings.humidityMax) || 0,
      soilMoistureMin: Number(settings.soilMoistureMin) || 0,
      soilMoistureMax: Number(settings.soilMoistureMax) || 0,
      co2Min: Number(settings.co2Min) || 0,
      co2Max: Number(settings.co2Max) || 0,
    };

    updateGreenhouse(
      { 
        id: Number(id), 
        data: { 
          name: name,
          settings: apiSettings
        } 
      },
      { 
        onSuccess: () => { 
          setSaved(true); 
          setTimeout(() => setSaved(false), 2000); 
        } 
      }
    );
  };

  const handleDeleteConfirm = () => {
    deleteGreenhouse(Number(id));
  };

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
          <Link to="/dashboard"><Button variant="neon">{t("greenhouse.backToDashboard")}</Button></Link>
        </div>
      </div>
    );
  }

  const thresholdGroups = [
    { 
      title: t("sensors.temperature") || "Harorat", 
      icon: Thermometer, color: "neon-coral", unit: "°C",
      minKey: "tempMin" as keyof LocalSettings, 
      maxKey: "tempMax" as keyof LocalSettings 
    },
    { 
      title: t("sensors.airHumidity") || "Namlik", 
      icon: Cloud, color: "neon-cyan", unit: "%",
      minKey: "humidityMin" as keyof LocalSettings, 
      maxKey: "humidityMax" as keyof LocalSettings 
    },
    { 
      title: t("sensors.soilMoisture") || "Tuproq Namligi", 
      icon: Droplets, color: "neon-green", unit: "%",
      minKey: "soilMoistureMin" as keyof LocalSettings, 
      maxKey: "soilMoistureMax" as keyof LocalSettings 
    },
    { 
      title: t("sensors.co2Level") || "CO2", 
      icon: Wind, color: "neon-amber", unit: "ppm",
      minKey: "co2Min" as keyof LocalSettings, 
      maxKey: "co2Max" as keyof LocalSettings 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to={`/greenhouse/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                <span className="text-foreground">{t("settings.title") || "Sozlamalar"}</span>
              </h1>
              {/* 2-MUAMMO YECHIMI: Issiqxona nomi shu yerda ko'rinadi */}
              <p className="text-muted-foreground text-lg font-medium flex items-center gap-2">
                 {name || greenhouse.name} 
                 <span className="text-xs px-2 py-0.5 bg-primary/10 rounded text-primary font-normal ml-2">ID: {id}</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. General Settings */}
            <Card variant="glass">
              <CardHeader><CardTitle>{t("settings.general") || "Umumiy"}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.greenhouseName") || "Issiqxona Nomi"}</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Nomni kiriting"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Sensor Thresholds */}
            <Card variant="glass">
               <CardHeader>
                  <CardTitle>{t("settings.sensorThresholds") || "Chegaraviy Qiymatlar"}</CardTitle>
                  <CardDescription>
                    Sensorlar ushbu oraliqdan chiqib ketsa, tizim ogohlantirish beradi.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {thresholdGroups.map((group) => (
                    <div key={group.title} className="p-4 rounded-xl bg-muted/30 border border-primary/10 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `hsl(var(--${group.color}) / 0.2)` }}>
                          <group.icon className="w-4 h-4" style={{ color: `hsl(var(--${group.color}))` }} />
                        </div>
                        <span className="font-medium">{group.title}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t("sensors.min")} ({group.unit})</Label>
                          {/* 1-MUAMMO YECHIMI: Type="number" bo'lsa ham state stringni qabul qiladi */}
                          <Input 
                            type="number" 
                            value={settings[group.minKey]} 
                            onChange={(e) => handleSettingChange(group.minKey, e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{t("sensors.max")} ({group.unit})</Label>
                          <Input 
                            type="number" 
                            value={settings[group.maxKey]} 
                            onChange={(e) => handleSettingChange(group.maxKey, e.target.value)}
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <><Check className="w-5 h-5 mr-2" />Saqlandi</> : <><Save className="w-5 h-5 mr-2" />Saqlash</>}
            </Button>

            {/* 3. DANGER ZONE */}
            <div className="pt-8 border-t border-destructive/20 mt-8">
              <Card className="border-destructive/30 bg-destructive/5 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Xavfli Hudud
                  </CardTitle>
                  <CardDescription>
                    Bu issiqxonani o'chirish qaytarib bo'lmaydigan jarayon. Barcha ma'lumotlar yo'qoladi.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Issiqxonani O'chirish
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* DELETE CONFIRMATION MODAL */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="border-destructive/50 bg-background">
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Issiqxonani o'chirish
              </DialogTitle>
              <DialogDescription className="pt-2">
                Siz rostdan ham <strong>"{name}"</strong> issiqxonasini o'chirib tashlamoqchimisiz? <br/>
                Bu amalni bekor qilib bo'lmaydi.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button 
                variant="ghost" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Bekor qilish
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> O'chirilmoqda...</>
                ) : (
                  "Ha, o'chirilsin"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default GreenhouseSettingsPage;