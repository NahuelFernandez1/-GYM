import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Paper, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, InputBase, CircularProgress, Stack, Divider, Tooltip,
  Snackbar, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Autocomplete from '@mui/material/Autocomplete';
import {
  planificacionService, diaPlanService, ejercicioPlanificadoService, ejercicioService
} from '../services/api';
import BloqueFijo from '../components/BloqueFijo';
import {
  Planificacion, DiaPlan, EjercicioPlanificado, Ejercicio, EstadoPlanificacion, PrescripcionSemanal
} from '../types';

const DIAS = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];
const MAX_SEMANAS = 5;

// Valores de una semana tal como se tipean en la pantalla.
interface ValoresSemana {
  series?: string | number | null;
  reps?: string | null;
  rir?: string | null;
  notasPeso?: string | null;
}

interface FilaDraftPorDia extends ValoresSemana {
  ejercicioId?: number;
  circuito?: string | null;
}

const prescripcionDe = (ep: EjercicioPlanificado, semana: number): PrescripcionSemanal | undefined =>
  ep.prescripciones?.find(p => p.numeroSemana === semana);

const aPrescripcion = (semana: number, v: ValoresSemana): PrescripcionSemanal => {
  const series = parseInt(String(v.series ?? ''));
  return {
    numeroSemana: semana,
    series: isNaN(series) ? null : series,
    reps: v.reps?.trim() || null,
    rir: v.rir?.trim() || null,
    notasPeso: v.notasPeso?.trim() || null,
  };
};

const DetallePlanificacion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Planificacion | null>(null);
  // Indice de la pestaña: la semana visible es semanaActual + 1.
  const [semanaActual, setSemanaActual] = useState(0);
  const [dias, setDias] = useState<DiaPlan[]>([]);
  const [ejerciciosPorDia, setEjerciciosPorDia] = useState<Record<number, EjercicioPlanificado[]>>({});
  const [catalogoEjercicios, setCatalogoEjercicios] = useState<Ejercicio[]>([]);

  const [dialogDia, setDialogDia] = useState(false);
  const [diaForm, setDiaForm] = useState(DIAS[0]);

  const [dialogEditarEjercicio, setDialogEditarEjercicio] = useState(false);
  const [ejercicioEditando, setEjercicioEditando] = useState<EjercicioPlanificado | null>(null);
  const [edicionForm, setEdicionForm] = useState<FilaDraftPorDia>({});

  // Fila nueva inline por día
  const [nuevaFilaPorDia, setNuevaFilaPorDia] = useState<Record<number, FilaDraftPorDia | null>>({});

  const [guardando, setGuardando] = useState(false);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; mensaje: string; tipo: 'success' | 'error' | 'warning' }>({
    open: false,
    mensaje: '',
    tipo: 'success',
  });

  const cantidadSemanas = plan?.cantidadSemanas || 1;
  const semana = Math.min(semanaActual, cantidadSemanas - 1) + 1;

  useEffect(() => {
    if (id) {
      planificacionService.getById(id).then(res => setPlan(res.data)).catch(() => {
        setSnackbar({ open: true, mensaje: 'No se pudo cargar la planificación.', tipo: 'error' });
      });
      cargarDias();
      ejercicioService.getAll().then(res => setCatalogoEjercicios(res.data)).catch(() => {
        setSnackbar({ open: true, mensaje: 'No se pudo cargar el catálogo de ejercicios.', tipo: 'error' });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarDias = () => {
    if (!id) return;
    diaPlanService.getByPlanificacion(id).then(res => {
      setDias(res.data);
      res.data.forEach(d => {
        if (d.id) cargarEjercicios(d.id);
      });
    }).catch(() => {
      setSnackbar({ open: true, mensaje: 'No se pudieron cargar los días.', tipo: 'error' });
    });
  };

  const cargarEjercicios = (diaId: number) => {
    ejercicioPlanificadoService.getByDia(diaId).then(res => {
      setEjerciciosPorDia(prev => ({ ...prev, [diaId]: res.data }));
    }).catch(() => {
      setSnackbar({ open: true, mensaje: 'No se pudieron cargar los ejercicios.', tipo: 'error' });
    });
  };

  const actualizarCantidadSemanas = (cantidad?: number) => {
    setPlan(prev => prev ? { ...prev, cantidadSemanas: cantidad } : prev);
  };

  // Agrega una semana al final con los mismos valores que la ultima.
  const agregarSemana = () => {
    if (!id) return;
    setCambiosSinGuardar(true);
    planificacionService.agregarSemana(id).then((res) => {
      actualizarCantidadSemanas(res.data.cantidadSemanas);
      setSemanaActual((res.data.cantidadSemanas || 1) - 1);
      cargarDias();
    }).catch((err) => {
      setSnackbar({ open: true, mensaje: err.response?.data?.error || 'No se pudo agregar la semana.', tipo: 'error' });
    });
  };

  const guardarPlan = () => {
    if (!id || !plan) return;
    setGuardando(true);
    planificacionService.update(id, plan)
      .then((res) => {
        setPlan(res.data);
        setCambiosSinGuardar(false);
        setSnackbar({ open: true, mensaje: 'Plan guardado correctamente', tipo: 'success' });
      })
      .catch(() => {
        setSnackbar({ open: true, mensaje: 'No se pudo guardar el plan', tipo: 'error' });
      })
      .finally(() => setGuardando(false));
  };

  const enviarPorMail = () => {
    if (!id) return;
    if (cambiosSinGuardar) {
      setSnackbar({ open: true, mensaje: 'Debés guardar el plan antes de enviarlo por mail', tipo: 'warning' });
      return;
    }
    planificacionService.enviar(id)
      .then(() => setSnackbar({ open: true, mensaje: 'Planificación enviada por mail en formato PDF', tipo: 'success' }))
      .catch((err) => setSnackbar({ open: true, mensaje: err.response?.data || 'No se pudo enviar el mail.', tipo: 'error' }));
  };

  const eliminarSemana = (numero: number) => {
    if (!id) return;
    const aviso = numero < cantidadSemanas
      ? `¿Eliminar la Semana ${numero}? Las semanas siguientes se corren un lugar.`
      : `¿Eliminar la Semana ${numero}?`;
    if (window.confirm(aviso)) {
      setCambiosSinGuardar(true);
      planificacionService.eliminarSemana(id, numero).then((res) => {
        actualizarCantidadSemanas(res.data.cantidadSemanas);
        setSemanaActual(prev => Math.min(prev, (res.data.cantidadSemanas || 1) - 1));
        cargarDias();
      }).catch((err) => {
        setSnackbar({ open: true, mensaje: err.response?.data?.error || 'No se pudo eliminar la semana.', tipo: 'error' });
      });
    }
  };

  const agregarDia = () => {
    if (!id) return;
    const nuevoDia: Partial<DiaPlan> = {
      planificacion: { id: parseInt(id) },
      diaSemana: diaForm,
    };
    setCambiosSinGuardar(true);
    diaPlanService.create(nuevoDia).then(() => {
      cargarDias();
      setDialogDia(false);
    }).catch((err) => {
      alert(err.response?.data?.error || 'No se pudo agregar el día de entrenamiento.');
    });
  };

  const eliminarDia = (diaId?: number) => {
    if (!diaId) return;
    if (window.confirm('¿Eliminar este día y sus ejercicios? Se borra de todas las semanas.')) {
      setCambiosSinGuardar(true);
      diaPlanService.delete(diaId).then(() => cargarDias()).catch((err) => {
        setSnackbar({ open: true, mensaje: err.response?.data?.error || 'No se pudo eliminar el día.', tipo: 'error' });
      });
    }
  };

  // Se carga para la semana visible; el backend copia esos valores al resto de las semanas.
  const guardarNuevoEjercicio = (diaId: number) => {
    const fila = nuevaFilaPorDia[diaId];
    if (!fila?.ejercicioId) return;
    const prescripcion = aPrescripcion(semana, fila);
    if (prescripcion.series === null || !prescripcion.reps) {
      setSnackbar({ open: true, mensaje: 'Cargá series y repeticiones.', tipo: 'warning' });
      return;
    }
    const nuevoEjercicio: Partial<EjercicioPlanificado> = {
      diaPlan: { id: diaId },
      ejercicio: { id: fila.ejercicioId } as Ejercicio,
      circuito: fila.circuito || undefined,
      prescripciones: [prescripcion],
    };
    setCambiosSinGuardar(true);
    ejercicioPlanificadoService.create(nuevoEjercicio).then(() => {
      cargarEjercicios(diaId);
      setNuevaFilaPorDia(prev => ({ ...prev, [diaId]: null }));
    }).catch((err) => {
      alert(err.response?.data?.error || 'No se pudo agregar el ejercicio.');
    });
  };

  const eliminarEjercicio = (ejercicioId?: number, diaId?: number) => {
    if (!ejercicioId || !diaId) return;
    setCambiosSinGuardar(true);
    ejercicioPlanificadoService.delete(ejercicioId).then(() => cargarEjercicios(diaId)).catch((err) => {
      setSnackbar({ open: true, mensaje: err.response?.data?.error || 'No se pudo eliminar el ejercicio.', tipo: 'error' });
    });
  };

  const abrirEditarEjercicio = (ep: EjercicioPlanificado) => {
    const p = prescripcionDe(ep, semana);
    setEjercicioEditando(ep);
    setEdicionForm({
      circuito: ep.circuito || '',
      series: p?.series ?? '',
      reps: p?.reps || '',
      rir: p?.rir || '',
      notasPeso: p?.notasPeso || '',
    });
    setDialogEditarEjercicio(true);
  };

  // Cambia el circuito (vale para todas las semanas) y los valores de la semana visible.
  const guardarEditarEjercicio = () => {
    if (!ejercicioEditando || !ejercicioEditando.id || !ejercicioEditando.diaPlan?.id) return;
    const diaId = ejercicioEditando.diaPlan.id;
    setCambiosSinGuardar(true);
    ejercicioPlanificadoService.update(ejercicioEditando.id, {
      circuito: edicionForm.circuito || null,
      prescripciones: [aPrescripcion(semana, edicionForm)],
    }).then(() => {
      cargarEjercicios(diaId);
      setDialogEditarEjercicio(false);
    }).catch((err) => {
      alert(err.response?.data?.error || 'No se pudo editar el ejercicio.');
    });
  };

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
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
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
              onClick={guardarPlan}
              disabled={guardando}
              startIcon={guardando ? <CircularProgress size={16} /> : <SaveIcon />}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              Guardar
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={enviarPorMail}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              Enviar por mail
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={agregarSemana}
              disabled={cantidadSemanas >= MAX_SEMANAS}
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
            onChange={() => setCambiosSinGuardar(true)}
          />
          <BloqueFijo
            planificacionId={id}
            tipoBloque="ACTIVACION"
            titulo="Bloque de Activación y Core"
            catalogoEjercicios={catalogoEjercicios}
            onChange={() => setCambiosSinGuardar(true)}
          />
        </>
      )}

      {/* Tabs de semanas */}
      <Paper elevation={1} sx={{ p: 1.5, mb: 3.5, borderRadius: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Tabs
            value={semana - 1}
            onChange={(_, v) => { setSemanaActual(v); setNuevaFilaPorDia({}); }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5, bgcolor: '#16a34a' },
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.875rem', textTransform: 'none', color: '#64748b', '&.Mui-selected': { color: '#16a34a' } }
            }}
          >
            {Array.from({ length: cantidadSemanas }, (_, i) => (
              <Tab key={i} label={`Semana ${i + 1}`} />
            ))}
          </Tabs>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, pt: 0.5 }}>
            Los días y ejercicios son los mismos todas las semanas. Series, reps, RIR y notas se cargan por semana.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 1, flexWrap: 'wrap' }}>
          <Tooltip title={cantidadSemanas > 1 ? `Eliminar Semana ${semana}` : 'El plan necesita al menos una semana'}>
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={cantidadSemanas <= 1}
                onClick={() => eliminarSemana(semana)}
                sx={{ bgcolor: '#fef2f2' }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => { setDiaForm(DIAS[0]); setDialogDia(true); }}
            sx={{ ml: 1, fontWeight: 700 }}
          >
            Agregar día
          </Button>
        </Box>
      </Paper>

      {/* Días del plan (los mismos en todas las semanas) */}
          {dias.map((dia) => (
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
                    <IconButton size="small" color="error" onClick={() => eliminarDia(dia.id)}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Tabla de ejercicios */}
              <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 640 }}>
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
                  {(dia.id ? (ejerciciosPorDia[dia.id] || []) : []).map((ep) => {
                    const p = prescripcionDe(ep, semana);
                    return (
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
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{p?.series ?? '—'}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{p?.reps || '—'}</TableCell>
                      <TableCell>
                        {p?.rir ? (
                          <Chip
                            label={`RIR ${p.rir}`}
                            size="small"
                            sx={{ bgcolor: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: 11 }}
                          />
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: 13 }}>{p?.notasPeso || '—'}</TableCell>
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
                    );
                  })}

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
                          value={nuevaFilaPorDia[dia.id]?.circuito || ''}
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
                          value={nuevaFilaPorDia[dia.id]?.series ?? ''}
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
                          value={nuevaFilaPorDia[dia.id]?.reps ?? ''}
                          sx={{ width: 60, fontSize: 13, borderBottom: '1px solid #cbd5e1' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (dia.id) {
                              setNuevaFilaPorDia(prev => ({
                                ...prev, [dia.id as number]: { ...prev[dia.id as number], reps: val }
                              }));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <InputBase
                          size="small"
                          placeholder="RIR"
                          value={nuevaFilaPorDia[dia.id]?.rir ?? ''}
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
                          value={nuevaFilaPorDia[dia.id]?.notasPeso ?? ''}
                          sx={{ fontSize: 13, width: '100%', borderBottom: '1px solid #16a34a' }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (dia.id) {
                              setNuevaFilaPorDia(prev => ({
                                ...prev, [dia.id as number]: { ...prev[dia.id as number], notasPeso: val }
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
              </TableContainer>

              {/* Botón agregar ejercicio */}
              {dia.id && (
                <Box
                  onClick={() => {
                    const idDia = dia.id as number;
                    const ejerciciosDelDia = ejerciciosPorDia[idDia] || [];
                    const ultimo = ejerciciosDelDia[ejerciciosDelDia.length - 1];
                    setNuevaFilaPorDia(prev => ({
                      ...prev,
                      [idDia]: { circuito: ultimo?.circuito, series: ultimo ? prescripcionDe(ultimo, semana)?.series : undefined },
                    }));
                  }}
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

          {dias.length === 0 && (
            <Paper elevation={1} sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                No hay días cargados todavía
              </Typography>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => { setDiaForm(DIAS[0]); setDialogDia(true); }}
                sx={{ fontWeight: 700 }}
              >
                Agregar primer día
              </Button>
            </Paper>
          )}

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
            {ejercicioEditando?.ejercicio?.nombre} — Semana {semana}
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
              helperText="El circuito vale para todas las semanas."
              value={edicionForm.circuito || ''}
              onChange={(e) => setEdicionForm(prev => ({ ...prev, circuito: e.target.value }))}
            />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Series"
                type="number"
                value={edicionForm.series ?? ''}
                onChange={(e) => setEdicionForm(prev => ({ ...prev, series: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                label="Repeticiones"
                placeholder="ej: 8 o 4-6"
                value={edicionForm.reps || ''}
                onChange={(e) => setEdicionForm(prev => ({ ...prev, reps: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                label="RIR"
                placeholder="ej: 1-2"
                value={edicionForm.rir || ''}
                onChange={(e) => setEdicionForm(prev => ({ ...prev, rir: e.target.value }))}
              />
            </Box>
            <TextField
              fullWidth
              size="small"
              label="Notas o peso sugerido"
              multiline
              rows={2}
              value={edicionForm.notasPeso || ''}
              onChange={(e) => setEdicionForm(prev => ({ ...prev, notasPeso: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setDialogEditarEjercicio(false)} sx={{ color: '#64748b' }}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={guardarEditarEjercicio} sx={{ fontWeight: 700 }}>Guardar cambios</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.tipo}
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          {snackbar.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DetallePlanificacion;
