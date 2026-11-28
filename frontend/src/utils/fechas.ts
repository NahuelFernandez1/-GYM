/**
 * Muestra una fecha del backend ("aaaa-mm-dd", o con hora "aaaa-mm-ddThh:mm...")
 * como dd/mm/aaaa. Se corta el texto en vez de usar new Date() para que la zona
 * horaria no corra la fecha un día.
 */
export function formatearFecha(fecha?: string | null, siVacia = '—'): string {
  if (!fecha) return siVacia;
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  if (!anio || !mes || !dia) return fecha;
  return `${dia}/${mes}/${anio}`;
}
