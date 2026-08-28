import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Switch, FormControlLabel, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { usuarioService } from '../services/api';
import { Usuario, Rol } from '../types';

const rolLabels: Record<Rol, string> = {
  ADMIN: 'Administrador',
  DUENO: 'Dueño',
  PROFESOR: 'Profesor',
};

const usuarioInicial: Usuario = {
  nombre: '',
  email: '',
  password: '',
  rol: 'PROFESOR',
  activo: true,
};

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState<Usuario>(usuarioInicial);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { cargarUsuarios(); }, []);

  const cargarUsuarios = () => {
    usuarioService.getAll().then(res => setUsuarios(res.data));
  };

  const abrirNuevo = () => {
    setUsuarioActual(usuarioInicial);
    setEditando(false);
    setError(null);
    setDialogOpen(true);
  };

  const abrirEditar = (usuario: Usuario) => {
    setUsuarioActual({ ...usuario, password: '' });
    setEditando(true);
    setError(null);
    setDialogOpen(true);
  };

  const guardar = () => {
    setError(null);
    const accion = editando && usuarioActual.id
      ? usuarioService.update(usuarioActual.id, usuarioActual)
      : usuarioService.create(usuarioActual);

    accion
      .then(() => {
        cargarUsuarios();
        setDialogOpen(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'No se pudo guardar el usuario.');
      });
  };

  const toggleActivo = (usuario: Usuario) => {
    if (!usuario.id) return;
    usuarioService.update(usuario.id, { activo: !usuario.activo }).then(cargarUsuarios);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
          Nuevo Usuario
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{rolLabels[usuario.rol]}</TableCell>
                <TableCell>
                  <Chip
                    label={usuario.activo ? 'Activo' : 'Desactivado'}
                    color={usuario.activo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => abrirEditar(usuario)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <Switch
                    checked={usuario.activo}
                    onChange={() => toggleActivo(usuario)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <TextField
            label="Nombre"
            fullWidth
            required
            value={usuarioActual.nombre}
            onChange={(e) => setUsuarioActual({ ...usuarioActual, nombre: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={usuarioActual.email}
            onChange={(e) => setUsuarioActual({ ...usuarioActual, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label={editando ? 'Nueva contraseña (dejar vacío para no cambiarla)' : 'Contraseña'}
            type="password"
            fullWidth
            required={!editando}
            value={usuarioActual.password}
            onChange={(e) => setUsuarioActual({ ...usuarioActual, password: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Rol"
            fullWidth
            value={usuarioActual.rol}
            onChange={(e) => setUsuarioActual({ ...usuarioActual, rol: e.target.value as Rol })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="ADMIN">Administrador</MenuItem>
            <MenuItem value="DUENO">Dueño</MenuItem>
            <MenuItem value="PROFESOR">Profesor</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={usuarioActual.activo}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, activo: e.target.checked })}
              />
            }
            label="Activo"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;
