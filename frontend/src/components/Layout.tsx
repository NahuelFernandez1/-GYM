import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  Typography, Chip, Avatar, Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const menuItems = [
  { texto: 'Dashboard', icono: <DashboardIcon />, ruta: '/' },
  { texto: 'Alumnos', icono: <PeopleIcon />, ruta: '/alumnos' },
  { texto: 'Pagos', icono: <PaymentIcon />, ruta: '/pagos' },
  { texto: 'Ejercicios', icono: <FitnessCenterIcon />, ruta: '/ejercicios' },
  { texto: 'Planificaciones', icono: <AssignmentIcon />, ruta: '/planificaciones' },
];

const rolLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  DUENO: 'Dueño',
  PROFESOR: 'Profesor',
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  const items = usuario?.rol === 'ADMIN'
    ? [...menuItems, { texto: 'Usuarios', icono: <AdminPanelSettingsIcon />, ruta: '/usuarios' }]
    : menuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/alumnos')) return 'Alumnos';
    if (location.pathname.startsWith('/pagos')) return 'Pagos & Cuotas';
    if (location.pathname.startsWith('/ejercicios')) return 'Catálogo de Ejercicios';
    if (location.pathname.startsWith('/planificaciones/')) return 'Detalle de Planificación';
    if (location.pathname.startsWith('/planificaciones')) return 'Planificaciones';
    if (location.pathname.startsWith('/usuarios')) return 'Gestión de Usuarios';
    return 'Panel';
  };

  const drawer = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0f172a',
      color: '#f8fafc'
    }}>
      {/* Brand Header */}
      <Box sx={{
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
      }}>
        <img
          src="/logo.png"
          alt="MASGYM"
          style={{ height: 46, maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
        />
      </Box>

      {/* Menu List */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            mb: 1.5,
            display: 'block',
            color: '#64748b',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: '0.6875rem'
          }}
        >
          Menú Principal
        </Typography>

        {items.map((item) => {
          const selected = location.pathname === item.ruta || (item.ruta !== '/' && location.pathname.startsWith(item.ruta));
          return (
            <ListItem key={item.texto} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.ruta);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  px: 2,
                  color: selected ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)',
                    '& .MuiListItemIcon-root': { color: '#ffffff' },
                    '&:hover': {
                      bgcolor: '#15803d',
                    },
                  },
                  '&:not(.Mui-selected):hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    color: '#f8fafc',
                    '& .MuiListItemIcon-root': { color: '#22c55e' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: selected ? '#ffffff' : '#64748b' }}>
                  {item.icono}
                </ListItemIcon>
                <ListItemText
                  primary={item.texto}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.9rem',
                        fontWeight: selected ? 700 : 500,
                      }
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer Coach Box */}
      <Box sx={{
        p: 2,
        m: 2,
        borderRadius: 3,
        bgcolor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5
      }}>
        <Avatar sx={{ bgcolor: '#16a34a', width: 36, height: 36, fontSize: '0.875rem', fontWeight: 700 }}>
          <SportsGymnasticsIcon fontSize="small" />
        </Avatar>
        <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
          <Typography variant="body2" noWrap sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.2 }}>
            {usuario?.nombre || '+GYM Coach'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>
            {usuario ? rolLabels[usuario.rol] || usuario.rol : '● Conectado'}
          </Typography>
        </Box>
        <Tooltip title="Cerrar sesión">
          <IconButton onClick={handleLogout} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#f87171' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          color: '#0f172a',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, sm: 3.5 }, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {getPageTitle()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label="Sistema Activo"
              size="small"
              sx={{
                bgcolor: '#dcfce7',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.725rem',
                border: '1px solid #bbf7d0',
                display: { xs: 'none', sm: 'flex' }
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3.5, md: 4 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          maxWidth: '1600px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
