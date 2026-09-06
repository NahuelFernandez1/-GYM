import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment, Tooltip, Stack,
  Divider, Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { planificacionService, alumnoService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import { Planificacion, Alumno, EstadoPlanificacion } from '../types';
import ConfirmDialog from '../components/ConfirmDialog';

const estadoStyles: Record<EstadoPlanificacion, { bg: string; text: string; border: string; label: string }> = {
  BORRADOR: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0', label: 'Borrador' },
  ENVIADA: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Enviada' },
  ARCHIVADA: { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Archivada' },
};

const planInicial: Planificacion = {
  alumno: null,
  nombre: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'BORRADOR',
};

const Planificaciones: React.FC = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<Planificacion[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planActual, setPlanActual] = useState<Planificacion>(planInicial);
  const [editando, setEditando] = useState(false);
  const [planAEliminar, setPlanAEliminar] = useState<Planificacion | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; mensaje: string; tipo: 'success' | 'error' }>({
    open: false,
    mensaje: '',
    tipo: 'success',
  });

  useEffect(() => {
    cargarPlanes();
    alumnoService.getAll().then(res => setAlumnos(res.data)).catch(() => {
      setSnackbar({ open: true, mensaje: 'No se pudo cargar la lista de alumnos.', tipo: 'error' });
    });
  }, []);

  const cargarPlanes = () => {
    planificacionService.getAll().then(res => setPlanes(res.data)).catch(() => {
      setSnackbar({ open: true, mensaje: 'No se pudieron cargar las planificaciones.', tipo: 'error' });
    });
  };

  const abrirNuevo = () => {
    setPlanActual(planInicial);
    setEditando(false);
    setDialogOpen(true);
  };

  const abrirEditar = (plan: Planificacion) => {
    setPlanActual(plan);
    setEditando(true);
    setDialogOpen(true);
  };

  const guardar = () => {
    const operacion = editando && planActual.id
      ? planificacionService.update(planActual.id, planActual)
      : planificacionService.create(planActual);
    operacion.then(() => {
      cargarPlanes();
      setDialogOpen(false);
    }).catch((err) => {
      setSnackbar({
        open: true,
        mensaje: err.response?.data?.error || 'No se pudo guardar la planificación.',
        tipo: 'error',
      });
    });
  };

  const copiar = (id?: number) => {
    if (!id) return;
    planificacionService.copiar(id).then(() => {
      cargarPlanes();
      alert('✅ Planificación duplicada exitosamente');
    }).catch(() => alert('❌ No se pudo duplicar la planificación.'));
  };

  const confirmarEliminar = () => {
    if (!planAEliminar?.id) return;
    planificacionService.delete(planAEliminar.id).then(cargarPlanes).catch((err) => {
      setSnackbar({
        open: true,
        mensaje: err.response?.data?.error || 'No se pudo eliminar la planificación.',
        tipo: 'error',
      });
    });
  };

  const planesFiltrados = planes.filter(p => {
    const cumpleTexto = `${p.nombre} ${p.alumno?.nombre || ''} ${p.alumno?.apellido || ''}`
      .toLowerCase().includes(filtro.toLowerCase());
    const cumpleEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
    return cumpleTexto && cumpleEstado;
  });

  return (
    <Box>
      {/* 1. Header de Página */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          gap: 2,
          mb: 4
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2rem' },
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2
              }}
            >
              Planificaciones
            </Typography>
            <Chip
              label={`${planes.length} rutinas`}
              size="small"
              sx={{
                bgcolor: '#f1f5f9',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.75rem',
                height: 24,
                verticalAlign: 'middle'
              }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Armá bloques de entrenamiento semanales, series, RIR y envialas por email en PDF.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={abrirNuevo}
          sx={{
            fontWeight: 700,
            px: 3,
            py: 1.2,
            alignSelf: { xs: 'flex-start', sm: 'center' },
            flexShrink: 0
          }}
        >
          Nueva planificación
        </Button>
      </Box>

      {/* 2. Filter and Search Bar */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3.5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre o alumno..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                endAdornment: filtro ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFiltro('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined
              }
            }}
            sx={{ maxWidth: { md: 450 } }}
          />

          <Stack direction="row" spacing={1} sx={{ overflow: 'auto', maxWidth: '100%' }}>
            {['TODOS', 'BORRADOR', 'ENVIADA', 'ARCHIVADA'].map((st) => (
              <Chip
                key={st}
                label={st === 'TODOS' ? 'Todas' : st === 'BORRADOR' ? 'Borrador' : st === 'ENVIADA' ? 'Enviadas' : 'Archivadas'}
                clickable
                onClick={() => setFiltroEstado(st)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  height: 32,
                  bgcolor: filtroEstado === st ? '#0f172a' : '#f1f5f9',
                  color: filtroEstado === st ? '#ffffff' : '#64748b',
                  '&:hover': {
                    bgcolor: filtroEstado === st ? '#1e293b' : '#e2e8f0'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* 3. Table Container */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3.5, overflow: 'hidden', mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Plan / Rutina</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Alumno</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Vigencia</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Estado</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Mail</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2, textAlign: 'right' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {planesFiltrados.map((plan) => {
              const st = estadoStyles[plan.estado] || estadoStyles.BORRADOR;

              return (
                <TableRow
                  key={plan.id}
                  hover
                  sx={{
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  <TableCell sx={{ px: 3, py: 2 }}>
                    <Box
                      onClick={() => navigate(`/planificaciones/${plan.id}`)}
                      sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#0f172a',
                        fontWeight: 700,
                        '&:hover': { color: '#16a34a' }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {plan.nombre}
                      </Typography>
                      <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: '#334155', fontWeight: 600, px: 3, py: 2 }}>
                    {plan.alumno ? `${plan.alumno.nombre} ${plan.alumno.apellido}` : '—'}
                  </TableCell>

                  <TableCell sx={{ color: '#475569', fontWeight: 500, px: 3, py: 2 }}>
                    {plan.fechaInicio || '—'} {plan.fechaFin ? `al ${plan.fechaFin}` : ''}
                  </TableCell>

                  <TableCell sx={{ px: 3, py: 2 }}>
                    <Chip
                      label={st.label}
                      size="small"
                      sx={{
                        bgcolor: st.bg,
                        color: st.text,
                        border: `1px solid ${st.border}`,
                        fontWeight: 700
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ px: 3, py: 2 }}>
                    {plan.enviadoAt ? (
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
                        label="Enviado"
                        size="small"
                        sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.725rem' }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">No enviado</Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ textAlign: 'right', px: 3, py: 2 }}>
                    <Tooltip title="Editar Datos">
                      <IconButton
                        size="small"
                        onClick={() => abrirEditar(plan)}
                        sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' }, mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicar Rutina">
                      <IconButton
                        size="small"
                        onClick={() => copiar(plan.id)}
                        sx={{ color: '#16a34a', '&:hover': { bgcolor: '#dcfce7' }, mr: 0.5 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Rutina">
                      <IconButton
                        size="small"
                        onClick={() => setPlanAEliminar(plan)}
                        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {planesFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      No se encontraron planificaciones
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Armá una nueva rutina haciendo clic en el botón superior "Nueva planificación".
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {editando ? 'Editar Planificación' : 'Nueva Planificación'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Asigná el alumno y período de vigencia del entrenamiento.
          </Typography>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              size="small"
              label="Nombre del plan"
              placeholder="ej: Mesociclo Fuerza e Hipertrofia"
              value={planActual.nombre}
              onChange={(e) => setPlanActual({ ...planActual, nombre: e.target.value })}
            />

            <Autocomplete
              options={alumnos}
              getOptionLabel={(a) => `${a.nombre} ${a.apellido}`}
              value={planActual.alumno || null}
              onChange={(_, newValue) => setPlanActual({ ...planActual, alumno: newValue })}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Alumno asignado" placeholder="Buscar alumno..." />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Fecha inicio
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={planActual.fechaInicio || ''}
                  onChange={(e) => setPlanActual({ ...planActual, fechaInicio: e.target.value })}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Fecha fin
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={planActual.fechaFin || ''}
                  onChange={(e) => setPlanActual({ ...planActual, fechaFin: e.target.value })}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              select
              size="small"
              label="Estado"
              value={planActual.estado}
              onChange={(e) => setPlanActual({ ...planActual, estado: e.target.value as EstadoPlanificacion })}
            >
              <MenuItem value="BORRADOR">Borrador</MenuItem>
              <MenuItem value="ENVIADA">Enviada</MenuItem>
              <MenuItem value="ARCHIVADA">Archivada</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748b' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={guardar} sx={{ fontWeight: 700, px: 3 }}>
            {editando ? 'Guardar cambios' : 'Crear planificación'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!planAEliminar}
        titulo="Eliminar planificación"
        mensaje={
          <>
            ¿Seguro que querés eliminar <strong>"{planAEliminar?.nombre}"</strong>? Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Eliminar"
        colorConfirmar="error"
        onConfirm={confirmarEliminar}
        onClose={() => setPlanAEliminar(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.tipo}
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          {snackbar.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Planificaciones;
