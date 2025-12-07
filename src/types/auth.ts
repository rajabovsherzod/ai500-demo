
export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  id: number;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}