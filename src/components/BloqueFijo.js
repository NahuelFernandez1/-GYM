import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Button, TextField, InputBase
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Autocomplete from '@mui/material/Autocomplete';
import { ejercicioFijoPlanService } from '../services/api';

const BloqueFijo = ({ planificacionId, tipoBloque, titulo, catalogoEjercicios, patronFiltro }) => {
  const [items, setItems] = useState([]);
  const [nuevaFila, setNuevaFila] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [filaEdicion, setFilaEdicion] = useState(null);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planificacionId, tipoBloque]);

  const cargar = () => {
    ejercicioFijoPlanService.getByPlanificacion(planificacionId).then(res => {
      setItems(res.data.filter(i => i.tipoBloque === tipoBloque));
    });
  };

  const opciones = patronFiltro
    ? catalogoEjercicios.filter(e => e.patronMovimiento === patronFiltro)
    : catalogoEjercicios;

  const guardarNuevo = () => {
    if (!nuevaFila?.ejercicioId) return;
    const item = {
      planificacion: { id: parseInt(planificacionId) },
      tipoBloque,
      ejercicio: { id: nuevaFila.ejercicioId },
      seriesReps: nuevaFila.seriesReps || '',
      orden: items.length + 1,
    };
    ejercicioFijoPlanService.create(item).then(() => {
      cargar();
      setNuevaFila(null);
    });
  };

  const eliminar = (id) => {
    ejercicioFijoPlanService.delete(id).then(cargar);
  };

  const abrirEditar = (item) => {
    setEditandoId(item.id);
    setFilaEdicion({ ...item, ejercicioId: item.ejercicio?.id });
  };

  const guardarEdicion = () => {
    const item = {
      ...filaEdicion,
      ejercicio: { id: filaEdicion.ejercicioId },
    };
    ejercicioFijoPlanService.update(editandoId, item).then(() => {
      cargar();
      setEditandoId(null);
      setFilaEdicion(null);
    });
  };

  return (
    <Paper elevation={1} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography fontWeight="bold" color="primary">{titulo}</Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell sx={{ width: 32, color: 'text.secondary', fontSize: 11 }}>#</TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: 11 }}>Ejercicio</TableCell>
            <TableCell sx={{ width: 160, color: 'text.secondary', fontSize: 11 }}>Series/Repeticiones</TableCell>
            <TableCell sx={{ width: 80 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.id} hover>
              {editandoId === item.id ? (
                <>
                  <TableCell sx={{ color: 'text.muted', fontSize: 11 }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Autocomplete
                      size="small"
                      options={opciones}
                      getOptionLabel={(e) => e.nombre || ''}
                      value={catalogoEjercicios.find(e => e.id === filaEdicion.ejercicioId) || null}
                      onChange={(e, newValue) => setFilaEdicion(prev => ({ ...prev, ejercicioId: newValue?.id }))}
                      renderInput={(params) => <TextField {...params} variant="standard" />}
                      sx={{ minWidth: 200 }}
                    />
                  </TableCell>
                  <TableCell>
                    <InputBase size="small" placeholder="ej: 2-8reps" sx={{ width: '100%', fontSize: 13 }}
                      value={filaEdicion.seriesReps || ''}
                      onChange={(e) => setFilaEdicion(prev => ({ ...prev, seriesReps: e.target.value }))} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" onClick={guardarEdicion}>Guardar</Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell sx={{ color: 'text.muted', fontSize: 11 }}>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{item.ejercicio?.nombre}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>{item.seriesReps}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => abrirEditar(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => eliminar(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}

          {nuevaFila && (
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ color: 'text.muted', fontSize: 11 }}>{items.length + 1}</TableCell>
              <TableCell>
                <Autocomplete
                  size="small"
                  options={opciones}
                  getOptionLabel={(e) => e.nombre || ''}
                  filterOptions={(options, { inputValue }) => {
                    if (inputValue.length < 2) return options.slice(0, 20);
                    const input = inputValue.toLowerCase();
                    return options.filter(o => o.nombre.toLowerCase().includes(input));
                  }}
                  onChange={(e, newValue) => setNuevaFila(prev => ({ ...prev, ejercicioId: newValue?.id }))}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Buscar ejercicio..." variant="standard" />
                  )}
                  sx={{ minWidth: 200 }}
                />
              </TableCell>
              <TableCell>
                <InputBase size="small" placeholder="ej: 2-8reps" sx={{ width: '100%', fontSize: 13 }}
                  onChange={(e) => setNuevaFila(prev => ({ ...prev, seriesReps: e.target.value }))} />
              </TableCell>
              <TableCell>
                <Button size="small" variant="contained" onClick={guardarNuevo}>Guardar</Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Box
        onClick={() => setNuevaFila({})}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
          cursor: 'pointer', color: 'text.secondary', fontSize: 13,
          borderTop: '1px dashed', borderColor: 'divider',
          '&:hover': { bgcolor: 'background.default', color: 'primary.main' }
        }}>
        <AddIcon fontSize="small" /> Agregar ejercicio
      </Box>
    </Paper>
  );
};

export default BloqueFijo;
