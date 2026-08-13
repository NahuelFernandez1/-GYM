import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment, Card, CardContent,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { pagoService, alumnoService } from '../services/api';

const estadoColor = {
  PAGADO: 'success',
  PENDIENTE: 'warning',
  VENCIDO: 'error',
};

const hoy = new Date().toISOString().split('T')[0];
const en30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const pagoInicial = {
  alumno: null,
  monto: '',
  fechaPago: hoy,
  fechaVencimiento: en30dias,
  metodoPago: 'EFECTIVO',
  estado: 'PAGADO',
  notas: '',
};

const MESES = [
  { valor: '01', label: 'Enero' }, { valor: '02', label: 'Febrero' },
  { valor: '03', label: 'Marzo' }, { valor: '04', label: 'Abril' },
  { valor: '05', label: 'Mayo' }, { valor: '06', label: 'Junio' },
  { valor: '07', label: 'Julio' }, { valor: '08', label: 'Agosto' },
  { valor: '09', label: 'Septiembre' }, { valor: '10', label: 'Octubre' },
  { valor: '11', label: 'Noviembre' }, { valor: '12', label: 'Diciembre' },
];

const KpiCard = ({ titulo, valor, icono, color }) => (
  <Card elevation={2} sx={{ borderRadius: 3 }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary">{titulo}</Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>
            ${valor.toLocaleString('es-AR')}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: `${color}20`, borderRadius: '50%', p: 2, display: 'flex' }}>
          {React.cloneElement(icono, { sx: { fontSize: 36, color } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [resumen, setResumen] = useState({ recaudadoHoy: 0, recaudadoMes: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagoActual, setPagoActual] = useState(pagoInicial);
  const [editando, setEditando] = useState(false);

  // Filtros
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarPagos();
    cargarResumen();
    alumnoService.getAll().then(res => setAlumnos(res.data));
  }, []);

  const cargarPagos = () => {
    pagoService.getAll().then(res => setPagos(res.data));
  };

  const cargarResumen = () => {
    pagoService.getResumen().then(res => setResumen(res.data));
  };

  const abrirNuevo = () => {
    setPagoActual(pagoInicial);
    setEditando(false);
    setDialogOpen(true);
  };

  const abrirEditar = (pago) => {
    setPagoActual(pago);
    setEditando(true);
    setDialogOpen(true);
  };

  const guardar = () => {
    const operacion = editando
      ? pagoService.update(pagoActual.id, pagoActual)
      : pagoService.create(pagoActual);
    operacion.then(() => {
      cargarPagos();
      cargarResumen();
      setDialogOpen(false);
    });
  };

  const eliminar = (id) => {
    if (window.confirm('¿Seguro que querés eliminar este pago?')) {
      pagoService.delete(id).then(() => {
        cargarPagos();
        cargarResumen();
      });
    }
  };

  const pagosFiltrados = pagos.filter(p => {
    const nombreCompleto = `${p.alumno?.nombre} ${p.alumno?.apellido}`.toLowerCase();
    const cumpleAlumno = filtroAlumno === '' || nombreCompleto.includes(filtroAlumno.toLowerCase());
    const cumpleMes = filtroMes === '' || (p.fechaPago && p.fechaPago.split('-')[1] === filtroMes);
    const cumpleEstado = filtroEstado === '' || p.estado === filtroEstado;
    return cumpleAlumno && cumpleMes && cumpleEstado;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Pagos</Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de pagos del gimnasio
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
          Nuevo pago
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6}>
          <KpiCard
            titulo="Recaudado hoy"
            valor={resumen.recaudadoHoy || 0}
            icono={<AttachMoneyIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <KpiCard
            titulo="Recaudado este mes"
            valor={resumen.recaudadoMes || 0}
            icono={<CalendarMonthIcon />}
            color="#1976d2"
          />
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Typography variant="body2" fontWeight="bold" mb={2} color="text.secondary">
          FILTROS
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Buscar alumno"
            size="small"
            value={filtroAlumno}
            onChange={(e) => setFiltroAlumno(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            }}
          />
          <TextField
            select label="Mes" size="small"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            sx={{ minWidth: 150 }}>
            <MenuItem value="">Todos</MenuItem>
            {MESES.map(m => (
              <MenuItem key={m.valor} value={m.valor}>{m.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select label="Estado" size="small"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            sx={{ minWidth: 150 }}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="PAGADO">Pagado</MenuItem>
            <MenuItem value="PENDIENTE">Pendiente</MenuItem>
            <MenuItem value="VENCIDO">Vencido</MenuItem>
          </TextField>
          <Button variant="outlined" size="small"
            onClick={() => { setFiltroAlumno(''); setFiltroMes(''); setFiltroEstado(''); }}>
            Limpiar filtros
          </Button>
        </Box>
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              {['Alumno', 'Monto', 'Fecha pago', 'Vencimiento', 'Método', 'Estado', 'Acciones'].map(col => (
                <TableCell key={col} sx={{ color: 'white', fontWeight: 'bold' }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosFiltrados.map((pago) => (
              <TableRow key={pago.id} hover>
                <TableCell>{pago.alumno?.nombre} {pago.alumno?.apellido}</TableCell>
                <TableCell>${pago.monto?.toLocaleString('es-AR')}</TableCell>
                <TableCell>{pago.fechaPago}</TableCell>
                <TableCell>{pago.fechaVencimiento}</TableCell>
                <TableCell>{pago.metodoPago}</TableCell>
                <TableCell>
                  <Chip label={pago.estado} color={estadoColor[pago.estado]} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => abrirEditar(pago)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => eliminar(pago.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {pagosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No se encontraron pagos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar pago' : 'Nuevo pago'}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important', pb: 3 }}>
          <Box display="flex" flexDirection="column" gap={4} mt={2}>
            <TextField fullWidth select label="Alumno"
              value={pagoActual.alumno?.id || ''}
              onChange={(e) => {
                const alumno = alumnos.find(a => a.id === e.target.value);
                setPagoActual({ ...pagoActual, alumno });
              }}>
              {alumnos.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.nombre} {a.apellido}</MenuItem>
              ))}
            </TextField>

            <TextField fullWidth label="Monto" type="number"
              value={pagoActual.monto}
              InputLabelProps={{ shrink: !!pagoActual.monto }}
              onChange={(e) => setPagoActual({ ...pagoActual, monto: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />

            <Box display="flex" gap={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Fecha de pago
                </Typography>
                <TextField fullWidth type="date" value={pagoActual.fechaPago}
                  onChange={(e) => setPagoActual({ ...pagoActual, fechaPago: e.target.value })} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Fecha de vencimiento
                </Typography>
                <TextField fullWidth type="date" value={pagoActual.fechaVencimiento}
                  onChange={(e) => setPagoActual({ ...pagoActual, fechaVencimiento: e.target.value })} />
              </Box>
            </Box>

            <Box display="flex" gap={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Método de pago
                </Typography>
                <TextField fullWidth select value={pagoActual.metodoPago}
                  onChange={(e) => setPagoActual({ ...pagoActual, metodoPago: e.target.value })}>
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Estado
                </Typography>
                <TextField fullWidth select value={pagoActual.estado}
                  onChange={(e) => setPagoActual({ ...pagoActual, estado: e.target.value })}>
                  <MenuItem value="PAGADO">Pagado</MenuItem>
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="VENCIDO">Vencido</MenuItem>
                </TextField>
              </Box>
            </Box>

            <TextField fullWidth label="Notas" multiline rows={2}
              value={pagoActual.notas}
              InputLabelProps={{ shrink: !!pagoActual.notas }}
              onChange={(e) => setPagoActual({ ...pagoActual, notas: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>
            {editando ? 'Guardar cambios' : 'Registrar pago'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pagos;