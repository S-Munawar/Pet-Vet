import React, {
  useState,
  type ReactNode,
} from 'react';
import type { User, AuthResponse, RegisterRequest, LoginRequest } from '../types/interfaces';
import { AuthContext } from '../types/AuthContextType';
// import { UserRole } from '../../../shared/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const token = sessionStorage.getItem('accessToken');
    console.log('AuthProvider init - AccessToken from sessionStorage:', !!token);
    return token;
  });

  const [user, setUser] = useState<User | null>(() => {
    // Only restore a stored user if there is an access token in sessionStorage.
    // This prevents stale `user` data from localStorage granting access when
    // there is no valid session token.
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      console.log('AuthProvider init - no access token, not restoring user from localStorage');
      return null;
    }

    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : null;
    console.log('AuthProvider init - restoring user from localStorage:', userData);
    return userData;
  });
  const [loading] = useState(false);

  const setAuthFromTokens = (auth: AuthResponse) => {
    console.log('setAuthFromTokens called with:', auth);
    setUser(auth.user);
    setAccessToken(auth.accessToken);

    localStorage.setItem('user', JSON.stringify(auth.user));
    localStorage.setItem('refreshToken', auth.refreshToken);
    sessionStorage.setItem('accessToken', auth.accessToken);
    
    console.log('Auth tokens set - User:', auth.user);
    console.log('Auth tokens set - AccessToken stored:', !!auth.accessToken);
  };

  const login = async (email: string, password: string) => {
    const loginData: LoginRequest = { email, password };
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }

    const data: AuthResponse = await res.json();
    setAuthFromTokens(data);
  };

  const register = async (data: RegisterRequest) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }

    // For now: after register, just ask them to verify email and then login.
    // So we DO NOT auto-login here.
  };
  
  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    setAccessToken(data.accessToken);
    sessionStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      window.location.href = '/';
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        register,
        logout,
        refreshAccessToken,
        setAuthFromTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


