import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { authService } from '../services/api';
import { Rol } from '../types';

const TOKEN_KEY = 'masgym_token';
const USUARIO_KEY = 'masgym_usuario';

interface UsuarioSesion {
  nombre: string;
  email: string;
  rol: Rol;
}

interface AuthContextValue {
  usuario: UsuarioSesion | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function leerUsuarioGuardado(): UsuarioSesion | null {
  const raw = localStorage.getItem(USUARIO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UsuarioSesion;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(leerUsuarioGuardado);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authService.login(email, password);
    const sesion: UsuarioSesion = { nombre: data.nombre, email: data.email, rol: data.rol };
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(sesion));
    setUsuario(sesion);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated: !!usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return ctx;
}
