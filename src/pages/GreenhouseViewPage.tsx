import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AiModeToggle from "@/components/greenhouse/AiModeToggle";
import SensorCard from "@/components/greenhouse/SensorCard";
import DeviceCard from "@/components/greenhouse/DeviceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings, LineChart, AlertTriangle, Plus, Sprout, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGreenhouseById, useDeviceSwitch } from "@/hooks/use-greenhouse-query";
import AgroLoader from "@/components/ui/agro-loader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PlantCard from "@/components/greenhouse/PlantCard";
import { usePlantsByGreenhouse, usePlantTypes, useCreatePlant, useUpdatePlant, useDeletePlant } from "@/hooks/use-plants-query";
import { Plant } from "@/types/plant";
import { toast } from "sonner";

// ============ CONSTANTS ============
const EXPECTED_SENSORS = [
  { key: "temperature", type: "temperature", unit: "°C", min: 0, max: 50 },
  { key: "humidity", type: "humidity", unit: "%", min: 0, max: 100 },
  { key: "moisture", type: "soil_moisture", unit: "%", min: 0, max: 100 },
  { key: "air", type: "co2", unit: " ppm", min: 0, max: 2000 },
  { key: "light", type: "light", unit: " lux", min: 0, max: 10000 },
];

const EXPECTED_DEVICES = ["fan", "led", "water_pump", "humidifier"];

// UI device type -> API stats key (holat olish uchun)
const DEVICE_STATE_MAP: Record<string, string> = {
  fan: "fan",
  led: "led",
  water_pump: "soil_water_pump",
  humidifier: "air_water_pump"
};

// UI device type -> API endpoint device name (switch qilish uchun)
const UI_TO_API_MAP: Record<string, string> = {
  fan: "fan",
  led: "led",
  water_pump: "moisture",
  humidifier: "humidity"
};

// Fallback plant types
const FALLBACK_PLANT_TYPES = ["tomato", "cucumber", "pepper", "eggplant", "lettuce", "carrot", "onion", "garlic"];

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
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const greenhouseIdNum = id ? Number(id) : undefined;

  // ============ GREENHOUSE DATA ============
  const { data: greenhouse, isLoading, isError } = useGreenhouseById(id);
  const { mutate: switchDevice } = useDeviceSwitch();

  // ============ PLANTS DATA ============
  const { 
    data: plants = [], 
    isLoading: plantsLoading, 
    isError: plantsError,
    isFetched: plantsFetched 
  } = usePlantsByGreenhouse(greenhouseIdNum);
  
  const { data: plantTypesData = FALLBACK_PLANT_TYPES } = usePlantTypes();
  const plantTypes = plantTypesData.length > 0 ? plantTypesData : FALLBACK_PLANT_TYPES;
  
  const { mutate: createPlantMutation, isPending: isCreatingPlant } = useCreatePlant();
  const { mutate: updatePlantMutation, isPending: isUpdatingPlant } = useUpdatePlant();
  const { mutate: deletePlantMutation, isPending: isDeletingPlant } = useDeletePlant();

  // ============ LOCAL STATE ============
  const [localAiMode, setLocalAiMode] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [plantForm, setPlantForm] = useState({ name: "", type: "", variety: "" });
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);

  // ============ EFFECTS ============
  useEffect(() => {
    if (greenhouse?.aiMode !== undefined) {
      setLocalAiMode(greenhouse.aiMode);
    }
  }, [greenhouse]);

  // ============ HANDLERS ============
  const handleAiToggle = () => {
    setLocalAiMode((prev) => !prev);
  };

  const handleDeviceToggle = (uiType: string, newState: boolean) => {
    const apiName = UI_TO_API_MAP[uiType];
    if (!apiName || !id) return;

    switchDevice({
      greenhouseId: Number(id),
      deviceName: apiName,
      state: newState
    });
  };

  const handleSliderChange = (uiType: string, value: number, setting: 'brightness' | 'speed') => {
    console.log(`Setting ${setting} for ${uiType} to ${value}`);
  };

  // Plant handlers
  const handleOpenPlantModal = (plant?: Plant) => {
    if (plant) {
      setEditingPlant(plant);
      setPlantForm({ name: plant.name, type: plant.type, variety: plant.variety });
    } else {
      setEditingPlant(null);
      setPlantForm({ name: "", type: "", variety: "" });
    }
    setIsPlantModalOpen(true);
  };

  const handleSavePlant = () => {
    if (!plantForm.name || !plantForm.type) {
      toast.error(t("plants.validationError"));
      return;
    }

    if (editingPlant) {
      updatePlantMutation({
        greenhouseId: greenhouseIdNum!,
        plantId: editingPlant.id,
        data: plantForm
      }, {
        onSuccess: () => setIsPlantModalOpen(false)
      });
    } else {
      createPlantMutation({
        greenhouseId: greenhouseIdNum!,
        data: plantForm
      }, {
        onSuccess: () => setIsPlantModalOpen(false)
      });
    }
  };

  // Delete handlers
  const handleDeleteClick = (plant: Plant) => {
    setPlantToDelete(plant);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (plantToDelete) {
      deletePlantMutation({
        greenhouseId: greenhouseIdNum!,
        plantId: plantToDelete.id
      }, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setPlantToDelete(null);
        }
      });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setPlantToDelete(null);
  };

  // ============ CONDITIONAL RENDERS ============
  if (isLoading) {
    return <AgroLoader text={t("common.loading")} size="lg" />;
  }

  if (isError || !greenhouse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">{t("greenhouse.notFound")}</h2>
        <Link to="/dashboard">
          <Button variant="outline">{t("greenhouse.backToDashboard")}</Button>
        </Link>
      </div>
    );
  }

  // ============ PREPARE DATA ============
  const stats = greenhouse.stats || {};
  const showPlantsLoading = plantsLoading && !plantsFetched;

  // ============ MAIN RENDER ============
  return (
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
                  <SensorCard type={def.type} sensor={sensorData} greenhouseId={id} />
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* PLANTS SECTION */}
        <motion.section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              {t("greenhouse.plants")}
            </h2>
            <Button variant="outline" size="sm" onClick={() => handleOpenPlantModal()}>
              <Plus className="w-4 h-4 mr-2" />
              {t("plants.add")}
            </Button>
          </div>

          {showPlantsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("plants.loading")}
            </div>
          ) : plants.length === 0 ? (
            <Card variant="glass" className="border-dashed">
              <CardContent className="py-8 text-center">
                <Sprout className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t("plants.empty")}</p>
                <Button variant="neon" size="sm" className="mt-4" onClick={() => handleOpenPlantModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("plants.addFirst")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plants.map((plant, index) => (
                <motion.div 
                  key={plant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PlantCard
                    plant={plant}
                    onEdit={handleOpenPlantModal}
                    onDelete={handleDeleteClick}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* DEVICES SECTION */}
        <motion.section>
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {t("greenhouse.devices")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXPECTED_DEVICES.map((type, index) => {
              // Stats dan device holatini olish
              const stateKey = DEVICE_STATE_MAP[type];
              const isOn = stateKey ? Boolean((stats as any)[stateKey]) : false;

              const deviceData = {
                id: type,
                type: type,
                isOn: isOn,
                brightness: 50,
                speed: 50
              };

              // O'ZGARISH: Agar type 'led' bo'lsa, onToggle ni undefined qilamiz
              // Boshqa devicelar uchun oddiy funksiyani beramiz
              const isLed = type === 'led';
              
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
                    // LED uchun Switch funksiyasini uzib qo'yamiz
                    onToggle={isLed ? undefined : (newState) => handleDeviceToggle(type, newState)}
                    onBrightnessChange={(val) => handleSliderChange(type, val, 'brightness')}
                    onSpeedChange={(val) => handleSliderChange(type, val, 'speed')}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.section>

      </motion.div>

      {/* PLANT ADD/EDIT MODAL */}
      <Dialog open={isPlantModalOpen} onOpenChange={setIsPlantModalOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              {editingPlant ? t("plants.editPlant") : t("plants.newPlant")}
            </DialogTitle>
            <DialogDescription>
              {editingPlant ? t("plants.editDescription") : t("plants.addDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t("plants.name")} *</Label>
              <Input
                placeholder={t("plants.namePlaceholder")}
                value={plantForm.name}
                onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("plants.type")} *</Label>
              <Select 
                value={plantForm.type} 
                onValueChange={(v) => setPlantForm({ ...plantForm, type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("plants.typePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {plantTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {t(`plants.types.${type}`) || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("plants.variety")}</Label>
              <Input
                placeholder={t("plants.varietyPlaceholder")}
                value={plantForm.variety}
                onChange={(e) => setPlantForm({ ...plantForm, variety: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setIsPlantModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                variant="neon" 
                onClick={handleSavePlant}
                disabled={isCreatingPlant || isUpdatingPlant}
              >
                {(isCreatingPlant || isUpdatingPlant) ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("plants.saving")}</>
                ) : editingPlant ? t("plants.update") : t("plants.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              {t("common.delete")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              <span className="font-semibold text-foreground">"{plantToDelete?.name}"</span> {t("plants.deleteConfirm")}
              <br />
              <span className="text-sm text-destructive/80 mt-2 block">
                Bu amalni qaytarib bo'lmaydi.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeletingPlant}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingPlant}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeletingPlant ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> O'chirilmoqda...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> {t("common.delete")}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default GreenhouseViewPage;