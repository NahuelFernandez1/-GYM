import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Paper, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, InputBase
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Autocomplete from '@mui/material/Autocomplete';
import {
  planificacionService, semanaPlanService,
  diaPlanService, ejercicioPlanificadoService, ejercicioService
} from '../services/api';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

const DetallePlanificacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [semanas, setSemanas] = useState([]);
  const [semanaActual, setSemanaActual] = useState(0);
  const [dias, setDias] = useState({});
  const [ejerciciosPorDia, setEjerciciosPorDia] = useState({});
  const [catalogoEjercicios, setCatalogoEjercicios] = useState([]);

  const [dialogEditarSemana, setDialogEditarSemana] = useState(false);
  const [semanaEditando, setSemanaEditando] = useState(null);
  const [dialogDia, setDialogDia] = useState(false);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null);
  const [diaForm, setDiaForm] = useState('LUNES');

  const [dialogEditarEjercicio, setDialogEditarEjercicio] = useState(false);
  const [ejercicioEditando, setEjercicioEditando] = useState(null);

  // Fila nueva inline por día
  const [nuevaFilaPorDia, setNuevaFilaPorDia] = useState({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    planificacionService.getById(id).then(res => setPlan(res.data));
    cargarSemanas();
    ejercicioService.getAll().then(res => setCatalogoEjercicios(res.data));
  }, [id]);

  const cargarSemanas = () => {
    semanaPlanService.getByPlanificacion(id).then(res => {
      setSemanas(res.data);
      res.data.forEach(s => cargarDias(s.id));
    });
  };

  const cargarDias = (semanaId) => {
    diaPlanService.getBySemana(semanaId).then(res => {
      setDias(prev => ({ ...prev, [semanaId]: res.data }));
      res.data.forEach(d => cargarEjercicios(d.id));
    });
  };

  const cargarEjercicios = (diaId) => {
    ejercicioPlanificadoService.getByDia(diaId).then(res => {
      setEjerciciosPorDia(prev => ({ ...prev, [diaId]: res.data }));
    });
  };

  const agregarSemana = () => {
    const nuevaSemana = {
      planificacion: { id: parseInt(id) },
      numeroSemana: semanas.length + 1,
      notas: ''
    };
    semanaPlanService.create(nuevaSemana).then(() => cargarSemanas());
  };

  const eliminarSemana = (semanaId) => {
    if (window.confirm('¿Eliminar esta semana y todo su contenido?')) {
      semanaPlanService.delete(semanaId).then(() => {
        setSemanaActual(0);
        cargarSemanas();
      });
    }
  };

  const copiarSemana = (semanaId) => {
    semanaPlanService.copiar(semanaId).then(() => cargarSemanas());
  };

  const abrirEditarSemana = (semana) => {
    setSemanaEditando({ ...semana });
    setDialogEditarSemana(true);
  };

  const guardarEditarSemana = () => {
    semanaPlanService.update(semanaEditando.id, semanaEditando).then(() => {
      cargarSemanas();
      setDialogEditarSemana(false);
    });
  };

  const agregarDia = () => {
    const nuevoDia = {
      semanaPlan: { id: semanaSeleccionada.id },
      diaSemana: diaForm,
      notas: ''
    };
    diaPlanService.create(nuevoDia).then(() => {
      cargarDias(semanaSeleccionada.id);
      setDialogDia(false);
    });
  };

  const eliminarDia = (diaId, semanaId) => {
    if (window.confirm('¿Eliminar este día y sus ejercicios?')) {
      diaPlanService.delete(diaId).then(() => cargarDias(semanaId));
    }
  };

  const guardarNuevoEjercicio = (diaId) => {
    const fila = nuevaFilaPorDia[diaId];
    if (!fila?.ejercicioId) return;
    const nuevoEjercicio = {
      diaPlan: { id: diaId },
      ejercicio: { id: fila.ejercicioId },
      series: parseInt(fila.series) || 0,
      repeticiones: parseInt(fila.repeticiones) || 0,
      rir: fila.rir || null,
      notas: fila.notas || '',
      orden: (ejerciciosPorDia[diaId]?.length || 0) + 1,
    };
    ejercicioPlanificadoService.create(nuevoEjercicio).then(() => {
      cargarEjercicios(diaId);
      setNuevaFilaPorDia(prev => ({ ...prev, [diaId]: null }));
    });
  };

  const eliminarEjercicio = (ejercicioId, diaId) => {
    ejercicioPlanificadoService.delete(ejercicioId).then(() => cargarEjercicios(diaId));
  };

  const abrirEditarEjercicio = (ep) => {
    setEjercicioEditando({ ...ep });
    setDialogEditarEjercicio(true);
  };

  const guardarEditarEjercicio = () => {
    ejercicioPlanificadoService.update(ejercicioEditando.id, ejercicioEditando).then(() => {
      cargarEjercicios(ejercicioEditando.diaPlan.id);
      setDialogEditarEjercicio(false);
    });
  };

  const semanaVisible = semanas[semanaActual];

  if (!plan) return <Typography>Cargando...</Typography>;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <IconButton onClick={() => navigate('/planificaciones')}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">{plan.nombre}</Typography>
          <Typography variant="body2" color="text.secondary">
            {plan.alumno?.nombre} {plan.alumno?.apellido} —
            <Chip label={plan.estado} size="small" sx={{ ml: 1 }} />
          </Typography>
        </Box>
        <Box display="flex" gap={2} sx={{ ml: 'auto' }}>
          <Button variant="outlined" color="success"
            onClick={() => {
              planificacionService.enviar(id)
                .then(() => alert('✅ Mail enviado correctamente'))
                .catch(() => alert('❌ Error al enviar el mail'));
            }}>
            Enviar por mail
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={agregarSemana}>
            Agregar semana
          </Button>
        </Box>
      </Box>

      {semanas.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          No hay semanas todavía. Agregá la primera semana para empezar.
        </Paper>
      )}

      {semanas.length > 0 && (
        <>
          {/* Tabs de semanas */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
            <Tabs value={semanaActual} onChange={(e, v) => setSemanaActual(v)}
              textColor="primary" indicatorColor="primary">
              {semanas.map((s, i) => (
                <Tab key={s.id} label={`Semana ${s.numeroSemana}`} />
              ))}
            </Tabs>
            {semanaVisible && (
              <Box display="flex" gap={1} ml={2}>
                <IconButton size="small" title="Editar" onClick={() => abrirEditarSemana(semanaVisible)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Copiar" onClick={() => copiarSemana(semanaVisible.id)}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Eliminar" color="error" onClick={() => eliminarSemana(semanaVisible.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Button size="small" variant="outlined" startIcon={<AddIcon />}
                  onClick={() => { setSemanaSeleccionada(semanaVisible); setDiaForm('LUNES'); setDialogDia(true); }}>
                  Agregar día
                </Button>
              </Box>
            )}
          </Box>

          {/* Días de la semana visible */}
          {(dias[semanaVisible?.id] || []).map((dia) => (
            <Paper key={dia.id} elevation={1} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
              {/* Header día */}
              <Box display="flex" alignItems="center" justifyContent="space-between"
                sx={{ px: 2, py: 1.5, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight="bold" color="primary">{dia.diaSemana}</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label={`${(ejerciciosPorDia[dia.id] || []).length} ejercicios`}
                    size="small" color="primary" variant="outlined" />
                  <IconButton size="small" color="error" onClick={() => eliminarDia(dia.id, semanaVisible.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Tabla de ejercicios */}
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ width: 32, color: 'text.secondary', fontSize: 11 }}>#</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 11 }}>Ejercicio</TableCell>
                    <TableCell sx={{ width: 70, color: 'text.secondary', fontSize: 11 }}>Series</TableCell>
                    <TableCell sx={{ width: 70, color: 'text.secondary', fontSize: 11 }}>Reps</TableCell>
                    <TableCell sx={{ width: 80, color: 'text.secondary', fontSize: 11 }}>RIR</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: 11 }}>Notas</TableCell>
                    <TableCell sx={{ width: 80 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(ejerciciosPorDia[dia.id] || []).map((ep) => (
                    <TableRow key={ep.id} hover>
                      <TableCell sx={{ color: 'text.muted', fontSize: 11 }}>{ep.orden}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{ep.ejercicio?.nombre}</TableCell>
                      <TableCell>{ep.series}</TableCell>
                      <TableCell>{ep.repeticiones}</TableCell>
                      <TableCell>
                        {ep.rir && (
                          <Chip label={`RIR ${ep.rir}`} size="small"
                            sx={{ bgcolor: '#fff8e1', color: '#f57f17', fontSize: 11 }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>{ep.notas}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => abrirEditarEjercicio(ep)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => eliminarEjercicio(ep.id, dia.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fila nueva inline */}
                  {nuevaFilaPorDia[dia.id] && (
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell sx={{ color: 'text.muted', fontSize: 11 }}>
                        {(ejerciciosPorDia[dia.id]?.length || 0) + 1}
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={catalogoEjercicios}
                          getOptionLabel={(e) => `${e.nombre}`}
                          filterOptions={(options, { inputValue }) => {
                            if (inputValue.length < 2) return [];
                            const input = inputValue.toLowerCase();
                            return options.filter(o => o.nombre.toLowerCase().startsWith(input));
                          }}
                          noOptionsText="Escribí al menos 2 letras..."
                          onChange={(event, newValue) => setNuevaFilaPorDia(prev => ({
                            ...prev, [dia.id]: { ...prev[dia.id], ejercicioId: newValue?.id }
                          }))}
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Buscar ejercicio..." variant="standard" />
                          )}
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>
                      <TableCell>
                        <InputBase size="small" placeholder="—"
                          sx={{ width: 50, fontSize: 13 }}
                          onChange={(e) => setNuevaFilaPorDia(prev => ({
                            ...prev, [dia.id]: { ...prev[dia.id], series: e.target.value }
                          }))} />
                      </TableCell>
                      <TableCell>
                        <InputBase size="small" placeholder="—"
                          sx={{ width: 50, fontSize: 13 }}
                          onChange={(e) => setNuevaFilaPorDia(prev => ({
                            ...prev, [dia.id]: { ...prev[dia.id], repeticiones: e.target.value }
                          }))} />
                      </TableCell>
                      <TableCell>
                        <InputBase size="small" placeholder="—"
                          sx={{ width: 50, fontSize: 13 }}
                          onChange={(e) => setNuevaFilaPorDia(prev => ({
                            ...prev, [dia.id]: { ...prev[dia.id], rir: e.target.value }
                          }))} />
                      </TableCell>
                      <TableCell>
                        <InputBase size="small" placeholder="Notas..."
                          sx={{ fontSize: 13, width: '100%' }}
                          onChange={(e) => setNuevaFilaPorDia(prev => ({
                            ...prev, [dia.id]: { ...prev[dia.id], notas: e.target.value }
                          }))} />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" onClick={() => guardarNuevoEjercicio(dia.id)}>
                          Guardar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Botón agregar ejercicio */}
              <Box
                onClick={() => setNuevaFilaPorDia(prev => ({ ...prev, [dia.id]: {} }))}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
                  cursor: 'pointer', color: 'text.secondary', fontSize: 13,
                  borderTop: '1px dashed', borderColor: 'divider',
                  '&:hover': { bgcolor: 'background.default', color: 'primary.main' }
                }}>
                <AddIcon fontSize="small" /> Agregar ejercicio
              </Box>
            </Paper>
          ))}

          {(dias[semanaVisible?.id] || []).length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              No hay días en esta semana. Agregá el primero.
            </Paper>
          )}
        </>
      )}

      {/* Dialog editar semana */}
      <Dialog open={dialogEditarSemana} onClose={() => setDialogEditarSemana(false)}>
        <DialogTitle>Editar semana</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <TextField fullWidth label="Número de semana" type="number"
              value={semanaEditando?.numeroSemana || ''}
              onChange={(e) => setSemanaEditando({ ...semanaEditando, numeroSemana: e.target.value })} />
            <TextField fullWidth label="Notas" multiline rows={3}
              value={semanaEditando?.notas || ''}
              onChange={(e) => setSemanaEditando({ ...semanaEditando, notas: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogEditarSemana(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarEditarSemana}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog agregar día */}
      <Dialog open={dialogDia} onClose={() => setDialogDia(false)}>
        <DialogTitle>Agregar día</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <TextField fullWidth select label="Día de la semana" value={diaForm}
            onChange={(e) => setDiaForm(e.target.value)} sx={{ mt: 1 }}>
            {DIAS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogDia(false)}>Cancelar</Button>
          <Button variant="contained" onClick={agregarDia}>Agregar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog editar ejercicio */}
      <Dialog open={dialogEditarEjercicio} onClose={() => setDialogEditarEjercicio(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar ejercicio</DialogTitle>
        <DialogContent sx={{ pt: '24px !important', pb: 3 }}>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <Typography variant="body1" fontWeight="bold" color="primary">
              {ejercicioEditando?.ejercicio?.nombre}
            </Typography>
            <Box display="flex" gap={2}>
              <TextField fullWidth label="Series" type="number"
                value={ejercicioEditando?.series || ''}
                onChange={(e) => setEjercicioEditando({ ...ejercicioEditando, series: e.target.value })} />
              <TextField fullWidth label="Repeticiones" type="number"
                value={ejercicioEditando?.repeticiones || ''}
                onChange={(e) => setEjercicioEditando({ ...ejercicioEditando, repeticiones: e.target.value })} />
              <TextField fullWidth label="RIR"
                value={ejercicioEditando?.rir || ''}
                onChange={(e) => setEjercicioEditando({ ...ejercicioEditando, rir: e.target.value })} />
            </Box>
            <TextField fullWidth label="Notas" multiline rows={2}
              value={ejercicioEditando?.notas || ''}
              onChange={(e) => setEjercicioEditando({ ...ejercicioEditando, notas: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogEditarEjercicio(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarEditarEjercicio}>Guardar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DetallePlanificacion;