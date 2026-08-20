import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment, Avatar, Tooltip,
  Stack, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';
import { alumnoService } from '../services/api';

const estadoStyles = {
  ACTIVO: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Activo' },
  INACTIVO: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0', label: 'Inactivo' },
  SUSPENDIDO: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', label: 'Suspendido' },
};

const avatarColors = ['#16a34a', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2'];

const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
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
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
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

  const alumnosFiltrados = alumnos.filter(a => {
    const cumpleTexto = `${a.nombre} ${a.apellido} ${a.dni} ${a.email}`.toLowerCase().includes(filtro.toLowerCase());
    const cumpleEstado = filtroEstado === 'TODOS' || a.estado === filtroEstado;
    return cumpleTexto && cumpleEstado;
  });

  return (
    <Box>
      {/* Page Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>
              Alumnos
            </Typography>
            <Chip
              label={`${alumnos.length} total`}
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Administrá los atletas, fichas médicas y cuotas del gimnasio.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={abrirNuevo}
          sx={{ fontWeight: 700, px: 2.5, py: 1.2 }}
        >
          Nuevo alumno
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems="center" justifyContent="space-between">
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre, apellido, DNI o email..."
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
            {['TODOS', 'ACTIVO', 'INACTIVO', 'SUSPENDIDO'].map((st) => (
              <Chip
                key={st}
                label={st === 'TODOS' ? 'Todos' : st === 'ACTIVO' ? 'Activos' : st === 'INACTIVO' ? 'Inactivos' : 'Suspendidos'}
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

      {/* Table Container */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Alumno</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>DNI</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Contacto</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Vencimiento</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, textAlign: 'right' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alumnosFiltrados.map((alumno) => {
              const fullName = `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim() || 'Sin nombre';
              const st = estadoStyles[alumno.estado] || estadoStyles.ACTIVO;
              const initials = `${alumno.nombre?.[0] || ''}${alumno.apellido?.[0] || ''}`.toUpperCase() || 'A';

              return (
                <TableRow
                  key={alumno.id}
                  hover
                  sx={{
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: getAvatarColor(fullName), width: 38, height: 38, fontSize: '0.875rem', fontWeight: 700 }}>
                        {initials}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="#0f172a">
                          {fullName}
                        </Typography>
                        {alumno.fechaNacimiento && (
                          <Typography variant="caption" color="text.secondary">
                            Nac: {alumno.fechaNacimiento}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                    {alumno.dni || '—'}
                  </TableCell>

                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={0.3}>
                      {alumno.telefono && (
                        <Box display="flex" alignItems="center" gap={0.8} color="#475569">
                          <PhoneIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                          <Typography variant="caption" fontWeight={500}>{alumno.telefono}</Typography>
                        </Box>
                      )}
                      {alumno.email && (
                        <Box display="flex" alignItems="center" gap={0.8} color="#475569">
                          <EmailIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                          <Typography variant="caption">{alumno.email}</Typography>
                        </Box>
                      )}
                      {!alumno.telefono && !alumno.email && (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </Box>
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
                    {alumno.fechaVencimientoCuota ? (
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <EventIcon sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="body2" fontWeight={600} color="#334155">
                          {alumno.fechaVencimientoCuota}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ textAlign: 'right' }}>
                    <Tooltip title="Editar Alumno">
                      <IconButton
                        size="small"
                        onClick={() => abrirEditar(alumno)}
                        sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' }, mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Alumno">
                      <IconButton
                        size="small"
                        onClick={() => eliminar(alumno.id)}
                        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {alumnosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <PersonIcon sx={{ fontSize: 44, color: '#cbd5e1' }} />
                    <Typography variant="body1" fontWeight={700} color="text.secondary">
                      No se encontraron alumnos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Probá cambiando los términos de búsqueda o creá uno nuevo.
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
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={800} color="#0f172a">
            {editando ? 'Editar Alumno' : 'Nuevo Alumno'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completá los datos personales y de contacto del deportista.
          </Typography>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Nombre y Apellido
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="ej: Juan Pérez"
                value={alumnoActual.nombreCompleto ?? `${alumnoActual.nombre ?? ''} ${alumnoActual.apellido ?? ''}`.trim()}
                onChange={(e) => setAlumnoActual({ ...alumnoActual, nombreCompleto: e.target.value })}
              />
            </Box>

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  DNI
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="ej: 38450123"
                  value={alumnoActual.dni || ''}
                  onChange={(e) => setAlumnoActual({ ...alumnoActual, dni: e.target.value })}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Teléfono / WhatsApp
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="ej: 11 2345-6789"
                  value={alumnoActual.telefono || ''}
                  onChange={(e) => setAlumnoActual({ ...alumnoActual, telefono: e.target.value })}
                />
              </Box>
            </Box>

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="alumno@gmail.com"
                  value={alumnoActual.email || ''}
                  onChange={(e) => setAlumnoActual({ ...alumnoActual, email: e.target.value })}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Estado
                </Typography>
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={alumnoActual.estado || 'ACTIVO'}
                  onChange={(e) => setAlumnoActual({ ...alumnoActual, estado: e.target.value })}
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="INACTIVO">Inactivo</MenuItem>
                  <MenuItem value="SUSPENDIDO">Suspendido</MenuItem>
                </TextField>
              </Box>
            </Box>

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Fecha de nacimiento
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={alumnoActual.fechaNacimiento || ''}
                  onChange={(e) => setAlumnoActual({ ...alumnoActual, fechaNacimiento: e.target.value })}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Vencimiento cuota
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={alumnoActual.fechaVencimientoCuota || ''}
                  onChange={(e) => setAlumnoActual({ ...alumnoActual, fechaVencimientoCuota: e.target.value })}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Objetivos del entrenamiento
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="ej: Hipertrofia, aumento de fuerza, rehabilitación de hombro..."
                value={alumnoActual.objetivos || ''}
                onChange={(e) => setAlumnoActual({ ...alumnoActual, objetivos: e.target.value })}
              />
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Notas y observaciones
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Observaciones médicas o de horario..."
                value={alumnoActual.notas || ''}
                onChange={(e) => setAlumnoActual({ ...alumnoActual, notas: e.target.value })}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748b' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={guardar} sx={{ fontWeight: 700, px: 3 }}>
            {editando ? 'Guardar cambios' : 'Crear alumno'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Alumnos;