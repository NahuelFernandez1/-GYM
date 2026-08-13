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
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f9a825',
      light: '#fbc02d',
      dark: '#f57f17',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
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