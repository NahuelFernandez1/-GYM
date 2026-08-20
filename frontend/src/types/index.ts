export type EstadoAlumno = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type Sexo = 'MASCULINO' | 'FEMENINO' | 'OTRO';

export interface Alumno {
  id?: number;
  nombre: string;
  apellido: string;
  dni?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  sexo?: Sexo;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  observacionesMedicas?: string;
  objetivos?: string;
  estado: EstadoAlumno;
  fechaIngreso?: string;
  fechaVencimientoCuota?: string;
}

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA';
export type EstadoPago = 'PAGADO' | 'PENDIENTE' | 'VENCIDO';

export interface Pago {
  id?: number;
  alumno: Alumno | null;
  monto: number | string;
  fechaPago: string;
  fechaVencimiento: string;
  metodoPago: MetodoPago;
  estado: EstadoPago;
  notas?: string;
}

export interface ResumenPagos {
  recaudadoHoy: number;
  recaudadoMes: number;
}

export type PatronMovimiento = 'EMPUJE' | 'TRACCION' | 'MOVILIDAD' | 'CADERA' | 'RODILLA' | 'CORE';

export interface Ejercicio {
  id?: number;
  nombre: string;
  patronMovimiento: PatronMovimiento;
  descripcion?: string;
  videoUrl?: string;
}

export type EstadoPlanificacion = 'BORRADOR' | 'ENVIADA' | 'ARCHIVADA';

export interface Planificacion {
  id?: number;
  alumno: Alumno | null;
  nombre: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: EstadoPlanificacion;
  enviadoAt?: string | null;
}

export interface SemanaPlan {
  id?: number;
  planificacion?: { id: number };
  numeroSemana: number | string;
  notas?: string;
}

export interface DiaPlan {
  id?: number;
  semanaPlan?: { id: number };
  diaSemana: string;
  orden?: number;
}

export interface EjercicioPlanificado {
  id?: number;
  diaPlan?: { id: number };
  ejercicio?: Ejercicio;
  circuito?: string;
  series?: number | string;
  repeticiones?: number | string;
  rir?: string;
  notas?: string;
  orden?: number;
}

export type TipoBloqueFijo = 'MOVILIDAD' | 'ACTIVACION';

export interface EjercicioFijoPlan {
  id?: number;
  planificacion?: { id: number };
  ejercicio?: Ejercicio;
  tipoBloque: TipoBloqueFijo;
  seriesReps?: string;
  orden?: number;
}

export interface DashboardKPIs {
  alumnosActivos: number;
  pagosPendientes: number;
  pagosVencidos: number;
  alumnosProximosAVencer: number;
}
