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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import { planificacionService, alumnoService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';

const estadoColor = {
  BORRADOR: 'default',
  ENVIADA: 'success',
  ARCHIVADA: 'warning',
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
      alert('Planificación copiada exitosamente');
    });
  };

  const eliminar = (id) => {
    if (window.confirm('¿Seguro que querés eliminar esta planificación?')) {
      planificacionService.delete(id).then(cargarPlanes);
    }
  };

  const planesFiltrados = planes.filter(p =>
    `${p.nombre} ${p.alumno?.nombre} ${p.alumno?.apellido}`
      .toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Planificaciones</Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de planificaciones de entrenamiento
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
          Nueva planificación
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Buscar por nombre o alumno..."
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
              {['Nombre', 'Alumno', 'Inicio', 'Fin', 'Estado', 'Enviada', 'Acciones'].map(col => (
                <TableCell key={col} sx={{ color: 'white', fontWeight: 'bold' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {planesFiltrados.map((plan) => (
              <TableRow key={plan.id} hover>
                <TableCell
                  sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 'bold' }}
                  onClick={() => navigate(`/planificaciones/${plan.id}`)}>
                  {plan.nombre}
                </TableCell>
                <TableCell>{plan.alumno?.nombre} {plan.alumno?.apellido}</TableCell>
                <TableCell>{plan.fechaInicio}</TableCell>
                <TableCell>{plan.fechaFin}</TableCell>
                <TableCell>
                  <Chip
                    label={plan.estado}
                    color={estadoColor[plan.estado]}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {plan.enviadoAt ? '✅' : '—'}
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => abrirEditar(plan)} title="Editar">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="success" onClick={() => copiar(plan.id)} title="Copiar">
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => eliminar(plan.id)} title="Eliminar">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {planesFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No se encontraron planificaciones
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar planificación' : 'Nueva planificación'}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important', pb: 3 }}>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <TextField fullWidth label="Nombre del plan" value={planActual.nombre}
              onChange={(e) => setPlanActual({ ...planActual, nombre: e.target.value })} />

           <Autocomplete
              options={alumnos}
              getOptionLabel={(a) => `${a.nombre} ${a.apellido}`}
              value={planActual.alumno || null}
              onChange={(e, newValue) => setPlanActual({ ...planActual, alumno: newValue })}
              renderInput={(params) => (
            <TextField {...params} label="Alumno" placeholder="Buscar alumno..." />
            )}
/>

            <Box display="flex" gap={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Fecha inicio
                </Typography>
                <TextField fullWidth type="date" value={planActual.fechaInicio}
                  onChange={(e) => setPlanActual({ ...planActual, fechaInicio: e.target.value })} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Fecha fin
                </Typography>
                <TextField fullWidth type="date" value={planActual.fechaFin}
                  onChange={(e) => setPlanActual({ ...planActual, fechaFin: e.target.value })} />
              </Box>
            </Box>

            <TextField fullWidth select label="Estado" value={planActual.estado}
              onChange={(e) => setPlanActual({ ...planActual, estado: e.target.value })}>
              <MenuItem value="BORRADOR">Borrador</MenuItem>
              <MenuItem value="ENVIADA">Enviada</MenuItem>
              <MenuItem value="ARCHIVADA">Archivada</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>
            {editando ? 'Guardar cambios' : 'Crear planificación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Planificaciones;