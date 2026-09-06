import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { reportarError } from '../services/errorReporting';

interface Props {
  children: React.ReactNode;
}

interface State {
  huboError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { huboError: false };
  }

  static getDerivedStateFromError(): State {
    return { huboError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportarError(error.message, error.stack || info.componentStack || undefined);
  }

  render() {
    if (this.state.huboError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f8fafc',
            p: 2,
          }}
        >
          <Paper sx={{ p: 4, maxWidth: 420, textAlign: 'center', borderRadius: 4 }}>
            <ErrorOutlineIcon sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Algo salió mal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ya le avisamos al equipo técnico. Probá recargar la página.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Recargar
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
