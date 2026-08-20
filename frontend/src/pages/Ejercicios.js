import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment, Tooltip, Stack,
  Divider, TableSortLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ClearIcon from '@mui/icons-material/Clear';
import { ejercicioService } from '../services/api';

const patronStyles = {
  EMPUJE: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', label: 'Empuje' },
  TRACCION: { bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff', label: 'Tracción' },
  MOVILIDAD: { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', label: 'Movilidad' },
  CADERA: { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa', label: 'Cadera' },
  RODILLA: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Rodilla' },
  CORE: { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Core' },
};

const ejercicioInicial = {
  nombre: '',
  patronMovimiento: 'MOVILIDAD',
  descripcion: '',
  videoUrl: '',
};

const Ejercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [patronFiltro, setPatronFiltro] = useState('TODOS');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ejercicioActual, setEjercicioActual] = useState(ejercicioInicial);
  const [editando, setEditando] = useState(false);
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [ordenCampo, setOrdenCampo] = useState('nombre');

  useEffect(() => { cargarEjercicios(); }, []);

  const cargarEjercicios = () => {
    ejercicioService.getAll().then(res => setEjercicios(res.data));
  };

  const abrirNuevo = () => {
    setEjercicioActual(ejercicioInicial);
    setEditando(false);
    setDialogOpen(true);
  };

  const abrirEditar = (ejercicio) => {
    setEjercicioActual(ejercicio);
    setEditando(true);
    setDialogOpen(true);
  };

  const guardar = () => {
    const operacion = editando
      ? ejercicioService.update(ejercicioActual.id, ejercicioActual)
      : ejercicioService.create(ejercicioActual);
    operacion.then(() => {
      cargarEjercicios();
      setDialogOpen(false);
    });
  };

  const eliminar = (id) => {
    if (window.confirm('¿Seguro que querés eliminar este ejercicio?')) {
      ejercicioService.delete(id).then(cargarEjercicios);
    }
  };

  const handleSort = (campo) => {
    const isAsc = ordenCampo === campo && ordenAsc;
    setOrdenAsc(!isAsc);
    setOrdenCampo(campo);
  };

  const ejerciciosFiltrados = [...ejercicios]
    .filter(e => {
      const matchTexto = `${e.nombre} ${e.descripcion || ''}`.toLowerCase().includes(filtro.toLowerCase());
      const matchPatron = patronFiltro === 'TODOS' || e.patronMovimiento === patronFiltro;
      return matchTexto && matchPatron;
    })
    .sort((a, b) => {
      if (!ordenCampo) return 0;
      const valA = a[ordenCampo]?.toString().toLowerCase() || '';
      const valB = b[ordenCampo]?.toString().toLowerCase() || '';
      return ordenAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>
              Catálogo de Ejercicios
            </Typography>
            <Chip
              label={`${ejercicios.length} ejercicios`}
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Banco de movimientos con enlaces a videos demostrativos y clasificación por patrón.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={abrirNuevo}
          sx={{ fontWeight: 700, px: 2.5, py: 1.2 }}
        >
          Nuevo ejercicio
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={2} alignItems="center" justifyContent="space-between">
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre o descripción..."
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
            sx={{ maxWidth: { lg: 400 } }}
          />

          <Stack direction="row" spacing={1} overflow="auto" maxWidth="100%" pb={{ xs: 1, lg: 0 }}>
            {['TODOS', 'MOVILIDAD', 'CORE', 'EMPUJE', 'TRACCION', 'RODILLA', 'CADERA'].map((p) => {
              const active = patronFiltro === p;
              return (
                <Chip
                  key={p}
                  label={p === 'TODOS' ? 'Todos' : p}
                  clickable
                  onClick={() => setPatronFiltro(p)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    bgcolor: active ? '#0f172a' : '#f1f5f9',
                    color: active ? '#ffffff' : '#64748b',
                    '&:hover': {
                      bgcolor: active ? '#1e293b' : '#e2e8f0'
                    }
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>
                <TableSortLabel
                  active={ordenCampo === 'nombre'}
                  direction={ordenCampo === 'nombre' && ordenAsc ? 'asc' : 'desc'}
                  onClick={() => handleSort('nombre')}
                >
                  Nombre del Ejercicio
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>
                <TableSortLabel
                  active={ordenCampo === 'patronMovimiento'}
                  direction={ordenCampo === 'patronMovimiento' && ordenAsc ? 'asc' : 'desc'}
                  onClick={() => handleSort('patronMovimiento')}
                >
                  Patrón
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Descripción / Notas</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Demostración</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, textAlign: 'right' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ejerciciosFiltrados.map((ejercicio) => {
              const st = patronStyles[ejercicio.patronMovimiento] || { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0', label: ejercicio.patronMovimiento };

              return (
                <TableRow
                  key={ejercicio.id}
                  hover
                  sx={{
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                    {ejercicio.nombre}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={st.label}
                      size="small"
                      sx={{
                        bgcolor: st.bg,
                        color: st.text,
                        border: `1px solid ${st.border}`,
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ color: '#64748b', maxWidth: 320 }}>
                    {ejercicio.descripcion || <Typography variant="caption" color="text.secondary">Sin descripción</Typography>}
                  </TableCell>

                  <TableCell>
                    {ejercicio.videoUrl ? (
                      <Button
                        size="small"
                        variant="outlined"
                        href={ejercicio.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        startIcon={<PlayCircleOutlineIcon sx={{ color: '#ef4444' }} />}
                        sx={{
                          borderRadius: 2,
                          py: 0.5,
                          px: 1.5,
                          fontSize: '0.75rem',
                          color: '#0f172a',
                          borderColor: '#e2e8f0',
                          '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' }
                        }}
                      >
                        Ver Video
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ textAlign: 'right' }}>
                    <Tooltip title="Editar Ejercicio">
                      <IconButton
                        size="small"
                        onClick={() => abrirEditar(ejercicio)}
                        sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' }, mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Ejercicio">
                      <IconButton
                        size="small"
                        onClick={() => eliminar(ejercicio.id)}
                        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {ejerciciosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <FitnessCenterIcon sx={{ fontSize: 44, color: '#cbd5e1' }} />
                    <Typography variant="body1" fontWeight={700} color="text.secondary">
                      No se encontraron ejercicios
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Probá cambiando el filtro o creá un nuevo movimiento.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={800} color="#0f172a">
            {editando ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresá los datos técnicos del ejercicio para las planificaciones.
          </Typography>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Nombre del ejercicio
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="ej: Press Banca con Mancuernas"
                value={ejercicioActual.nombre}
                onChange={(e) => setEjercicioActual({ ...ejercicioActual, nombre: e.target.value })}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Patrón de movimiento
              </Typography>
              <TextField
                fullWidth
                select
                size="small"
                value={ejercicioActual.patronMovimiento}
                onChange={(e) => setEjercicioActual({ ...ejercicioActual, patronMovimiento: e.target.value })}
              >
                {['MOVILIDAD', 'CORE', 'EMPUJE', 'TRACCION', 'RODILLA', 'CADERA'].map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Descripción y técnica
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Puntos clave de técnica, tempo, postura..."
                value={ejercicioActual.descripcion}
                onChange={(e) => setEjercicioActual({ ...ejercicioActual, descripcion: e.target.value })}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Link de Video Demostrativo (YouTube)
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="https://www.youtube.com/watch?v=..."
                value={ejercicioActual.videoUrl}
                onChange={(e) => setEjercicioActual({ ...ejercicioActual, videoUrl: e.target.value })}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748b' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={guardar} sx={{ fontWeight: 700, px: 3 }}>
            {editando ? 'Guardar cambios' : 'Crear ejercicio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ejercicios;