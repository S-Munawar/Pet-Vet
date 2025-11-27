import { createContext } from 'react';
import type { User, AuthResponse, UserRole } from './auth';

export type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    licenseNumber?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  setAuthFromTokens: (auth: AuthResponse) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);