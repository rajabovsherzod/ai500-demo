export interface GreenhouseStats {
  air?: string | null;          // CO2
  light?: string | null;        // Yorug'lik
  humidity?: string | null;     // Havo namligi
  temperature?: string | null;  // Harorat
  moisture?: string | null;     // Tuproq namligi
}

export interface Greenhouse {
  id: number;
  name: string;
  created_at: string;
  stats?: any; 
  settings?: GreenhouseSettings; // Backenddan kelishi kerak
  aiMode?: boolean
}

export interface CreateGreenhousePayload {
  name: string;
}

export interface UpdateGreenhousePayload {
  name: string;
  settings?: GreenhouseSettings;
}


export interface GreenhouseSettings {
  tempMin?: number;
  tempMax?: number;
  humidityMin?: number;
  humidityMax?: number;
  soilMoistureMin?: number;
  soilMoistureMax?: number;
  co2Min?: number;
  co2Max?: number;
}