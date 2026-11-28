/**
 * Avisa si se sale del detalle de un plan con cambios sin guardar.
 * El detalle registra acá si tiene cambios pendientes y el menú lateral pregunta
 * antes de navegar (la app usa BrowserRouter, que no trae bloqueo de navegación).
 */
import { confirmar } from '../components/DialogosGlobales';

let hayCambiosSinGuardar = false;

export function registrarCambiosSinGuardar(valor: boolean) {
  hayCambiosSinGuardar = valor;
}

/** true si se puede salir: no hay cambios, o el usuario acepta descartarlos. */
export async function confirmarSalida(): Promise<boolean> {
  if (!hayCambiosSinGuardar) return true;
  const ok = await confirmar({
    titulo: 'Cambios sin guardar',
    mensaje: 'Tenés cambios sin guardar en la planificación. Si salís, se pierden.',
    textoConfirmar: 'Salir sin guardar',
    textoCancelar: 'Seguir editando',
    colorConfirmar: 'error',
  });
  if (ok) hayCambiosSinGuardar = false;
  return ok;
}
