import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { ejercicioService } from '../services/api';

const patronColor = {
  EMPUJE: '#e53935',
  TRACCION: '#8e24aa',
  MOVILIDAD: '#1e88e5',
  CADERA: '#f4511e',
  RODILLA: '#43a047',
  CORE: '#f9a825',
};

const ejercicioInicial = {
  nombre: '', patronMovimiento: 'MOVILIDAD', descripcion: '', videoUrl: '',
};

const Ejercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ejercicioActual, setEjercicioActual] = useState(ejercicioInicial);
  const [editando, setEditando] = useState(false);
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [ordenCampo, setOrdenCampo] = useState(null);

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

  const ejerciciosFiltrados = [...ejercicios]
    .filter(e => `${e.nombre} ${e.patronMovimiento}`.toLowerCase().includes(filtro.toLowerCase()))
    .sort((a, b) => {
      if (!ordenCampo) return 0;
      const valA = a[ordenCampo]?.toLowerCase() || '';
      const valB = b[ordenCampo]?.toLowerCase() || '';
      return ordenAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Ejercicios</Typography>
          <Typography variant="body1" color="text.secondary">
            Catálogo de ejercicios del gimnasio
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
          Nuevo ejercicio
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Buscar por nombre o patrón de movimiento..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchIcon /></InputAdornment>
          ),
        }}
      />

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => {
                  setOrdenCampo('nombre');
                  setOrdenAsc(ordenCampo === 'nombre' ? !ordenAsc : true);
                }}>
                Nombre {ordenCampo === 'nombre' ? (ordenAsc ? '↑' : '↓') : '↕'}
              </TableCell>
              <TableCell
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => {
                  setOrdenCampo('patronMovimiento');
                  setOrdenAsc(ordenCampo === 'patronMovimiento' ? !ordenAsc : true);
                }}>
                Patrón de movimiento {ordenCampo === 'patronMovimiento' ? (ordenAsc ? '↑' : '↓') : '↕'}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Video</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ejerciciosFiltrados.map((ejercicio) => (
              <TableRow key={ejercicio.id} hover>
                <TableCell>{ejercicio.nombre}</TableCell>
                <TableCell>
                  <Chip
                    label={ejercicio.patronMovimiento}
                    size="small"
                    sx={{
                      bgcolor: (patronColor[ejercicio.patronMovimiento] || '#888') + '20',
                      color: patronColor[ejercicio.patronMovimiento] || '#888',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell>{ejercicio.descripcion}</TableCell>
                <TableCell>
                  {ejercicio.videoUrl && (
                    <a href={ejercicio.videoUrl} target="_blank" rel="noreferrer">
                      Ver video
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => abrirEditar(ejercicio)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => eliminar(ejercicio.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {ejerciciosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No se encontraron ejercicios
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar ejercicio' : 'Nuevo ejercicio'}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important', pb: 3 }}>
          <Box display="flex" flexDirection="column" gap={4} mt={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Nombre
              </Typography>
              <TextField fullWidth value={ejercicioActual.nombre}
                onChange={(e) => setEjercicioActual({ ...ejercicioActual, nombre: e.target.value })} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Patrón de movimiento
              </Typography>
              <TextField fullWidth select value={ejercicioActual.patronMovimiento}
                onChange={(e) => setEjercicioActual({ ...ejercicioActual, patronMovimiento: e.target.value })}>
                {['MOVILIDAD', 'CORE', 'EMPUJE', 'TRACCION', 'RODILLA', 'CADERA'].map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Descripción
              </Typography>
              <TextField fullWidth multiline rows={3} value={ejercicioActual.descripcion}
                onChange={(e) => setEjercicioActual({ ...ejercicioActual, descripcion: e.target.value })} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Link de video (YouTube)
              </Typography>
              <TextField fullWidth value={ejercicioActual.videoUrl}
                onChange={(e) => setEjercicioActual({ ...ejercicioActual, videoUrl: e.target.value })} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>
            {editando ? 'Guardar cambios' : 'Crear ejercicio'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Ejercicios;