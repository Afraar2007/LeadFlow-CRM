export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager';
  avatar: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}