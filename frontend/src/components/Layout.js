import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';

const DRAWER_WIDTH = 240;

const menuItems = [
  { texto: 'Dashboard', icono: <DashboardIcon />, ruta: '/' },
  { texto: 'Alumnos', icono: <PeopleIcon />, ruta: '/alumnos' },
  { texto: 'Pagos', icono: <PaymentIcon />, ruta: '/pagos' },
  { texto: 'Ejercicios', icono: <FitnessCenterIcon />, ruta: '/ejercicios' },
  { texto: 'Planificaciones', icono: <AssignmentIcon />, ruta: '/planificaciones' },
];

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
        <img src="/logo.png" alt="MASGYM" style={{ height: 44, maxWidth: '100%', objectFit: 'contain' }} />
      </Box>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.ruta || (item.ruta !== '/' && location.pathname.startsWith(item.ruta));
          return (
            <ListItem key={item.texto} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.ruta);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
                    '& .MuiListItemIcon-root': { color: '#ffffff' },
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                  '&:not(.Mui-selected):hover': {
                    bgcolor: 'rgba(46, 125, 50, 0.08)',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: selected ? '#ffffff' : 'text.secondary' }}>
                  {item.icono}
                </ListItemIcon>
                <ListItemText
                  primary={item.texto}
                  primaryTypographyProps={{
                    fontSize: '0.925rem',
                    fontWeight: selected ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: '#ffffff',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
            <img src="/logo.png" alt="MASGYM" style={{ height: 32, objectFit: 'contain' }} />
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
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
              borderRight: '1px solid',
              borderColor: 'divider',
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
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;