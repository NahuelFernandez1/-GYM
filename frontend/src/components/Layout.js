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
    <Box>
      <Box sx={{ bgcolor: '#000000', p: 1 }} />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.texto} disablePadding>
            <ListItemButton
              selected={location.pathname === item.ruta}
              onClick={() => navigate(item.ruta)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icono}
              </ListItemIcon>
              <ListItemText primary={item.texto} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor:'#000000'}}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <img src="/logo.png" alt="MASGYM" style={{ height: 110, objectFit: 'contain' }} />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar sx={{ minHeight: '96px !important'}}/>
        {drawer}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 12 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;