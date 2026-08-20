import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment, Card, CardContent,
  Grid, Tooltip, Stack, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { pagoService, alumnoService } from '../services/api';

const estadoStyles = {
  PAGADO: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Pagado' },
  PENDIENTE: { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Pendiente' },
  VENCIDO: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', label: 'Vencido' },
};

const metodoStyles = {
  EFECTIVO: { label: 'Efectivo', icon: <AttachMoneyIcon sx={{ fontSize: 15 }} />, color: '#16a34a', bg: '#f0fdf4' },
  TRANSFERENCIA: { label: 'Transferencia', icon: <CreditCardIcon sx={{ fontSize: 15 }} />, color: '#2563eb', bg: '#eff6ff' },
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

const KpiRevenueCard = ({ titulo, valor, icono, color, gradient }) => (
  <Card
    sx={{
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
      borderRadius: 4,
      background: '#ffffff',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: -24,
        right: -24,
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: gradient || `${color}15`,
        filter: 'blur(14px)',
      }}
    />
    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {titulo}
        </Typography>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}15`,
            color: color,
          }}
        >
          {React.cloneElement(icono, { sx: { fontSize: 24, color } })}
        </Box>
      </Box>
      <Typography
        variant="h3"
        sx={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.03em'
        }}
      >
        ${Number(valor || 0).toLocaleString('es-AR')}
      </Typography>
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
    const nombreCompleto = `${p.alumno?.nombre || ''} ${p.alumno?.apellido || ''}`.toLowerCase();
    const cumpleAlumno = filtroAlumno === '' || nombreCompleto.includes(filtroAlumno.toLowerCase());
    const cumpleMes = filtroMes === '' || (p.fechaPago && p.fechaPago.split('-')[1] === filtroMes);
    const cumpleEstado = filtroEstado === '' || p.estado === filtroEstado;
    return cumpleAlumno && cumpleMes && cumpleEstado;
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3.5}>
        <Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>
              Pagos & Cuotas
            </Typography>
            <Chip
              label={`${pagos.length} registros`}
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Control de ingresos, cobros en efectivo y transferencias.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={abrirNuevo}
          sx={{ fontWeight: 700, px: 2.5, py: 1.2 }}
        >
          Nuevo pago
        </Button>
      </Box>

      {/* Revenue KPIs */}
      <Grid container spacing={3} mb={3.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <KpiRevenueCard
            titulo="Recaudado Hoy"
            valor={resumen.recaudadoHoy || 0}
            icono={<AccountBalanceWalletIcon />}
            color="#16a34a"
            gradient="linear-gradient(135deg, rgba(22, 163, 74, 0.3) 0%, rgba(22, 163, 74, 0) 100%)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <KpiRevenueCard
            titulo="Recaudado Este Mes"
            valor={resumen.recaudadoMes || 0}
            icono={<CalendarMonthIcon />}
            color="#2563eb"
            gradient="linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0) 100%)"
          />
        </Grid>
      </Grid>

      {/* Filters Bar */}
      <Paper elevation={1} sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Buscar por alumno..."
            size="small"
            value={filtroAlumno}
            onChange={(e) => setFiltroAlumno(e.target.value)}
            sx={{ minWidth: 240, flexGrow: 1 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} fontSize="small" /></InputAdornment>
            }}
          />
          <TextField
            select
            label="Mes"
            size="small"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Todos los meses</MenuItem>
            {MESES.map(m => (
              <MenuItem key={m.valor} value={m.valor}>{m.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Estado"
            size="small"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="PAGADO">Pagado</MenuItem>
            <MenuItem value="PENDIENTE">Pendiente</MenuItem>
            <MenuItem value="VENCIDO">Vencido</MenuItem>
          </TextField>
          {(filtroAlumno || filtroMes || filtroEstado) && (
            <Button
              variant="outlined"
              size="medium"
              onClick={() => { setFiltroAlumno(''); setFiltroMes(''); setFiltroEstado(''); }}
              sx={{ color: '#64748b', borderColor: '#cbd5e1' }}
            >
              Limpiar
            </Button>
          )}
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Alumno</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Monto</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Fecha Pago</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Vencimiento</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Método</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, textAlign: 'right' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosFiltrados.map((pago) => {
              const st = estadoStyles[pago.estado] || estadoStyles.PAGADO;
              const met = metodoStyles[pago.metodoPago] || { label: pago.metodoPago || 'Efectivo', color: '#475569', bg: '#f1f5f9', icon: <AttachMoneyIcon sx={{ fontSize: 14 }} /> };

              return (
                <TableRow
                  key={pago.id}
                  hover
                  sx={{
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {pago.alumno?.nombre} {pago.alumno?.apellido}
                  </TableCell>

                  <TableCell sx={{ fontWeight: 800, color: '#16a34a', fontSize: '0.95rem' }}>
                    ${Number(pago.monto || 0).toLocaleString('es-AR')}
                  </TableCell>

                  <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                    {pago.fechaPago || '—'}
                  </TableCell>

                  <TableCell sx={{ color: '#475569', fontWeight: 500 }}>
                    {pago.fechaVencimiento || '—'}
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={met.icon}
                      label={met.label}
                      size="small"
                      sx={{
                        bgcolor: met.bg,
                        color: met.color,
                        fontWeight: 700,
                        '& .MuiChip-icon': { color: met.color }
                      }}
                    />
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

                  <TableCell sx={{ textAlign: 'right' }}>
                    <Tooltip title="Editar Pago">
                      <IconButton
                        size="small"
                        onClick={() => abrirEditar(pago)}
                        sx={{ color: '#0284c7', '&:hover': { bgcolor: '#e0f2fe' }, mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar Pago">
                      <IconButton
                        size="small"
                        onClick={() => eliminar(pago.id)}
                        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {pagosFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <ReceiptLongIcon sx={{ fontSize: 44, color: '#cbd5e1' }} />
                    <Typography variant="body1" fontWeight={700} color="text.secondary">
                      No se encontraron pagos registrados
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Registrá un nuevo pago haciendo clic en el botón superior.
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
            {editando ? 'Editar Pago' : 'Registrar Nuevo Pago'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresá los datos de la cuota y el medio de pago.
          </Typography>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              select
              label="Alumno"
              size="small"
              value={pagoActual.alumno?.id || ''}
              onChange={(e) => {
                const alumno = alumnos.find(a => a.id === e.target.value);
                setPagoActual({ ...pagoActual, alumno });
              }}
            >
              {alumnos.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.nombre} {a.apellido} (DNI: {a.dni || '—'})</MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Monto abonado"
              type="number"
              size="small"
              value={pagoActual.monto}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setPagoActual({ ...pagoActual, monto: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Fecha de pago
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={pagoActual.fechaPago}
                  onChange={(e) => setPagoActual({ ...pagoActual, fechaPago: e.target.value })}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Fecha de vencimiento
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={pagoActual.fechaVencimiento}
                  onChange={(e) => setPagoActual({ ...pagoActual, fechaVencimiento: e.target.value })}
                />
              </Box>
            </Box>

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Método de pago
                </Typography>
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={pagoActual.metodoPago}
                  onChange={(e) => setPagoActual({ ...pagoActual, metodoPago: e.target.value })}
                >
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Estado
                </Typography>
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={pagoActual.estado}
                  onChange={(e) => setPagoActual({ ...pagoActual, estado: e.target.value })}
                >
                  <MenuItem value="PAGADO">Pagado</MenuItem>
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="VENCIDO">Vencido</MenuItem>
                </TextField>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Notas u observaciones"
              multiline
              rows={2}
              size="small"
              placeholder="Número de comprobante, plan elegido, etc."
              value={pagoActual.notas}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setPagoActual({ ...pagoActual, notas: e.target.value })}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748b' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={guardar} sx={{ fontWeight: 700, px: 3 }}>
            {editando ? 'Guardar cambios' : 'Registrar pago'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pagos;