import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Paper, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, InputBase, CircularProgress, Stack, Divider, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Autocomplete from '@mui/material/Autocomplete';
import {
  planificacionService, semanaPlanService,
  diaPlanService, ejercicioPlanificadoService, ejercicioService
} from '../services/api';
import BloqueFijo from '../components/BloqueFijo';
import {
  Planificacion, SemanaPlan, DiaPlan,
  EjercicioPlanificado, Ejercicio, EstadoPlanificacion
} from '../types';

const DIAS = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];

interface FilaDraftPorDia {
  ejercicioId?: number;
  circuito?: string;
  series?: string | number;
  repeticiones?: string | number;
  rir?: string;
  notas?: string;
}

const DetallePlanificacion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Planificacion | null>(null);
  const [semanas, setSemanas] = useState<SemanaPlan[]>([]);
  const [semanaActual, setSemanaActual] = useState(0);
  const [dias, setDias] = useState<Record<number, DiaPlan[]>>({});
  const [ejerciciosPorDia, setEjerciciosPorDia] = useState<Record<number, EjercicioPlanificado[]>>({});
  const [catalogoEjercicios, setCatalogoEjercicios] = useState<Ejercicio[]>([]);

  const [dialogEditarSemana, setDialogEditarSemana] = useState(false);
  const [semanaEditando, setSemanaEditando] = useState<SemanaPlan | null>(null);
  const [dialogDia, setDialogDia] = useState(false);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<SemanaPlan | null>(null);
  const [diaForm, setDiaForm] = useState(DIAS[0]);

  const [dialogEditarEjercicio, setDialogEditarEjercicio] = useState(false);
  const [ejercicioEditando, setEjercicioEditando] = useState<EjercicioPlanificado | null>(null);

  // Fila nueva inline por día
  const [nuevaFilaPorDia, setNuevaFilaPorDia] = useState<Record<number, FilaDraftPorDia | null>>({});

  useEffect(() => {
    if (id) {
      planificacionService.getById(id).then(res => setPlan(res.data));
      cargarSemanas();
      ejercicioService.getAll().then(res => setCatalogoEjercicios(res.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarSemanas = () => {
    if (!id) return;
    semanaPlanService.getByPlanificacion(id).then(res => {
      setSemanas(res.data);
      res.data.forEach(s => {
        if (s.id) cargarDias(s.id);
      });
    });
  };

  const cargarDias = (semanaId: number) => {
    diaPlanService.getBySemana(semanaId).then(res => {
      setDias(prev => ({ ...prev, [semanaId]: res.data }));
      res.data.forEach(d => {
        if (d.id) cargarEjercicios(d.id);
      });
    });
  };

  const cargarEjercicios = (diaId: number) => {
    ejercicioPlanificadoService.getByDia(diaId).then(res => {
      setEjerciciosPorDia(prev => ({ ...prev, [diaId]: res.data }));
    });
  };

  const agregarSemana = () => {
    if (!id) return;
    const nuevaSemana: Partial<SemanaPlan> = {
      planificacion: { id: parseInt(id) },
      numeroSemana: semanas.length + 1,
      notas: ''
    };
    semanaPlanService.create(nuevaSemana).then(() => cargarSemanas());
  };

  const eliminarSemana = (semanaId?: number) => {
    if (!semanaId) return;
    if (window.confirm('¿Eliminar esta semana y todo su contenido?')) {
      semanaPlanService.delete(semanaId).then(() => {
        setSemanaActual(0);
        cargarSemanas();
      });
    }
  };

  const copiarSemana = (semanaId?: number) => {
    if (!semanaId) return;
    semanaPlanService.copiar(semanaId).then(() => cargarSemanas());
  };

  const abrirEditarSemana = (semana: SemanaPlan) => {
    setSemanaEditando({ ...semana });
    setDialogEditarSemana(true);
  };

  const guardarEditarSemana = () => {
    if (!semanaEditando || !semanaEditando.id) return;
    semanaPlanService.update(semanaEditando.id, semanaEditando).then(() => {
      cargarSemanas();
      setDialogEditarSemana(false);
    });
  };

  const agregarDia = () => {
    if (!semanaSeleccionada || !semanaSeleccionada.id) return;
    const nuevoDia: Partial<DiaPlan> = {
      semanaPlan: { id: semanaSeleccionada.id },
      diaSemana: diaForm,
    };
    diaPlanService.create(nuevoDia).then(() => {
      if (semanaSeleccionada.id) cargarDias(semanaSeleccionada.id);
      setDialogDia(false);
    }).catch((err) => {
      alert(err.response?.data?.error || 'No se pudo agregar el día de entrenamiento.');
    });
  };

  const eliminarDia = (diaId?: number, semanaId?: number) => {
    if (!diaId || !semanaId) return;
    if (window.confirm('¿Eliminar este día y sus ejercicios?')) {
      diaPlanService.delete(diaId).then(() => cargarDias(semanaId));
    }
  };

  const guardarNuevoEjercicio = (diaId: number) => {
    const fila = nuevaFilaPorDia[diaId];
    if (!fila?.ejercicioId) return;
    const nuevoEjercicio: Partial<EjercicioPlanificado> = {
      diaPlan: { id: diaId },
      ejercicio: { id: fila.ejercicioId } as Ejercicio,
      circuito: fila.circuito || undefined,
      series: parseInt(String(fila.series)) || 0,
      repeticiones: parseInt(String(fila.repeticiones)) || 0,
      rir: fila.rir || undefined,
      notas: fila.notas || '',
      orden: (ejerciciosPorDia[diaId]?.length || 0) + 1,
    };
    ejercicioPlanificadoService.create(nuevoEjercicio).then(() => {
      cargarEjercicios(diaId);
      setNuevaFilaPorDia(prev => ({ ...prev, [diaId]: null }));
    }).catch((err) => {
      alert(err.response?.data?.error || 'No se pudo agregar el ejercicio.');
    });
  };

  const eliminarEjercicio = (ejercicioId?: number, diaId?: number) => {
    if (!ejercicioId || !diaId) return;
    ejercicioPlanificadoService.delete(ejercicioId).then(() => cargarEjercicios(diaId));
  };

  const abrirEditarEjercicio = (ep: EjercicioPlanificado) => {
    setEjercicioEditando({ ...ep });
    setDialogEditarEjercicio(true);
  };

  const guardarEditarEjercicio = () => {
    if (!ejercicioEditando || !ejercicioEditando.id || !ejercicioEditando.diaPlan?.id) return;
    ejercicioPlanificadoService.update(ejercicioEditando.id, ejercicioEditando).then(() => {
      if (ejercicioEditando.diaPlan?.id) cargarEjercicios(ejercicioEditando.diaPlan.id);
      setDialogEditarEjercicio(false);
    }).catch((err) => {
      alert(err.response?.data?.error || 'No se pudo editar el ejercicio.');
    });
  };

  const semanaVisible = semanas[semanaActual];

  if (!plan) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
        <CircularProgress color="primary" size={44} thickness={4} />
        <Typography variant="body2" color="text.secondary">Cargando planificación...</Typography>
      </Box>
    );
  }

  const estadoStyles: Record<EstadoPlanificacion, { bg: string; text: string; border: string; label: string }> = {
    BORRADOR: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0', label: 'Borrador' },
    ENVIADA: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'Enviada' },
    ARCHIVADA: { bg: '#fef3c7', text: '#b45309', border: '#fde68a', label: 'Archivada' },
  };
  const st = estadoStyles[plan.estado] || estadoStyles.BORRADOR;

  return (
    <Box>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3.5, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate('/planificaciones')}
              sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {plan.nombre}
                </Typography>
                <Chip
                  label={st.label}
                  size="small"
                  sx={{ bgcolor: st.bg, color: st.text, border: `1px solid ${st.border}`, fontWeight: 700 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Atleta: <strong>{plan.alumno?.nombre} {plan.alumno?.apellido}</strong> ({plan.alumno?.email || 'Sin email'}) — Vigencia: {plan.fechaInicio || '—'} {plan.fechaFin ? `al ${plan.fechaFin}` : ''}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                if (!id) return;
                planificacionService.enviar(id)
                  .then(() => alert('✅ Planificación enviada por mail en formato PDF'))
                  .catch(() => alert('❌ Error al enviar el mail'));
              }}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              Enviar por mail
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={agregarSemana}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              Agregar semana
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Bloques Fijos */}
      {id && (
        <>
          <BloqueFijo
            planificacionId={id}
            tipoBloque="MOVILIDAD"
            titulo="Bloque de Movilidad y Calentamiento"
            catalogoEjercicios={catalogoEjercicios}
            patronFiltro="MOVILIDAD"
          />
          <BloqueFijo
            planificacionId={id}
            tipoBloque="ACTIVACION"
            titulo="Bloque de Activación y Core"
            catalogoEjercicios={catalogoEjercicios}
          />
        </>
      )}

      {semanas.length === 0 && (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            No hay semanas creadas todavía
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comenzá agregando la Semana 1 para estructurar los días de entrenamiento.
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={agregarSemana}>
            Agregar primera semana
          </Button>
        </Paper>
      )}

      {semanas.length > 0 && (
        <>
          {/* Tabs de semanas */}
          <Paper elevation={1} sx={{ p: 1.5, mb: 3.5, borderRadius: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
            <Tabs
              value={semanaActual}
              onChange={(_, v) => setSemanaActual(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5, bgcolor: '#16a34a' },
                '& .MuiTab-root': { fontWeight: 700, fontSize: '0.875rem', textTransform: 'none', color: '#64748b', '&.Mui-selected': { color: '#16a34a' } }
              }}
            >
              {semanas.map((s) => (
                <Tab key={s.id} label={`Semana ${s.numeroSemana}`} />
              ))}
            </Tabs>

            {semanaVisible && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 1 }}>
                <Tooltip title="Editar notas de semana">
                  <IconButton size="small" onClick={() => abrirEditarSemana(semanaVisible)} sx={{ color: '#0284c7', bgcolor: '#f1f5f9' }}>
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Duplicar semana">
                  <IconButton size="small" onClick={() => copiarSemana(semanaVisible.id)} sx={{ color: '#16a34a', bgcolor: '#f1f5f9' }}>
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar semana">
                  <IconButton size="small" color="error" onClick={() => eliminarSemana(semanaVisible.id)} sx={{ bgcolor: '#fef2f2' }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => { setSemanaSeleccionada(semanaVisible); setDiaForm(DIAS[0]); setDialogDia(true); }}
                  sx={{ ml: 1, fontWeight: 700 }}
                >
                  Agregar día
                </Button>
              </Box>
            )}
          </Paper>

          {/* Días de la semana visible */}
          {(semanaVisible?.id ? (dias[semanaVisible.id] || []) : []).map((dia) => (
            <Paper key={dia.id} elevation={1} sx={{ mb: 3.5, borderRadius: 3, overflow: 'hidden' }}>
              {/* Header día */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2.5,
                  py: 1.8,
                  bgcolor: '#f8fafc',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {dia.diaSemana}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip
                    label={`${dia.id ? (ejerciciosPorDia[dia.id] || []).length : 0} ejercicios`}
                    size="small"
                    sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '0.725rem' }}
                  />
                  <Tooltip title="Eliminar Día">
                    <IconButton size="small" color="error" onClick={() => eliminarDia(dia.id, semanaVisible?.id)}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Tabla de ejercicios */}
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#ffffff' }}>
                    <TableCell sx={{ width: 40, color: '#64748b', fontWeight: 700, fontSize: 11 }}>#</TableCell>
                    <TableCell sx={{ width: 90, color: '#64748b', fontWeight: 700, fontSize: 11 }}>CIRCUITO</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 700, fontSize: 11 }}>EJERCICIO</TableCell>
                    <TableCell sx={{ width: 90, color: '#64748b', fontWeight: 700, fontSize: 11 }}>SERIES</TableCell>
                    <TableCell sx={{ width: 90, color: '#64748b', fontWeight: 700, fontSize: 11 }}>REPS</TableCell>
                    <TableCell sx={{ width: 90, color: '#64748b', fontWeight: 700, fontSize: 11 }}>RIR</TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 700, fontSize: 11 }}>NOTAS / PESO</TableCell>
                    <TableCell sx={{ width: 90, textAlign: 'right' }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dia.id ? (ejerciciosPorDia[dia.id] || []) : []).map((ep) => (
                    <TableRow key={ep.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{ep.orden}</TableCell>
                      <TableCell>
                        {ep.circuito ? (
                          <Chip
                            label={ep.circuito}
                            size="small"
                            sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 11 }}
                          />
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        {ep.ejercicio?.nombre}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{ep.series}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{ep.repeticiones}</TableCell>
                      <TableCell>
                        {ep.rir ? (
                          <Chip
                            label={`RIR ${ep.rir}`}
                            size="small"
                            sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: 11 }}
                          />
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: 13 }}>{ep.notas || '—'}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => abrirEditarEjercicio(ep)} sx={{ color: '#0284c7', mr: 0.5 }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" color="error" onClick={() => eliminarEjercicio(ep.id, dia.id)}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fila nueva inline */}
                  {dia.id && nuevaFilaPorDia[dia.id] && (
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>
                        {(ejerciciosPorDia[dia.id]?.length || 0) + 1}
                      </TableCell>
                      <TableCell>
                        <InputBase
                          size="small"
                          placeholder="ej: CF1"
                          sx={{ width: 70, fontSize: 13, borderBottom: '1px solid #cbd5e1' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (dia.id) {
                              setNuevaFilaPorDia(prev => ({
                                ...prev, [dia.id as number]: { ...prev[dia.id as number], circuito: val }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={catalogoEjercicios}
                          getOptionLabel={(e) => `${e.nombre}`}
                          filterOptions={(options, { inputValue }) => {
                            if (inputValue.length < 2) return options.slice(0, 20);
                            const input = inputValue.toLowerCase();
                            return options.filter(o => o.nombre.toLowerCase().includes(input));
                          }}
                          onChange={(_, newValue) => {
                            if (dia.id) {
                              setNuevaFilaPorDia(prev => ({
                                ...prev, [dia.id as number]: { ...prev[dia.id as number], ejercicioId: newValue?.id }
                              }));
                            }
                          }}
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Buscar ejercicio..." variant="standard" size="small" />
                          )}
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>
                      <TableCell>
                        <InputBase
                          size="small"
                          placeholder="Series"
                          sx={{ width: 60, fontSize: 13, borderBottom: '1px solid #cbd5e1' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (dia.id) {
                              setNuevaFilaPorDia(prev => ({
                                ...prev, [dia.id as number]: { ...prev[dia.id as number], series: val }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <InputBase
                          size="small"
                          placeholder="Reps"
                          sx={{ width: 60, fontSize: 13, borderBottom: '1px solid #cbd5e1' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (dia.id) {
                              setNuevaFilaPorDia(prev => ({
                                ...prev, [dia.id as number]: { ...prev[dia.id as number], repeticiones: val }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <InputBase
                          size="small"
                          placeholder="RIR"
                          sx={{ width: 60, fontSize: 13, borderBottom: '1px solid #cbd5e1' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (dia.id) {
                              setNuevaFilaPorDia(prev => ({
                                ...prev, [dia.id as number]: { ...prev[dia.id as number], rir: val }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <InputBase
                          size="small"
                          placeholder="Notas o peso..."
                          sx={{ fontSize: 13, width: '100%', borderBottom: '1px solid #16a34a' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (dia.id) {
                              setNuevaFilaPorDia(prev => ({
                                ...prev, [dia.id as number]: { ...prev[dia.id as number], notas: val }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => dia.id && guardarNuevoEjercicio(dia.id)}
                          sx={{ py: 0.4, px: 1.5, fontSize: '0.75rem' }}
                        >
                          Guardar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Botón agregar ejercicio */}
              {dia.id && (
                <Box
                  onClick={() => setNuevaFilaPorDia(prev => ({ ...prev, [dia.id as number]: {} }))}
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
                  <AddIcon sx={{ fontSize: 16 }} /> Agregar ejercicio a este día
                </Box>
              )}
            </Paper>
          ))}

          {semanaVisible?.id && (dias[semanaVisible.id] || []).length === 0 && (
            <Paper elevation={1} sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                No hay días cargados en esta semana
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => { setSemanaSeleccionada(semanaVisible); setDiaForm(DIAS[0]); setDialogDia(true); }}
                sx={{ fontWeight: 700 }}
              >
                Agregar primer día
              </Button>
            </Paper>
          )}
        </>
      )}

      {/* Dialog editar semana */}
      <Dialog
        open={dialogEditarSemana}
        onClose={() => setDialogEditarSemana(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Editar Semana
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Número de semana"
              type="number"
              value={semanaEditando?.numeroSemana || ''}
              onChange={(e) => setSemanaEditando(prev => prev ? ({ ...prev, numeroSemana: e.target.value }) : null)}
            />
            <TextField
              fullWidth
              size="small"
              label="Notas y objetivos de la semana"
              multiline
              rows={3}
              value={semanaEditando?.notas || ''}
              onChange={(e) => setSemanaEditando(prev => prev ? ({ ...prev, notas: e.target.value }) : null)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setDialogEditarSemana(false)} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={guardarEditarSemana} sx={{ fontWeight: 700 }}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog agregar día */}
      <Dialog
        open={dialogDia}
        onClose={() => setDialogDia(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Agregar Día de Entrenamiento
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Día de la semana"
            value={diaForm}
            onChange={(e) => setDiaForm(e.target.value)}
          >
            {DIAS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setDialogDia(false)} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={agregarDia} sx={{ fontWeight: 700 }}>Agregar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog editar ejercicio */}
      <Dialog
        open={dialogEditarEjercicio}
        onClose={() => setDialogEditarEjercicio(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Editar Ejercicio
          </Typography>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
            {ejercicioEditando?.ejercicio?.nombre}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Circuito / Bloque"
              placeholder="ej: CF1"
              value={ejercicioEditando?.circuito || ''}
              onChange={(e) => setEjercicioEditando(prev => prev ? ({ ...prev, circuito: e.target.value }) : null)}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Series"
                type="number"
                value={ejercicioEditando?.series || ''}
                onChange={(e) => setEjercicioEditando(prev => prev ? ({ ...prev, series: e.target.value }) : null)}
              />
              <TextField
                fullWidth
                size="small"
                label="Repeticiones"
                type="number"
                value={ejercicioEditando?.repeticiones || ''}
                onChange={(e) => setEjercicioEditando(prev => prev ? ({ ...prev, repeticiones: e.target.value }) : null)}
              />
              <TextField
                fullWidth
                size="small"
                label="RIR"
                placeholder="ej: 1-2"
                value={ejercicioEditando?.rir || ''}
                onChange={(e) => setEjercicioEditando(prev => prev ? ({ ...prev, rir: e.target.value }) : null)}
              />
            </Box>
            <TextField
              fullWidth
              size="small"
              label="Notas o peso sugerido"
              multiline
              rows={2}
              value={ejercicioEditando?.notas || ''}
              onChange={(e) => setEjercicioEditando(prev => prev ? ({ ...prev, notas: e.target.value }) : null)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setDialogEditarEjercicio(false)} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={guardarEditarEjercicio} sx={{ fontWeight: 700 }}>Guardar cambios</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetallePlanificacion;
