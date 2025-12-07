import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface SensorData {
  id: string;
  name: string;
  type: "temperature" | "humidity" | "soil_moisture" | "co2" | "light";
  value: number;
  unit: string;
  min: number;
  max: number;
  status: "good" | "warning" | "critical";
}

export interface DeviceData {
  id: string;
  name: string;
  type: "water_pump" | "humidifier" | "led" | "fan";
  isOn: boolean;
  isAuto: boolean;
  brightness?: number;
  speed?: number;
}

export interface Greenhouse {
  id: string;
  name: string;
  status: "ok" | "warning" | "critical";
  aiMode: boolean;
  sensors: SensorData[];
  devices: DeviceData[];
  settings: GreenhouseSettings;
}

export interface GreenhouseSettings {
  name: string;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  soilMoistureMin: number;
  soilMoistureMax: number;
  co2Min: number;
  co2Max: number;
}

interface GreenhouseContextType {
  greenhouses: Greenhouse[];
  addGreenhouse: (name: string) => void;
  updateGreenhouse: (id: string, updates: Partial<Greenhouse>) => void;
  updateGreenhouseSettings: (id: string, settings: GreenhouseSettings) => void;
  toggleAiMode: (id: string) => void;
  toggleDevice: (greenhouseId: string, deviceId: string) => void;
  setDeviceBrightness: (greenhouseId: string, deviceId: string, brightness: number) => void;
  setDeviceSpeed: (greenhouseId: string, deviceId: string, speed: number) => void;
}

const GreenhouseContext = createContext<GreenhouseContextType | undefined>(undefined);

const createMockSensors = (): SensorData[] => [
  {
    id: "1",
    name: "Soil Moisture",
    type: "soil_moisture",
    value: 65 + Math.random() * 10,
    unit: "%",
    min: 40,
    max: 80,
    status: "good",
  },
  {
    id: "2",
    name: "Air Humidity",
    type: "humidity",
    value: 55 + Math.random() * 15,
    unit: "%",
    min: 50,
    max: 70,
    status: "good",
  },
  {
    id: "3",
    name: "Temperature",
    type: "temperature",
    value: 22 + Math.random() * 5,
    unit: "°C",
    min: 18,
    max: 28,
    status: "good",
  },
  {
    id: "4",
    name: "CO₂ Level",
    type: "co2",
    value: 400 + Math.random() * 200,
    unit: "ppm",
    min: 300,
    max: 800,
    status: "good",
  },
  {
    id: "5",
    name: "Light Intensity",
    type: "light",
    value: 800 + Math.random() * 400,
    unit: "lux",
    min: 500,
    max: 1500,
    status: "good",
  },
];

const createMockDevices = (): DeviceData[] => [
  { id: "1", name: "Soil Water Pump", type: "water_pump", isOn: false, isAuto: true },
  { id: "2", name: "Air Humidifier", type: "humidifier", isOn: true, isAuto: true },
  { id: "3", name: "LED Grow Light", type: "led", isOn: true, isAuto: true, brightness: 75 },
  { id: "4", name: "Ventilation Fan", type: "fan", isOn: true, isAuto: true, speed: 50 },
];

const defaultSettings: GreenhouseSettings = {
  name: "",
  tempMin: 18,
  tempMax: 28,
  humidityMin: 50,
  humidityMax: 70,
  soilMoistureMin: 40,
  soilMoistureMax: 80,
  co2Min: 300,
  co2Max: 800,
};

export const GreenhouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([
    {
      id: "1",
      name: "Main Greenhouse",
      status: "ok",
      aiMode: true,
      sensors: createMockSensors(),
      devices: createMockDevices(),
      settings: { ...defaultSettings, name: "Main Greenhouse" },
    },
    {
      id: "2",
      name: "Tomato House",
      status: "warning",
      aiMode: true,
      sensors: createMockSensors(),
      devices: createMockDevices(),
      settings: { ...defaultSettings, name: "Tomato House" },
    },
  ]);

  // Simulate WebSocket updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGreenhouses((prev) =>
        prev.map((gh) => ({
          ...gh,
          sensors: gh.sensors.map((sensor) => {
            const variance = (Math.random() - 0.5) * 5;
            const newValue = Math.max(0, sensor.value + variance);
            let status: "good" | "warning" | "critical" = "good";
            
            if (newValue < sensor.min * 0.8 || newValue > sensor.max * 1.2) {
              status = "critical";
            } else if (newValue < sensor.min || newValue > sensor.max) {
              status = "warning";
            }
            
            return { ...sensor, value: newValue, status };
          }),
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const addGreenhouse = (name: string) => {
    const newGreenhouse: Greenhouse = {
      id: Date.now().toString(),
      name,
      status: "ok",
      aiMode: true,
      sensors: createMockSensors(),
      devices: createMockDevices(),
      settings: { ...defaultSettings, name },
    };
    setGreenhouses((prev) => [...prev, newGreenhouse]);
  };

  const updateGreenhouse = (id: string, updates: Partial<Greenhouse>) => {
    setGreenhouses((prev) =>
      prev.map((gh) => (gh.id === id ? { ...gh, ...updates } : gh))
    );
  };

  const updateGreenhouseSettings = (id: string, settings: GreenhouseSettings) => {
    setGreenhouses((prev) =>
      prev.map((gh) =>
        gh.id === id ? { ...gh, settings, name: settings.name } : gh
      )
    );
  };

  const toggleAiMode = (id: string) => {
    setGreenhouses((prev) =>
      prev.map((gh) => (gh.id === id ? { ...gh, aiMode: !gh.aiMode } : gh))
    );
  };

  const toggleDevice = (greenhouseId: string, deviceId: string) => {
    setGreenhouses((prev) =>
      prev.map((gh) =>
        gh.id === greenhouseId
          ? {
              ...gh,
              devices: gh.devices.map((device) =>
                device.id === deviceId ? { ...device, isOn: !device.isOn } : device
              ),
            }
          : gh
      )
    );
  };

  const setDeviceBrightness = (greenhouseId: string, deviceId: string, brightness: number) => {
    setGreenhouses((prev) =>
      prev.map((gh) =>
        gh.id === greenhouseId
          ? {
              ...gh,
              devices: gh.devices.map((device) =>
                device.id === deviceId ? { ...device, brightness } : device
              ),
            }
          : gh
      )
    );
  };

  const setDeviceSpeed = (greenhouseId: string, deviceId: string, speed: number) => {
    setGreenhouses((prev) =>
      prev.map((gh) =>
        gh.id === greenhouseId
          ? {
              ...gh,
              devices: gh.devices.map((device) =>
                device.id === deviceId ? { ...device, speed } : device
              ),
            }
          : gh
      )
    );
  };

  return (
    <GreenhouseContext.Provider
      value={{
        greenhouses,
        addGreenhouse,
        updateGreenhouse,
        updateGreenhouseSettings,
        toggleAiMode,
        toggleDevice,
        setDeviceBrightness,
        setDeviceSpeed,
      }}
    >
      {children}
    </GreenhouseContext.Provider>
  );
};

export const useGreenhouse = () => {
  const context = useContext(GreenhouseContext);
  if (context === undefined) {
    throw new Error("useGreenhouse must be used within a GreenhouseProvider");
  }
  return context;
};
