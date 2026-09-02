import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, InputAdornment, Card, CardContent,
  Grid, Tooltip, Stack, Divider, Snackbar, Alert
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
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { pagoService, alumnoService } from '../services/api';
import { Pago, Alumno, EstadoPago, MetodoPago, ResumenPagos } from '../types';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const estadoStyles: Record<EstadoPago, { bg: string; text: string; border: string; label: string }> = {
  PAGADO: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Pagado' },
  PENDIENTE: { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Pendiente' },
  VENCIDO: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', label: 'Vencido' },
};

const metodoStyles: Record<MetodoPago, { label: string; icon: React.ReactElement; color: string; bg: string }> = {
  EFECTIVO: { label: 'Efectivo', icon: <AttachMoneyIcon sx={{ fontSize: 15 }} />, color: '#16a34a', bg: '#f0fdf4' },
  TRANSFERENCIA: { label: 'Transferencia', icon: <CreditCardIcon sx={{ fontSize: 15 }} />, color: '#2563eb', bg: '#eff6ff' },
};

const hoy = new Date().toISOString().split('T')[0];
const en30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const pagoInicial: Pago = {
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

interface KpiRevenueCardProps {
  titulo: string;
  valor: number | string;
  icono: React.ReactElement;
  color: string;
  gradient?: string;
}

const KpiRevenueCard: React.FC<KpiRevenueCardProps> = ({ titulo, valor, icono, color, gradient }) => (
  <Card
    sx={{
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 2px 12px -2px rgba(0,0,0,0.04)',
      borderRadius: 4,
      background: '#ffffff',
      height: '100%',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: -24,
        right: -24,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: gradient || `${color}15`,
        filter: 'blur(16px)',
        pointerEvents: 'none'
      }}
    />
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.01em' }}>
          {titulo}
        </Typography>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}15`,
            color: color,
          }}
        >
          {React.cloneElement(icono as React.ReactElement<any>, { sx: { fontSize: 22, color } })}
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 800,
            fontSize: { xs: '1.875rem', sm: '2.25rem' },
            color: '#0f172a',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}
        >
          {typeof valor === 'string' && isNaN(Number(valor))
            ? valor
            : `$${Number(valor || 0).toLocaleString('es-AR')}`}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Pagos: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [resumen, setResumen] = useState<ResumenPagos>({ recaudadoHoy: 0, recaudadoMes: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagoActual, setPagoActual] = useState<Pago>(pagoInicial);
  const [editando, setEditando] = useState(false);

  // Filtros
  const [filtroAlumno, setFiltroAlumno] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');

  const [generando, setGenerando] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; mensaje: string; tipo: 'success' | 'error' }>({
    open: false,
    mensaje: '',
    tipo: 'success',
  });

  const { usuario } = useAuth();
  const puedeGenerarPagos = usuario?.rol === 'ADMIN' || usuario?.rol === 'DUENO';

  const [pagoAEliminar, setPagoAEliminar] = useState<Pago | null>(null);

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

  const abrirEditar = (pago: Pago) => {
    setPagoActual(pago);
    setEditando(true);
    setDialogOpen(true);
  };

  const guardar = () => {
    const operacion = editando && pagoActual.id
      ? pagoService.update(pagoActual.id, pagoActual)
      : pagoService.create(pagoActual);
    operacion.then(() => {
      cargarPagos();
      cargarResumen();
      setDialogOpen(false);
    });
  };

  const generarPagosDelMes = () => {
    setGenerando(true);
    pagoService.generarMes()
      .then((res) => {
        const { generados } = res.data;
        setSnackbar({
          open: true,
          mensaje: generados > 0
            ? `Se generaron ${generados} pago${generados === 1 ? '' : 's'} nuevo${generados === 1 ? '' : 's'}.`
            : 'No hay pagos nuevos para generar este mes.',
          tipo: 'success',
        });
        if (generados > 0) {
          cargarPagos();
          cargarResumen();
        }
      })
      .catch(() => {
        setSnackbar({ open: true, mensaje: 'No se pudieron generar los pagos del mes.', tipo: 'error' });
      })
      .finally(() => setGenerando(false));
  };

  const confirmarEliminar = () => {
    if (!pagoAEliminar?.id) return;
    pagoService.delete(pagoAEliminar.id).then(() => {
      cargarPagos();
      cargarResumen();
    });
  };

  const mesAnioDe = (fecha?: string | null) => {
    if (!fecha) return '—';
    const [anio, mes] = fecha.split('-');
    const nombreMes = MESES.find(m => m.valor === mes)?.label || mes;
    return `${nombreMes} ${anio}`;
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
              Pagos & Cuotas
            </Typography>
            <Chip
              label={`${pagos.length} registros`}
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
            Control de ingresos, cobros en efectivo y transferencias bancarias.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}>
          {puedeGenerarPagos && (
            <Button
              variant="outlined"
              startIcon={<EventRepeatIcon />}
              onClick={generarPagosDelMes}
              disabled={generando}
              sx={{ fontWeight: 700, px: 2.5, py: 1.2 }}
            >
              {generando ? 'Generando...' : 'Generar pagos del mes'}
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={abrirNuevo}
            sx={{ fontWeight: 700, px: 3, py: 1.2 }}
          >
            Nuevo pago
          </Button>
        </Stack>
      </Box>

      {/* 2. Cards de Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <KpiRevenueCard
            titulo="Recaudado Hoy"
            valor={resumen.recaudadoHoy || 0}
            icono={<AccountBalanceWalletIcon />}
            color="#16a34a"
            gradient="linear-gradient(135deg, rgba(22, 163, 74, 0.35) 0%, rgba(22, 163, 74, 0) 100%)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <KpiRevenueCard
            titulo="Recaudado Este Mes"
            valor={resumen.recaudadoMes || 0}
            icono={<CalendarMonthIcon />}
            color="#2563eb"
            gradient="linear-gradient(135deg, rgba(37, 99, 235, 0.35) 0%, rgba(37, 99, 235, 0) 100%)"
          />
        </Grid>
      </Grid>

      {/* 3. Barra de Filtros */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3.5 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por alumno..."
            size="small"
            value={filtroAlumno}
            onChange={(e) => setFiltroAlumno(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />
          <TextField
            select
            label="Mes"
            size="small"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            sx={{ width: { xs: '100%', sm: 160 }, minWidth: 150 }}
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
            sx={{ width: { xs: '100%', sm: 160 }, minWidth: 150 }}
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
              sx={{ color: '#64748b', borderColor: '#cbd5e1', height: 40, px: 2.5 }}
            >
              Limpiar
            </Button>
          )}
        </Box>
      </Paper>

      {/* 4. Tabla de Pagos */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3.5, overflow: 'hidden', mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Alumno</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Monto</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Fecha Pago</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Vencimiento</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Método</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2 }}>Estado</TableCell>
              <TableCell sx={{ color: '#475569', fontWeight: 700, px: 3, py: 2, textAlign: 'right' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosFiltrados.map((pago) => {
              const estadoMostrado = pago.estadoEfectivo || pago.estado;
              const st = estadoStyles[estadoMostrado] || estadoStyles.PAGADO;
              const met = pago.metodoPago ? metodoStyles[pago.metodoPago] : null;

              return (
                <TableRow
                  key={pago.id}
                  hover
                  sx={{
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: '#f8fafc' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a', px: 3, py: 2 }}>
                    {pago.alumno?.nombre} {pago.alumno?.apellido}
                  </TableCell>

                  <TableCell sx={{ fontWeight: 800, color: '#16a34a', fontSize: '0.95rem', px: 3, py: 2 }}>
                    ${Number(pago.monto || 0).toLocaleString('es-AR')}
                  </TableCell>

                  <TableCell sx={{ color: '#475569', fontWeight: 500, px: 3, py: 2 }}>
                    {pago.fechaPago || '—'}
                  </TableCell>

                  <TableCell sx={{ color: '#475569', fontWeight: 500, px: 3, py: 2 }}>
                    {pago.fechaVencimiento || '—'}
                  </TableCell>

                  <TableCell sx={{ px: 3, py: 2 }}>
                    {met ? (
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
                    ) : (
                      <Typography variant="caption" color="text.secondary">—</Typography>
                    )}
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

                  <TableCell sx={{ textAlign: 'right', px: 3, py: 2 }}>
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
                        onClick={() => setPagoAEliminar(pago)}
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
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <ReceiptLongIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      No se encontraron pagos registrados
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Registrá un nuevo cobro haciendo clic en el botón superior "Nuevo pago".
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
                const alumno = alumnos.find(a => a.id === Number(e.target.value)) || null;
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
              slotProps={{
                inputLabel: { shrink: true },
                input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }
              }}
              onChange={(e) => setPagoActual({ ...pagoActual, monto: e.target.value })}
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
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

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Método de pago
                </Typography>
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={pagoActual.metodoPago}
                  onChange={(e) => setPagoActual({ ...pagoActual, metodoPago: e.target.value as MetodoPago })}
                >
                  <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                  <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                  Estado
                </Typography>
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={pagoActual.estado}
                  onChange={(e) => setPagoActual({ ...pagoActual, estado: e.target.value as EstadoPago })}
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
              value={pagoActual.notas || ''}
              slotProps={{ inputLabel: { shrink: true } }}
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

      <ConfirmDialog
        open={!!pagoAEliminar}
        titulo="Eliminar pago"
        mensaje={
          <>
            ¿Seguro que querés eliminar el pago de <strong>{pagoAEliminar?.alumno?.nombre} {pagoAEliminar?.alumno?.apellido}</strong> correspondiente a <strong>{mesAnioDe(pagoAEliminar?.fechaVencimiento)}</strong>? Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Eliminar"
        colorConfirmar="error"
        onConfirm={confirmarEliminar}
        onClose={() => setPagoAEliminar(null)}
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

export default Pagos;
