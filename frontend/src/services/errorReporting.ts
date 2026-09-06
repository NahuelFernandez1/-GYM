import api from './api';

let ultimoReporte = 0;
const COOLDOWN_MS = 5000; // evita mandar decenas de requests si un error se repite en loop de render

export function reportarError(mensaje: string, stack?: string) {
  const ahora = Date.now();
  if (ahora - ultimoReporte < COOLDOWN_MS) return;
  ultimoReporte = ahora;

  // No debe poder romper nada más: si el reporte en sí falla, se ignora.
  api.post('/errores/reportar', {
    mensaje,
    stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
  }).catch(() => {});
}

export function inicializarCapturaDeErrores() {
  window.addEventListener('error', (event) => {
    reportarError(event.message, event.error?.stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const razon = event.reason;
    const mensaje = razon?.message || String(razon);
    reportarError(`Promesa rechazada sin manejar: ${mensaje}`, razon?.stack);
  });
}
