import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import ConfirmDialog from './ConfirmDialog';

/**
 * Reemplazo de window.confirm / window.alert con el mismo estilo que el resto de la app.
 * Se monta una sola vez (en App) y desde cualquier lado se llama a confirmar() o avisar().
 */

export interface OpcionesConfirmar {
  titulo: string;
  mensaje: React.ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  colorConfirmar?: 'error' | 'primary' | 'warning';
}

type TipoAviso = 'success' | 'error' | 'warning' | 'info';

let abrirConfirmacion: ((opciones: OpcionesConfirmar, responder: (ok: boolean) => void) => void) | null = null;
let mostrarAviso: ((mensaje: string, tipo: TipoAviso) => void) | null = null;

/** Muestra el cartel de confirmación y resuelve true si se acepta. */
export function confirmar(opciones: OpcionesConfirmar): Promise<boolean> {
  return new Promise(resolve => {
    if (abrirConfirmacion) abrirConfirmacion(opciones, resolve);
    else resolve(window.confirm(String(opciones.mensaje)));
  });
}

/** Aviso abajo de la pantalla, como los de guardado. */
export function avisar(mensaje: string, tipo: TipoAviso = 'error') {
  if (mostrarAviso) mostrarAviso(mensaje, tipo);
}

const DialogosGlobales: React.FC = () => {
  const [pedido, setPedido] = useState<{ opciones: OpcionesConfirmar; responder: (ok: boolean) => void } | null>(null);
  const [aviso, setAviso] = useState<{ open: boolean; mensaje: string; tipo: TipoAviso }>({
    open: false, mensaje: '', tipo: 'success',
  });

  useEffect(() => {
    abrirConfirmacion = (opciones, responder) => setPedido({ opciones, responder });
    mostrarAviso = (mensaje, tipo) => setAviso({ open: true, mensaje, tipo });
    return () => {
      abrirConfirmacion = null;
      mostrarAviso = null;
    };
  }, []);

  // ConfirmDialog llama a onConfirm y despues a onClose: se responde una sola vez.
  const responder = (ok: boolean) => {
    setPedido(actual => {
      actual?.responder(ok);
      return null;
    });
  };

  return (
    <>
      <ConfirmDialog
        open={!!pedido}
        titulo={pedido?.opciones.titulo || ''}
        mensaje={pedido?.opciones.mensaje}
        textoConfirmar={pedido?.opciones.textoConfirmar}
        textoCancelar={pedido?.opciones.textoCancelar}
        colorConfirmar={pedido?.opciones.colorConfirmar}
        onConfirm={() => responder(true)}
        onClose={() => responder(false)}
      />
      <Snackbar
        open={aviso.open}
        autoHideDuration={4000}
        onClose={() => setAviso(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setAviso(prev => ({ ...prev, open: false }))}
          severity={aviso.tipo}
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          {aviso.mensaje}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DialogosGlobales;
