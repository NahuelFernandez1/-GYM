import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, CircularProgress,
  FormControlLabel, Checkbox
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const EMAIL_RECORDADO_KEY = 'masgym_email_recordado';

const Login: React.FC = () => {
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_RECORDADO_KEY) || '');
  const [password, setPassword] = useState('');
  const [recordarEmail, setRecordarEmail] = useState(() => !!localStorage.getItem(EMAIL_RECORDADO_KEY));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      if (recordarEmail) {
        localStorage.setItem(EMAIL_RECORDADO_KEY, email);
      } else {
        localStorage.removeItem(EMAIL_RECORDADO_KEY);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
        p: 2,
      }}
    >
      {/* Resplandor verde de marca, esquina superior derecha */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: -120, md: -180 },
          right: { xs: -120, md: -160 },
          width: { xs: 300, md: 460 },
          height: { xs: 300, md: 460 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.35) 0%, rgba(22,163,74,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      {/* Resplandor dorado, esquina inferior izquierda */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: -140, md: -200 },
          left: { xs: -100, md: -140 },
          width: { xs: 280, md: 420 },
          height: { xs: 280, md: 420 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      {/* Isotipo gigante desvaído, de fondo — versión toda blanca para que se
          desvanezca parejo contra el navy (la original tiene trazos negros
          que se pierden y dejan el dibujo incompleto) */}
      <Box
        component="img"
        src="/logo-watermark.png"
        alt=""
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: { xs: 520, sm: 700, md: 900 },
          right: { xs: '-25%', sm: '-12%', md: '2%' },
          bottom: { xs: '-8%', md: '-14%' },
          opacity: 0.1,
          transform: 'rotate(-8deg)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {/* Isotipo chico, arriba a la izquierda */}
      <Box
        component="img"
        src="/logo-watermark.png"
        alt=""
        aria-hidden="true"
        sx={{
          position: 'absolute',
          display: { xs: 'none', sm: 'block' },
          width: { sm: 220, md: 280 },
          left: { sm: '4%', md: '6%' },
          top: { sm: '8%', md: '10%' },
          opacity: 0.08,
          transform: 'rotate(10deg)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {/* Isotipo mediano, borde inferior izquierdo */}
      <Box
        component="img"
        src="/logo-watermark.png"
        alt=""
        aria-hidden="true"
        sx={{
          position: 'absolute',
          width: { xs: 260, md: 340 },
          left: { xs: '-14%', md: '-6%' },
          bottom: { xs: '4%', md: '6%' },
          opacity: 0.07,
          transform: 'rotate(6deg)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {/* Isotipo chico, arriba a la derecha */}
      <Box
        component="img"
        src="/logo-watermark.png"
        alt=""
        aria-hidden="true"
        sx={{
          position: 'absolute',
          display: { xs: 'none', md: 'block' },
          width: 180,
          right: '10%',
          top: '6%',
          opacity: 0.06,
          transform: 'rotate(-14deg)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* Franjas diagonales, eco de las barras del isotipo */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '10%', md: '14%' },
          left: { xs: -60, md: -40 },
          width: { xs: 220, md: 320 },
          height: 10,
          borderRadius: 6,
          background: '#f59e0b',
          opacity: 0.16,
          transform: 'rotate(-18deg)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 'calc(10% + 22px)', md: 'calc(14% + 26px)' },
          left: { xs: -80, md: -60 },
          width: { xs: 220, md: 320 },
          height: 10,
          borderRadius: 6,
          background: '#f59e0b',
          opacity: 0.1,
          transform: 'rotate(-18deg)',
          pointerEvents: 'none',
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 380,
          borderRadius: 4,
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.55)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img src="/logo.png" alt="MASGYM" style={{ height: 56 }} />
        </Box>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Iniciar sesión
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={recordarEmail}
                onChange={(e) => setRecordarEmail(e.target.checked)}
                size="small"
              />
            }
            label="Recordar mi email en este dispositivo"
            sx={{ mb: 2, '& .MuiFormControlLabel-label': { fontSize: '0.875rem', color: 'text.secondary' } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
