import axios from 'axios';
import {
  Alumno, EstadoAlumno, Pago, ResumenPagos, Ejercicio,
  PatronMovimiento, Planificacion, SemanaPlan, DiaPlan,
  EjercicioPlanificado, EjercicioFijoPlan, DashboardKPIs, Usuario
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

const TOKEN_KEY = 'masgym_token';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('masgym_usuario');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  token: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'DUENO' | 'PROFESOR';
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),
};

export const usuarioService = {
  getAll: () => api.get<Usuario[]>('/usuarios'),
  create: (usuario: Partial<Usuario>) => api.post<Usuario>('/usuarios', usuario),
  update: (id: number | string, usuario: Partial<Usuario>) => api.put<Usuario>(`/usuarios/${id}`, usuario),
};

export const dashboardService = {
  getKpis: () => api.get<DashboardKPIs>('/dashboard'),
};

export const alumnoService = {
  getAll: () => api.get<Alumno[]>('/alumnos'),
  getById: (id: number | string) => api.get<Alumno>(`/alumnos/${id}`),
  getByEstado: (estado: EstadoAlumno) => api.get<Alumno[]>(`/alumnos/estado/${estado}`),
  create: (alumno: Partial<Alumno>) => api.post<Alumno>('/alumnos', alumno),
  update: (id: number | string, alumno: Partial<Alumno>) => api.put<Alumno>(`/alumnos/${id}`, alumno),
  delete: (id: number | string) => api.delete(`/alumnos/${id}`),
};

export const pagoService = {
  getAll: () => api.get<Pago[]>('/pagos'),
  getByAlumno: (alumnoId: number | string) => api.get<Pago[]>(`/pagos/alumno/${alumnoId}`),
  getVencidos: () => api.get<Pago[]>('/pagos/vencidos'),
  getProximosAVencer: (dias: number) => api.get<Pago[]>(`/pagos/proximos-a-vencer?dias=${dias}`),
  create: (pago: Partial<Pago>) => api.post<Pago>('/pagos', pago),
  update: (id: number | string, pago: Partial<Pago>) => api.put<Pago>(`/pagos/${id}`, pago),
  delete: (id: number | string) => api.delete(`/pagos/${id}`),
  getResumen: () => api.get<ResumenPagos>('/pagos/resumen'),
};

export const ejercicioService = {
  getAll: () => api.get<Ejercicio[]>('/ejercicios'),
  getById: (id: number | string) => api.get<Ejercicio>(`/ejercicios/${id}`),
  buscar: (nombre: string) => api.get<Ejercicio[]>(`/ejercicios/buscar?nombre=${nombre}`),
  getByGrupo: (grupo: PatronMovimiento) => api.get<Ejercicio[]>(`/ejercicios/grupo/${grupo}`),
  create: (ejercicio: Partial<Ejercicio>) => api.post<Ejercicio>('/ejercicios', ejercicio),
  update: (id: number | string, ejercicio: Partial<Ejercicio>) => api.put<Ejercicio>(`/ejercicios/${id}`, ejercicio),
  delete: (id: number | string) => api.delete(`/ejercicios/${id}`),
};

export const planificacionService = {
  getAll: () => api.get<Planificacion[]>('/planificaciones'),
  getById: (id: number | string) => api.get<Planificacion>(`/planificaciones/${id}`),
  getByAlumno: (alumnoId: number | string) => api.get<Planificacion[]>(`/planificaciones/alumno/${alumnoId}`),
  create: (plan: Partial<Planificacion>) => api.post<Planificacion>('/planificaciones', plan),
  update: (id: number | string, plan: Partial<Planificacion>) => api.put<Planificacion>(`/planificaciones/${id}`, plan),
  copiar: (id: number | string) => api.post<Planificacion>(`/planificaciones/${id}/copiar`),
  delete: (id: number | string) => api.delete(`/planificaciones/${id}`),
  enviar: (id: number | string) => api.post(`/planificaciones/${id}/enviar`),
};

export const semanaPlanService = {
  getByPlanificacion: (planId: number | string) => api.get<SemanaPlan[]>(`/semanas/planificacion/${planId}`),
  create: (semana: Partial<SemanaPlan>) => api.post<SemanaPlan>('/semanas', semana),
  update: (id: number | string, semana: Partial<SemanaPlan>) => api.put<SemanaPlan>(`/semanas/${id}`, semana),
  copiar: (id: number | string) => api.post<SemanaPlan>(`/semanas/${id}/copiar`),
  delete: (id: number | string) => api.delete(`/semanas/${id}`),
};

export const diaPlanService = {
  getBySemana: (semanaId: number | string) => api.get<DiaPlan[]>(`/dias/semana/${semanaId}`),
  create: (dia: Partial<DiaPlan>) => api.post<DiaPlan>('/dias', dia),
  delete: (id: number | string) => api.delete(`/dias/${id}`),
};

export const ejercicioPlanificadoService = {
  getByDia: (diaId: number | string) => api.get<EjercicioPlanificado[]>(`/ejercicios-planificados/dia/${diaId}`),
  create: (ejercicio: Partial<EjercicioPlanificado>) => api.post<EjercicioPlanificado>('/ejercicios-planificados', ejercicio),
  update: (id: number | string, ejercicio: Partial<EjercicioPlanificado>) => api.put<EjercicioPlanificado>(`/ejercicios-planificados/${id}`, ejercicio),
  delete: (id: number | string) => api.delete(`/ejercicios-planificados/${id}`),
};

export const ejercicioFijoPlanService = {
  getByPlanificacion: (planId: number | string) => api.get<EjercicioFijoPlan[]>(`/ejercicios-fijos-plan/planificacion/${planId}`),
  create: (ejercicioFijo: Partial<EjercicioFijoPlan>) => api.post<EjercicioFijoPlan>('/ejercicios-fijos-plan', ejercicioFijo),
  update: (id: number | string, ejercicioFijo: Partial<EjercicioFijoPlan>) => api.put<EjercicioFijoPlan>(`/ejercicios-fijos-plan/${id}`, ejercicioFijo),
  delete: (id: number | string) => api.delete(`/ejercicios-fijos-plan/${id}`),
};

export default api;
