import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import Pagos from './pages/Pagos';
import Ejercicios from './pages/Ejercicios';
import Planificaciones from './pages/Planificaciones';
import DetallePlanificacion from './pages/DetallePlanificacion';



const theme = createTheme({
  palette: {
    primary: {
      main: '#16a34a',
      light: '#22c55e',
      dark: '#15803d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#000000',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    success: {
      main: '#16a34a',
      light: '#dcfce7',
      dark: '#15803d',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
      dark: '#b91c1c',
    },
    info: {
      main: '#3b82f6',
      light: '#dbeafe',
      dark: '#1d4ed8',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h3: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' },
    h4: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a' },
    h5: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a' },
    h6: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 600, letterSpacing: '-0.01em', color: '#0f172a' },
    subtitle1: { fontWeight: 500, color: '#64748b' },
    subtitle2: { fontWeight: 600, color: '#475569' },
    button: { fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
          boxShadow: 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#f1f5f9',
          padding: '14px 18px',
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.8125rem',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alumnos" element={<Alumnos />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/ejercicios" element={<Ejercicios />} />
            <Route path="/planificaciones" element={<Planificaciones />} />
            <Route path="/planificaciones/:id" element={<DetallePlanificacion />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;