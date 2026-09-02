import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Button, TextField, InputBase,
  Chip, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Autocomplete from '@mui/material/Autocomplete';
import { ejercicioFijoPlanService } from '../services/api';
import { Ejercicio, EjercicioFijoPlan, PatronMovimiento, TipoBloqueFijo } from '../types';

interface BloqueFijoProps {
  planificacionId: number | string;
  tipoBloque: TipoBloqueFijo;
  titulo: string;
  catalogoEjercicios: Ejercicio[];
  patronFiltro?: PatronMovimiento;
  onChange?: () => void;
}

interface FilaDraft {
  id?: number;
  ejercicioId?: number;
  seriesReps?: string;
  orden?: number;
}

const BloqueFijo: React.FC<BloqueFijoProps> = ({
  planificacionId,
  tipoBloque,
  titulo,
  catalogoEjercicios,
  patronFiltro,
  onChange,
}) => {
  const [items, setItems] = useState<EjercicioFijoPlan[]>([]);
  const [nuevaFila, setNuevaFila] = useState<FilaDraft | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [filaEdicion, setFilaEdicion] = useState<FilaDraft | null>(null);

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
    const item: Partial<EjercicioFijoPlan> = {
      planificacion: { id: Number(planificacionId) },
      tipoBloque,
      ejercicio: { id: nuevaFila.ejercicioId } as Ejercicio,
      seriesReps: nuevaFila.seriesReps || '',
      orden: items.length + 1,
    };
    ejercicioFijoPlanService.create(item).then(() => {
      cargar();
      setNuevaFila(null);
      onChange?.();
    });
  };

  const eliminar = (id?: number) => {
    if (!id) return;
    ejercicioFijoPlanService.delete(id).then(() => {
      cargar();
      onChange?.();
    });
  };

  const abrirEditar = (item: EjercicioFijoPlan) => {
    if (!item.id) return;
    setEditandoId(item.id);
    setFilaEdicion({ ...item, ejercicioId: item.ejercicio?.id });
  };

  const guardarEdicion = () => {
    if (!editandoId || !filaEdicion?.ejercicioId) return;
    const item: Partial<EjercicioFijoPlan> = {
      ...filaEdicion,
      tipoBloque,
      ejercicio: { id: filaEdicion.ejercicioId } as Ejercicio,
    };
    ejercicioFijoPlanService.update(editandoId, item).then(() => {
      cargar();
      setEditandoId(null);
      setFilaEdicion(null);
      onChange?.();
    });
  };

  return (
    <Paper elevation={1} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2.5,
          py: 1.8,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#e0f2fe', color: '#0369a1', display: 'flex' }}>
            <FitnessCenterIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {titulo}
          </Typography>
        </Box>
        <Chip
          label={`${items.length} ejercicios`}
          size="small"
          sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '0.725rem' }}
        />
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#ffffff' }}>
            <TableCell sx={{ width: 40, color: '#64748b', fontWeight: 700, fontSize: 11 }}>#</TableCell>
            <TableCell sx={{ color: '#64748b', fontWeight: 700, fontSize: 11 }}>EJERCICIO</TableCell>
            <TableCell sx={{ width: 220, color: '#64748b', fontWeight: 700, fontSize: 11 }}>SERIES / REPETICIONES</TableCell>
            <TableCell sx={{ width: 90, textAlign: 'right' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
              {editandoId === item.id && filaEdicion ? (
                <>
                  <TableCell sx={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Autocomplete
                      size="small"
                      options={opciones}
                      getOptionLabel={(e) => e.nombre || ''}
                      value={catalogoEjercicios.find(e => e.id === filaEdicion.ejercicioId) || null}
                      onChange={(_, newValue) => setFilaEdicion(prev => ({ ...prev, ejercicioId: newValue?.id }))}
                      renderInput={(params) => <TextField {...params} variant="standard" size="small" />}
                      sx={{ minWidth: 200 }}
                    />
                  </TableCell>
                  <TableCell>
                    <InputBase
                      size="small"
                      placeholder="ej: 2 series x 8 reps"
                      sx={{ width: '100%', fontSize: 13, borderBottom: '1px solid #cbd5e1', pb: 0.5 }}
                      value={filaEdicion.seriesReps || ''}
                      onChange={(e) => setFilaEdicion(prev => ({ ...prev, seriesReps: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Button size="small" variant="contained" color="primary" onClick={guardarEdicion} sx={{ py: 0.4, px: 1.5, fontSize: '0.75rem' }}>
                      Guardar
                    </Button>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell sx={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{item.ejercicio?.nombre}</TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>
                    {item.seriesReps ? (
                      <Chip label={item.seriesReps} size="small" sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600 }} />
                    ) : '—'}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => abrirEditar(item)} sx={{ color: '#0284c7', mr: 0.5 }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => eliminar(item.id)}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}

          {nuevaFila && (
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{items.length + 1}</TableCell>
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
                  onChange={(_, newValue) => setNuevaFila(prev => ({ ...prev, ejercicioId: newValue?.id }))}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Buscar ejercicio..." variant="standard" size="small" />
                  )}
                  sx={{ minWidth: 200 }}
                />
              </TableCell>
              <TableCell>
                <InputBase
                  size="small"
                  placeholder="ej: 2 series x 8 reps"
                  sx={{ width: '100%', fontSize: 13, borderBottom: '1px solid #16a34a', pb: 0.5 }}
                  onChange={(e) => setNuevaFila(prev => ({ ...prev, seriesReps: e.target.value }))}
                />
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Button size="small" variant="contained" color="primary" onClick={guardarNuevo} sx={{ py: 0.4, px: 1.5, fontSize: '0.75rem' }}>
                  Guardar
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Box
        onClick={() => setNuevaFila({})}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 1.2,
          cursor: 'pointer',
          color: '#64748b',
          fontSize: 13,
          fontWeight: 600,
          borderTop: '1px dashed #e2e8f0',
          transition: 'all 0.15s ease',
          '&:hover': { bgcolor: '#f0fdf4', color: '#16a34a' }
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} /> Agregar ejercicio al bloque
      </Box>
    </Paper>
  );
};

export default BloqueFijo;
