export interface Plant {
  id: number;
  name: string;
  type: string;
  variety: string;
  greenhouse_id: number;
  created_at?: string;
}

export interface CreatePlantPayload {
  name: string;
  type: string;
  variety: string;
}

export interface UpdatePlantPayload {
  name?: string;
  type?: string;
  variety?: string;
}