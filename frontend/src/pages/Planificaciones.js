import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment, Tooltip, Stack,
  Divider
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

const estadoStyles = {
  BORRADOR: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0', label: 'Borrador' },
  ENVIADA: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Enviada' },
  ARCHIVADA: { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Archivada' },
};

const planInicial = {
  alumno: null,
  nombre: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'BORRADOR',
};

const Planificaciones = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planActual, setPlanActual] = useState(planInicial);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    cargarPlanes();
    alumnoService.getAll().then(res => setAlumnos(res.data));
  }, []);

  const cargarPlanes = () => {
    planificacionService.getAll().then(res => setPlanes(res.data));
  };

  const abrirNuevo = () => {
    setPlanActual(planInicial);
    setEditando(false);
    setDialogOpen(true);
  };

  const abrirEditar = (plan) => {
    setPlanActual(plan);
    setEditando(true);
    setDialogOpen(true);
  };

  const guardar = () => {
    const operacion = editando
      ? planificacionService.update(planActual.id, planActual)
      : planificacionService.create(planActual);
    operacion.then(() => {
      cargarPlanes();
      setDialogOpen(false);
    });
  };

  const copiar = (id) => {
    planificacionService.copiar(id).then(() => {
      cargarPlanes();
      alert('✅ Planificación duplicada exitosamente');
    });
  };

  const eliminar = (id) => {
    if (window.confirm('¿Seguro que querés eliminar esta planificación?')) {
      planificacionService.delete(id).then(cargarPlanes);
    }
  };

  const planesFiltrados = planes.filter(p => {
    const cumpleTexto = `${p.nombre} ${p.alumno?.nombre || ''} ${p.alumno?.apellido || ''}`
      .toLowerCase().includes(filtro.toLowerCase());
    const cumpleEstado = filtroEstado === 'TODOS' || p.estado === filtroEstado;
    return cumpleTexto && cumpleEstado;
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>
              Planificaciones
            </Typography>
            <Chip
              label={`${planes.length} rutinas`}
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Armá bloques de entrenamiento semanales, series, RIR y envialas por email en PDF.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={abrirNuevo}
          sx={{ fontWeight: 700, px: 2.5, py: 1.2 }}
        >
          Nueva planificación
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center" justifyContent="space-between">
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre o alumno..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            InputProps={{
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
              ) : null
            }}
            sx={{ maxWidth: { md: 450 } }}
          />

          <Stack direction="row" spacing={1} overflow="auto" maxWidth="100%">
            {['TODOS', 'BORRADOR', 'ENVIADA', 'ARCHIVADA'].map((st) => (
              <Chip
                key={st}
                label={st === 'TODOS' ? 'Todas' : st === 'BORRADOR' ? 'Borrador' : st === 'ENVIADA' ? 'Enviadas' : 'Archivadas'}
                clickable
                onClick={() => setFiltroEstado(st)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
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

      {/* Table */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Plan / Rutina</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Alumno</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Vigencia</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Mail</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, textAlign: 'right' }}>Acciones</TableCell>
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
                  <TableCell>
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
                      <Typography variant="body2" fontWeight={700}>
                        {plan.nombre}
                      </Typography>
                      <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: '#334155', fontWeight: 600 }}>
                    {plan.alumno ? `${plan.alumno.nombre} ${plan.alumno.apellido}` : '—'}
                  </TableCell>

                  <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                    {plan.fechaInicio || '—'} {plan.fechaFin ? `al ${plan.fechaFin}` : ''}
                  </TableCell>

                  <TableCell>
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

                  <TableCell>
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

                  <TableCell sx={{ textAlign: 'right' }}>
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
                        onClick={() => eliminar(plan.id)}
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
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <AssignmentIcon sx={{ fontSize: 44, color: '#cbd5e1' }} />
                    <Typography variant="body1" fontWeight={700} color="text.secondary">
                      No se encontraron planificaciones
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Armá una nueva rutina haciendo clic en el botón superior.
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
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={800} color="#0f172a">
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
              onChange={(e, newValue) => setPlanActual({ ...planActual, alumno: newValue })}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Alumno asignado" placeholder="Buscar alumno..." />
              )}
            />

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Fecha inicio
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={planActual.fechaInicio}
                  onChange={(e) => setPlanActual({ ...planActual, fechaInicio: e.target.value })}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Fecha fin
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={planActual.fechaFin}
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
              onChange={(e) => setPlanActual({ ...planActual, estado: e.target.value })}
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
    </Box>
  );
};

export default Planificaciones;