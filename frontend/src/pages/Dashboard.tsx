import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Button, Chip, Stack, Paper, Alert, AlertTitle, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText, Divider
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import WarningIcon from '@mui/icons-material/Warning';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { dashboardService } from '../services/api';
import { DashboardKPIs, AlumnoPorVencer } from '../types';

interface KpiCardProps {
  titulo: string;
  valor: number | string;
  icono: React.ReactElement;
  color: string;
  gradient?: string;
  subtitulo?: string;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ titulo, valor, icono, color, gradient, subtitulo, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
      borderRadius: 4,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px -4px ${color}25`,
        borderColor: `${color}60`,
      } : {},
    }}
  >
    {/* Decorative background glow */}
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
        zIndex: 0,
      }}
    />

    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}15`,
            color: color,
          }}
        >
          {React.cloneElement(icono as React.ReactElement<any>, { sx: { fontSize: 26, color } })}
        </Box>
        {subtitulo && (
          <Chip
            label={subtitulo}
            size="small"
            sx={{
              bgcolor: `${color}10`,
              color: color,
              fontWeight: 700,
              fontSize: '0.7rem',
              border: `1px solid ${color}25`
            }}
          />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
        {titulo}
      </Typography>

      <Typography
        variant="h3"
        sx={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.03em'
        }}
      >
        {valor}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [planesPorVencer, setPlanesPorVencer] = useState<AlumnoPorVencer[]>([]);
  const [dialogPlanesOpen, setDialogPlanesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardService.getKpis()
      .then(res => {
        setKpis(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    dashboardService.getPlanesPorVencer()
      .then(res => setPlanesPorVencer(res.data))
      .catch(err => console.error(err));
  }, []);

  const vencidos = planesPorVencer.filter(p => p.vencido);
  const proximos = planesPorVencer.filter(p => !p.vencido);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
        <CircularProgress color="primary" size={44} thickness={4} />
        <Typography variant="body2" color="text.secondary">Cargando métricas del gimnasio...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Alerta de planes por vencer */}
      {planesPorVencer.length > 0 && (
        <Alert
          severity={vencidos.length > 0 ? 'error' : 'warning'}
          icon={<EventBusyIcon />}
          sx={{ mb: 3, borderRadius: 3, alignItems: 'center' }}
          action={
            <Button
              color="inherit"
              size="small"
              sx={{ fontWeight: 700 }}
              onClick={() => setDialogPlanesOpen(true)}
            >
              Ver detalle
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 700 }}>
            {planesPorVencer.length} {planesPorVencer.length === 1 ? 'alumno tiene' : 'alumnos tienen'} el plan vencido o por vencer
          </AlertTitle>
          {vencidos.length > 0 && `${vencidos.length} vencido${vencidos.length === 1 ? '' : 's'}`}
          {vencidos.length > 0 && proximos.length > 0 && ' · '}
          {proximos.length > 0 && `${proximos.length} por vencer en los próximos 5 días`}
        </Alert>
      )}

      {/* Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: { xs: -50, md: -20 },
            bottom: -50,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,74,0.3) 0%, rgba(22,163,74,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, position: 'relative', zIndex: 1 }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Chip
                icon={<TrendingUpIcon style={{ color: '#22c55e' }} />}
                label="Panel en vivo"
                size="small"
                sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}
              />
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', mb: 0.5 }}>
              ¡Hola de nuevo, Coach! 👋
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 600 }}>
              Aquí tenés el estado general de tus alumnos, cuotas cobradas y vencimientos de esta semana.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleIcon />}
              onClick={() => navigate('/alumnos')}
              sx={{ fontWeight: 700, px: 2.5, py: 1.2 }}
            >
              Nuevo Alumno
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/pagos')}
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                fontWeight: 700,
                px: 2.5,
                py: 1.2,
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              Cobrar Cuota
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* KPI Cards Grid */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0f172a' }}>
        Métricas Principales
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            titulo="Alumnos Activos"
            valor={kpis?.alumnosActivos ?? 0}
            icono={<PeopleIcon />}
            color="#16a34a"
            gradient="linear-gradient(135deg, rgba(22, 163, 74, 0.4) 0%, rgba(22, 163, 74, 0) 100%)"
            subtitulo="Activos"
            onClick={() => navigate('/alumnos')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            titulo="Pagos Pendientes"
            valor={kpis?.pagosPendientes ?? 0}
            icono={<PaymentIcon />}
            color="#f59e0b"
            gradient="linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0) 100%)"
            subtitulo="Por cobrar"
            onClick={() => navigate('/pagos')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            titulo="Pagos Vencidos"
            valor={kpis?.pagosVencidos ?? 0}
            icono={<WarningIcon />}
            color="#ef4444"
            gradient="linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 100%)"
            subtitulo="Atención"
            onClick={() => navigate('/pagos')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            titulo="Planes por vencer"
            valor={planesPorVencer.length}
            icono={<EventBusyIcon />}
            color={vencidos.length > 0 ? '#ef4444' : '#f59e0b'}
            gradient={vencidos.length > 0
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 100%)'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0) 100%)'}
            subtitulo="Plan"
            onClick={() => setDialogPlanesOpen(true)}
          />
        </Grid>
      </Grid>

      {/* Quick Access Shortcuts */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0f172a' }}>
        Accesos Rápidos
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            onClick={() => navigate('/alumnos')}
            sx={{
              p: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#ffffff',
              '&:hover': {
                borderColor: '#16a34a',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.12)',
                '& .arrow-icon': { transform: 'translateX(4px)', color: '#16a34a' }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#dcfce7', color: '#15803d' }}>
                <PeopleIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
                  Gestión de Alumnos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Alta, edición y fichas médicas
                </Typography>
              </Box>
            </Box>
            <ArrowForwardIcon className="arrow-icon" sx={{ color: '#94a3b8', transition: 'all 0.2s' }} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            onClick={() => navigate('/planificaciones')}
            sx={{
              p: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#ffffff',
              '&:hover': {
                borderColor: '#16a34a',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.12)',
                '& .arrow-icon': { transform: 'translateX(4px)', color: '#16a34a' }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#e0e7ff', color: '#4338ca' }}>
                <AssignmentTurnedInIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
                  Planificaciones
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Armá y enviá rutinas por email
                </Typography>
              </Box>
            </Box>
            <ArrowForwardIcon className="arrow-icon" sx={{ color: '#94a3b8', transition: 'all 0.2s' }} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            onClick={() => navigate('/ejercicios')}
            sx={{
              p: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#ffffff',
              '&:hover': {
                borderColor: '#16a34a',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.12)',
                '& .arrow-icon': { transform: 'translateX(4px)', color: '#16a34a' }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#fef3c7', color: '#b45309' }}>
                <FitnessCenterIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
                  Banco de Ejercicios
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Catálogo con videos y patrones
                </Typography>
              </Box>
            </Box>
            <ArrowForwardIcon className="arrow-icon" sx={{ color: '#94a3b8', transition: 'all 0.2s' }} />
          </Card>
        </Grid>
      </Grid>

      {/* Detalle de planes por vencer */}
      <Dialog open={dialogPlanesOpen} onClose={() => setDialogPlanesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Planes vencidos o por vencer</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {planesPorVencer.length === 0 ? (
            <Typography sx={{ p: 3 }} color="text.secondary">
              No hay planes vencidos ni por vencer.
            </Typography>
          ) : (
            <List disablePadding>
              {planesPorVencer.map((item, idx) => (
                <React.Fragment key={item.alumnoId}>
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderLeft: '4px solid',
                      borderLeftColor: item.vencido ? '#ef4444' : '#f59e0b',
                    }}
                    secondaryAction={
                      <Chip
                        label={item.vencido
                          ? `Vencido hace ${Math.abs(item.diasRestantes)} día${Math.abs(item.diasRestantes) === 1 ? '' : 's'}`
                          : item.diasRestantes === 0
                            ? 'Vence hoy'
                            : `Vence en ${item.diasRestantes} día${item.diasRestantes === 1 ? '' : 's'}`}
                        size="small"
                        sx={{
                          bgcolor: item.vencido ? '#fee2e2' : '#fef3c7',
                          color: item.vencido ? '#b91c1c' : '#b45309',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                    }
                  >
                    <ListItemText
                      primary={item.nombreCompleto}
                      secondary={`Vencimiento: ${new Date(item.fechaVencimientoCuota + 'T00:00:00').toLocaleDateString('es-AR')}`}
                      slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                      sx={{ pr: 14 }}
                    />
                  </ListItem>
                  {idx < planesPorVencer.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPlanesOpen(false)}>Cerrar</Button>
          <Button variant="contained" onClick={() => navigate('/alumnos')}>
            Ir a Alumnos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
