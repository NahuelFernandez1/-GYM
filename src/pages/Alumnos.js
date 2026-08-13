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
import { alumnoService } from '../services/api';

const estadoColor = {
  ACTIVO: 'success',
  INACTIVO: 'default',
  SUSPENDIDO: 'error',
};

const alumnoInicial = {
  nombre: '',
  apellido: '',
  dni: '',
  telefono: '',
  email: '',
  fechaNacimiento: '',
  estado: 'ACTIVO',
  fechaVencimientoCuota: '',
  objetivos: '',
  notas: '',
};

const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alumnoActual, setAlumnoActual] = useState(alumnoInicial);
  const [editando, setEditando] = useState(false);

  useEffect(() => { cargarAlumnos(); }, []);

  const cargarAlumnos = () => {
    alumnoService.getAll().then(res => setAlumnos(res.data));
  };

  const abrirNuevo = () => {
    setAlumnoActual(alumnoInicial);
    setEditando(false);
    setDialogOpen(true);
  };

  const abrirEditar = (alumno) => {
    setAlumnoActual(alumno);
    setEditando(true);
    setDialogOpen(true);
  };

  const guardar = () => {
    // Separar nombre y apellido si vienen juntos
    const partes = alumnoActual.nombreCompleto?.trim().split(' ') || [];
    const alumnoAGuardar = alumnoActual.nombreCompleto
      ? {
          ...alumnoActual,
          nombre: partes[0] || '',
          apellido: partes.slice(1).join(' ') || '',
        }
      : alumnoActual;

    const operacion = editando
      ? alumnoService.update(alumnoAGuardar.id, alumnoAGuardar)
      : alumnoService.create(alumnoAGuardar);
    operacion.then(() => {
      cargarAlumnos();
      setDialogOpen(false);
    });
  };

  const eliminar = (id) => {
    if (window.confirm('¿Seguro que querés eliminar este alumno?')) {
      alumnoService.delete(id).then(cargarAlumnos);
    }
  };

  const alumnosFiltrados = alumnos.filter(a =>
    `${a.nombre} ${a.apellido} ${a.dni}`.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Alumnos</Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de alumnos del gimnasio
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
          Nuevo alumno
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Buscar por nombre, apellido o DNI..."
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
              {['Nombre', 'DNI', 'Teléfono', 'Email', 'Estado', 'Vencimiento', 'Acciones'].map(col => (
                <TableCell key={col} sx={{ color: 'white', fontWeight: 'bold' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {alumnosFiltrados.map((alumno) => (
              <TableRow key={alumno.id} hover>
                <TableCell>{alumno.nombre} {alumno.apellido}</TableCell>
                <TableCell>{alumno.dni}</TableCell>
                <TableCell>{alumno.telefono}</TableCell>
                <TableCell>{alumno.email}</TableCell>
                <TableCell>
                  <Chip
                    label={alumno.estado}
                    color={estadoColor[alumno.estado]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{alumno.fechaVencimientoCuota}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => abrirEditar(alumno)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => eliminar(alumno.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {alumnosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No se encontraron alumnos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar alumno' : 'Nuevo alumno'}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important', pb: 3 }}>
  <Box display="flex" flexDirection="column" gap={2} mt={1}>

    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Nombre y apellido
      </Typography>
      <TextField fullWidth size="small"
        value={alumnoActual.nombreCompleto ?? `${alumnoActual.nombre ?? ''} ${alumnoActual.apellido ?? ''}`.trim()}
        onChange={(e) => setAlumnoActual({ ...alumnoActual, nombreCompleto: e.target.value })} />
    </Box>

    <Box display="flex" gap={2}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          DNI
        </Typography>
        <TextField fullWidth size="small" value={alumnoActual.dni || ''}
          onChange={(e) => setAlumnoActual({ ...alumnoActual, dni: e.target.value })} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Teléfono
        </Typography>
        <TextField fullWidth size="small" value={alumnoActual.telefono || ''}
          onChange={(e) => setAlumnoActual({ ...alumnoActual, telefono: e.target.value })} />
      </Box>
    </Box>

    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Email
      </Typography>
      <TextField fullWidth size="small" value={alumnoActual.email || ''}
        onChange={(e) => setAlumnoActual({ ...alumnoActual, email: e.target.value })} />
    </Box>

    <Box display="flex" gap={2}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Fecha de nacimiento
        </Typography>
        <TextField fullWidth size="small" type="date" value={alumnoActual.fechaNacimiento || ''}
          onChange={(e) => setAlumnoActual({ ...alumnoActual, fechaNacimiento: e.target.value })} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Vencimiento cuota
        </Typography>
        <TextField fullWidth type="date" size="small" value={alumnoActual.fechaVencimientoCuota || ''}
          onChange={(e) => setAlumnoActual({ ...alumnoActual, fechaVencimientoCuota: e.target.value })} />
      </Box>
    </Box>

    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Estado
      </Typography>
      <TextField fullWidth select size="small" value={alumnoActual.estado || 'ACTIVO'}
        onChange={(e) => setAlumnoActual({ ...alumnoActual, estado: e.target.value })}>
        <MenuItem value="ACTIVO">Activo</MenuItem>
        <MenuItem value="INACTIVO">Inactivo</MenuItem>
        <MenuItem value="SUSPENDIDO">Suspendido</MenuItem>
      </TextField>
    </Box>

    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Objetivos
      </Typography>
      <TextField fullWidth size="small" multiline rows={2} value={alumnoActual.objetivos || ''}
        onChange={(e) => setAlumnoActual({ ...alumnoActual, objetivos: e.target.value })} />
    </Box>

    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Notas
      </Typography>
      <TextField fullWidth size="small" multiline rows={2} value={alumnoActual.notas || ''}
        onChange={(e) => setAlumnoActual({ ...alumnoActual, notas: e.target.value })} />
    </Box>

  </Box>
</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>
            {editando ? 'Guardar cambios' : 'Crear alumno'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Alumnos;