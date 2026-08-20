import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { dashboardService } from '../services/api';

const KpiCard = ({ titulo, valor, icono, color }) => (
  <Card elevation={2} sx={{ borderRadius: 3 }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary">{titulo}</Typography>
          <Typography variant="h3" fontWeight="bold" color={color}>
            {valor}
          </Typography>
        </Box>
        <Box sx={{
          bgcolor: `${color}20`,
          borderRadius: '50%',
          p: 2,
          display: 'flex'
        }}>
          {React.cloneElement(icono, { sx: { fontSize: 36, color } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Resumen general del gimnasio
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            titulo="Alumnos activos"
            valor={kpis?.alumnosActivos ?? 0}
            icono={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            titulo="Pagos pendientes"
            valor={kpis?.pagosPendientes ?? 0}
            icono={<PaymentIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            titulo="Pagos vencidos"
            valor={kpis?.pagosVencidos ?? 0}
            icono={<WarningIcon />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            titulo="Vencen en 7 días"
            valor={kpis?.alumnosProximosAVencer ?? 0}
            icono={<NotificationsActiveIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;