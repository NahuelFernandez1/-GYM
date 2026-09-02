import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, Box, Divider
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmDialogProps {
  open: boolean;
  titulo: string;
  mensaje: React.ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  colorConfirmar?: 'error' | 'primary' | 'warning';
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  textoCancelar = 'Cancelar',
  colorConfirmar = 'error',
  onConfirm,
  onClose,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#fef3c7',
              color: '#b45309',
              flexShrink: 0,
            }}
          >
            <WarningAmberIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {titulo}
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" sx={{ color: '#475569' }}>
          {mensaje}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} sx={{ color: '#64748b' }}>
          {textoCancelar}
        </Button>
        <Button variant="contained" color={colorConfirmar} onClick={handleConfirm} sx={{ fontWeight: 700, px: 3 }}>
          {textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
