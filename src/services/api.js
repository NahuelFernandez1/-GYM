import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const dashboardService = {
  getKpis: () => api.get('/dashboard'),
};

export const alumnoService = {
  getAll: () => api.get('/alumnos'),
  getById: (id) => api.get(`/alumnos/${id}`),
  getByEstado: (estado) => api.get(`/alumnos/estado/${estado}`),
  create: (alumno) => api.post('/alumnos', alumno),
  update: (id, alumno) => api.put(`/alumnos/${id}`, alumno),
  delete: (id) => api.delete(`/alumnos/${id}`),
};

export const pagoService = {
  getAll: () => api.get('/pagos'),
  getByAlumno: (alumnoId) => api.get(`/pagos/alumno/${alumnoId}`),
  getVencidos: () => api.get('/pagos/vencidos'),
  getProximosAVencer: (dias) => api.get(`/pagos/proximos-a-vencer?dias=${dias}`),
  create: (pago) => api.post('/pagos', pago),
  update: (id, pago) => api.put(`/pagos/${id}`, pago),
  delete: (id) => api.delete(`/pagos/${id}`),
  getResumen: () => api.get('/pagos/resumen'),
};

export const ejercicioService = {
  getAll: () => api.get('/ejercicios'),
  getById: (id) => api.get(`/ejercicios/${id}`),
  buscar: (nombre) => api.get(`/ejercicios/buscar?nombre=${nombre}`),
  getByGrupo: (grupo) => api.get(`/ejercicios/grupo/${grupo}`),
  create: (ejercicio) => api.post('/ejercicios', ejercicio),
  update: (id, ejercicio) => api.put(`/ejercicios/${id}`, ejercicio),
  delete: (id) => api.delete(`/ejercicios/${id}`),
};

export const planificacionService = {
  getAll: () => api.get('/planificaciones'),
  getById: (id) => api.get(`/planificaciones/${id}`),
  getByAlumno: (alumnoId) => api.get(`/planificaciones/alumno/${alumnoId}`),
  create: (plan) => api.post('/planificaciones', plan),
  update: (id, plan) => api.put(`/planificaciones/${id}`, plan),
  copiar: (id) => api.post(`/planificaciones/${id}/copiar`),
  delete: (id) => api.delete(`/planificaciones/${id}`),
  enviar: (id) => api.post(`/planificaciones/${id}/enviar`),
};


export const semanaPlanService = {
  getByPlanificacion: (planId) => api.get(`/semanas/planificacion/${planId}`),
  create: (semana) => api.post('/semanas', semana),
  update: (id, semana) => api.put(`/semanas/${id}`, semana),
  copiar: (id) => api.post(`/semanas/${id}/copiar`),
  delete: (id) => api.delete(`/semanas/${id}`),
};

export const diaPlanService = {
  getBySemana: (semanaId) => api.get(`/dias/semana/${semanaId}`),
  create: (dia) => api.post('/dias', dia),
  delete: (id) => api.delete(`/dias/${id}`),
};

export const ejercicioPlanificadoService = {
  getByDia: (diaId) => api.get(`/ejercicios-planificados/dia/${diaId}`),
  create: (ejercicio) => api.post('/ejercicios-planificados', ejercicio),
  update: (id, ejercicio) => api.put(`/ejercicios-planificados/${id}`, ejercicio),
  delete: (id) => api.delete(`/ejercicios-planificados/${id}`),
};
export default api;