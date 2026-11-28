import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Paper, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, CircularProgress, Divider, Tooltip,
  Snackbar, Alert, useMediaQuery, useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import {
  planificacionService, diaPlanService, ejercicioPlanificadoService, ejercicioService, ejercicioFijoPlanService
} from '../services/api';
import BloqueFijo from '../components/BloqueFijo';
import {
  Planificacion, DiaPlan, EjercicioPlanificado, Ejercicio, EstadoPlanificacion,
  PrescripcionSemanal, PatronMovimiento, EjercicioFijoPlan, ContenidoPlan
} from '../types';
import { formatearFecha } from '../utils/fechas';
import { confirmarSalida, registrarCambiosSinGuardar } from '../utils/salidaSinGuardar';
import { confirmar } from '../components/DialogosGlobales';

const DIAS = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];
const CIRCUITOS = ['CF1', 'CF2', 'CF3', 'CF4', 'CF5', 'CF6', 'CF'];
const PATRONES: PatronMovimiento[] = ['EMPUJE', 'TRACCION', 'CADERA', 'RODILLA', 'CORE', 'MOVILIDAD'];

// Una fila de la grilla "Progresión por semana", tal como se tipea.
interface FilaSemana {
  series: string;
  reps: string;
  rir: string;
  notasPeso: string;
}

// Opcion del buscador: un ejercicio del catalogo o "+ Crear ejercicio «texto»".
type OpcionEjercicio = Ejercicio & { crear?: boolean };

interface Modal {
  ep: EjercicioPlanificado | null; // null = agregar
  esCopia?: boolean; // agregar, pero arrancando con los datos de otro ejercicio
  origenId?: number; // ejercicio copiado: la copia queda justo debajo
  diaId: number;
  semanaFoco: number | null;
  ejercicio: OpcionEjercicio | null;
  patronNuevo: PatronMovimiento | '';
  circuito: string;
  filas: FilaSemana[];
  error: string;
}

// Botones del encabezado: solo icono, con fondo suave del color de cada accion.
const botonIcono = (color: string, fondo: string, borde: string) => ({
  width: 46,
  height: 46,
  borderRadius: '14px',
  color,
  bgcolor: fondo,
  border: `1px solid ${borde}`,
  transition: 'all 0.18s ease',
  '& svg': { fontSize: 22 },
  '&:hover': {
    bgcolor: color,
    color: '#ffffff',
    borderColor: color,
    transform: 'translateY(-1px)',
    boxShadow: `0 6px 16px ${borde}`,
  },
  '&.Mui-disabled': { opacity: 0.6, color, bgcolor: fondo },
});

// Lo nuevo (días, ejercicios) usa ids negativos hasta que se guarda el plan.
let ultimoIdTemporal = 0;
const idTemporal = () => --ultimoIdTemporal;

const filaVacia = (): FilaSemana => ({ series: '', reps: '', rir: '', notasPeso: '' });

const texto = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const filtroBase = createFilterOptions<OpcionEjercicio>({ stringify: (o) => sinTildes(o.nombre) });

const prescripcion = (ep: EjercicioPlanificado, semana: number): PrescripcionSemanal | undefined =>
  ep.prescripciones?.find(p => p.numeroSemana === semana);

// Muestra el valor en verde si cambio respecto de la semana anterior.
const Marca: React.FC<{ valor: string; anterior?: string; comparar: boolean }> = ({ valor, anterior, comparar }) =>
  comparar && valor !== (anterior ?? '')
    ? <Box component="span" sx={{ bgcolor: '#dcfce7', color: '#15803d', borderRadius: 0.5, px: 0.4, fontWeight: 700 }}>{valor || '—'}</Box>
    : <>{valor}</>;

// Contenido de una celda: arriba "series × reps", abajo "RIR x · notas".
const Celda: React.FC<{ ep: EjercicioPlanificado; semana: number }> = ({ ep, semana }) => {
  const a = prescripcion(ep, semana);
  const b = semana > 1 ? prescripcion(ep, semana - 1) : undefined;
  const comparar = semana > 1;
  const series = texto(a?.series), reps = texto(a?.reps), rir = texto(a?.rir), notas = texto(a?.notasPeso);
  if (!series && !reps) return <Typography component="span" sx={{ color: '#94a3b8' }}>—</Typography>;
  const rirAnterior = texto(b?.rir);
  const muestraRir = !!rir || (comparar && !!rirAnterior);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      <Typography component="span" sx={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
        <Marca valor={series} anterior={texto(b?.series)} comparar={comparar} />
        {' × '}
        <Marca valor={reps} anterior={texto(b?.reps)} comparar={comparar} />
      </Typography>
      <Typography component="span" sx={{ color: '#64748b', fontSize: 12, minHeight: 16 }}>
        {rir
          ? <>RIR <Marca valor={rir} anterior={rirAnterior} comparar={comparar} /></>
          : (comparar && rirAnterior ? <Marca valor="sin RIR" anterior="" comparar /> : null)}
        {notas && <>{muestraRir ? ' · ' : ''}<Marca valor={notas} anterior={texto(b?.notasPeso)} comparar={comparar} /></>}
      </Typography>
    </Box>
  );
};

const DetallePlanificacion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const esCelular = useMediaQuery(theme.breakpoints.down('md'));

  const [plan, setPlan] = useState<Planificacion | null>(null);
  const [dias, setDias] = useState<DiaPlan[]>([]);
  const [diaActual, setDiaActual] = useState(0);
  const [ejerciciosPorDia, setEjerciciosPorDia] = useState<Record<number, EjercicioPlanificado[]>>({});
  const [catalogoEjercicios, setCatalogoEjercicios] = useState<Ejercicio[]>([]);

  const [modal, setModal] = useState<Modal | null>(null);
  const [guardandoEjercicio, setGuardandoEjercicio] = useState(false);
  // Ultimo ejercicio eliminado y en que posicion estaba, para "Deshacer".
  const [eliminado, setEliminado] = useState<{ ep: EjercicioPlanificado; diaId: number; posicion: number } | null>(null);
  const [fijos, setFijos] = useState<EjercicioFijoPlan[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; mensaje: string; tipo: 'success' | 'error' | 'warning' }>({
    open: false,
    mensaje: '',
    tipo: 'success',
  });

  const cantidadSemanas = plan?.cantidadSemanas || 1;
  const semanas = Array.from({ length: cantidadSemanas }, (_, i) => i + 1);
  const dia = dias[Math.min(diaActual, dias.length - 1)];
  const ejerciciosDia = dia?.id ? (ejerciciosPorDia[dia.id] || []) : [];

  const avisar = (mensaje: string, tipo: 'success' | 'error' | 'warning' = 'error') =>
    setSnackbar({ open: true, mensaje, tipo });

  useEffect(() => {
    if (id) {
      planificacionService.getById(id).then(res => setPlan(res.data)).catch(() => {
        avisar('No se pudo cargar la planificación.');
      });
      cargarContenido();
      ejercicioService.getAll().then(res => setCatalogoEjercicios(res.data)).catch(() => {
        avisar('No se pudo cargar el catálogo de ejercicios.');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Cuando hay cambios sin guardar: avisa al cerrar/recargar la pestaña y deja
  // registrado el aviso para el menú lateral (ver utils/salidaSinGuardar).
  useEffect(() => {
    registrarCambiosSinGuardar(cambiosSinGuardar);
    if (!cambiosSinGuardar) return;
    const alSalir = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', alSalir);
    return () => window.removeEventListener('beforeunload', alSalir);
  }, [cambiosSinGuardar]);

  useEffect(() => () => registrarCambiosSinGuardar(false), []);

  // Trae de la base los días (con sus ejercicios) y los bloques fijos. Lo que se
  // edita después queda solo en pantalla hasta tocar "Guardar".
  const cargarContenido = async () => {
    if (!id) return;
    try {
      const [resDias, resFijos] = await Promise.all([
        diaPlanService.getByPlanificacion(id),
        ejercicioFijoPlanService.getByPlanificacion(id),
      ]);
      const porDia: Record<number, EjercicioPlanificado[]> = {};
      await Promise.all(resDias.data.map(async d => {
        if (!d.id) return;
        porDia[d.id] = (await ejercicioPlanificadoService.getByDia(d.id)).data;
      }));
      setDias(resDias.data);
      setEjerciciosPorDia(porDia);
      setFijos([...resFijos.data].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
      setDiaActual(prev => Math.max(0, Math.min(prev, resDias.data.length - 1)));
      setCambiosSinGuardar(false);
    } catch {
      avisar('No se pudo cargar el contenido del plan.');
    }
  };

  const marcarCambio = () => setCambiosSinGuardar(true);

  const guardarPlan = async () => {
    if (!id || !plan) return;
    const contenido: ContenidoPlan = {
      ejerciciosFijos: fijos.map(f => ({
        tipoBloque: f.tipoBloque,
        ejercicioId: f.ejercicio?.id as number,
        seriesReps: f.seriesReps || null,
      })),
      dias: dias.map(d => ({
        diaSemana: d.diaSemana,
        notas: d.notas || null,
        ejercicios: (ejerciciosPorDia[d.id as number] || []).map(ep => ({
          ejercicioId: ep.ejercicio?.id as number,
          circuito: ep.circuito || null,
          prescripciones: (ep.prescripciones || []).map(p => ({
            numeroSemana: p.numeroSemana,
            series: p.series ?? null,
            reps: p.reps ?? null,
            rir: p.rir ?? null,
            notasPeso: p.notasPeso ?? null,
          })),
        })),
      })),
    };
    setGuardando(true);
    try {
      await planificacionService.guardarContenido(id, contenido);
      setEliminado(null);
      await cargarContenido();
      avisar('Plan guardado correctamente', 'success');
    } catch (err: any) {
      avisar(err.response?.data?.error || 'No se pudo guardar el plan. Los cambios siguen en pantalla.');
    } finally {
      setGuardando(false);
    }
  };

  // Flechita de volver: si hay cambios sin guardar, pregunta antes de descartarlos.
  const volver = async () => {
    if (!(await confirmarSalida())) return;
    setCambiosSinGuardar(false);
    navigate('/planificaciones');
  };

  const enviarPorMail = () => {
    if (!id) return;
    if (cambiosSinGuardar) {
      avisar('Debés guardar el plan antes de enviarlo por mail', 'warning');
      return;
    }
    planificacionService.enviar(id)
      .then(() => avisar('Planificación enviada por mail en formato PDF', 'success'))
      .catch((err) => avisar(err.response?.data || 'No se pudo enviar el mail.'));
  };

  // Abre el PDF en otra pestaña para verlo, imprimirlo o descargarlo. La pestaña se
  // abre antes de pedir el PDF para que el navegador no la bloquee como ventana emergente.
  const verPdf = () => {
    if (!id) return;
    if (cambiosSinGuardar) {
      avisar('Debés guardar el plan antes de ver el PDF', 'warning');
      return;
    }
    const pestana = window.open('', '_blank');
    planificacionService.pdf(id)
      .then((res) => {
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        if (pestana) pestana.location.href = url;
        else window.location.href = url;
      })
      .catch(() => {
        pestana?.close();
        avisar('No se pudo generar el PDF.');
      });
  };

  // Agrega el siguiente "Día N" que no exista todavía.
  const agregarDia = () => {
    const usados = new Set(dias.map(d => d.diaSemana));
    const nombre = DIAS.find(d => !usados.has(d)) || `Día ${dias.length + 1}`;
    const nuevo: DiaPlan = { id: idTemporal(), diaSemana: nombre };
    setDias(prev => [...prev, nuevo]);
    setEjerciciosPorDia(prev => ({ ...prev, [nuevo.id as number]: [] }));
    setDiaActual(dias.length);
    marcarCambio();
  };

  const eliminarDia = async () => {
    if (!dia?.id) return;
    const ok = await confirmar({
      titulo: `Eliminar ${dia.diaSemana}`,
      mensaje: `¿Eliminar ${dia.diaSemana} y todos sus ejercicios? Se aplica al tocar "Guardar".`,
    });
    if (ok) {
      const diaId = dia.id;
      setDias(prev => prev.filter(d => d.id !== diaId));
      setEjerciciosPorDia(prev => {
        const resto = { ...prev };
        delete resto[diaId];
        return resto;
      });
      setDiaActual(prev => Math.max(0, prev - 1));
      if (eliminado?.diaId === diaId) setEliminado(null);
      marcarCambio();
    }
  };

  // ---- Ventana de agregar / editar ejercicio ----

  const abrirAgregar = () => {
    if (!dia?.id) return;
    const ultimo = ejerciciosDia[ejerciciosDia.length - 1];
    setModal({
      ep: null,
      diaId: dia.id,
      semanaFoco: null,
      ejercicio: null,
      patronNuevo: '',
      circuito: ultimo?.circuito || 'CF1',
      filas: semanas.map(filaVacia),
      error: '',
    });
  };

  const abrirEditar = (ep: EjercicioPlanificado, semanaFoco: number | null = null, esCopia = false) => {
    if (!dia?.id) return;
    setModal({
      ep: esCopia ? null : ep,
      esCopia,
      origenId: esCopia ? ep.id : undefined,
      diaId: dia.id,
      semanaFoco,
      ejercicio: ep.ejercicio || null,
      patronNuevo: '',
      circuito: ep.circuito || '',
      filas: semanas.map(s => {
        const p = prescripcion(ep, s);
        return { series: texto(p?.series), reps: texto(p?.reps), rir: texto(p?.rir), notasPeso: texto(p?.notasPeso) };
      }),
      error: '',
    });
  };

  const cambiarFila = (idx: number, campo: keyof FilaSemana, valor: string) => {
    setModal(m => m ? { ...m, filas: m.filas.map((f, i) => i === idx ? { ...f, [campo]: valor } : f) } : m);
  };

  const repetirSemana1 = () => {
    setModal(m => m ? { ...m, filas: m.filas.map(() => ({ ...m.filas[0] })) } : m);
  };

  const guardarEjercicio = async () => {
    if (!modal) return;
    const errores: string[] = [];
    if (!modal.ejercicio) errores.push('Elegí un ejercicio.');
    if (modal.ejercicio?.crear && !modal.patronNuevo) errores.push('Elegí el patrón del ejercicio nuevo.');
    if (!modal.filas[0]?.series.trim() || !modal.filas[0]?.reps.trim()) errores.push('Completá series y reps de la semana 1.');
    if (modal.filas.some(f => f.series.trim() && isNaN(parseInt(f.series)))) errores.push('Las series tienen que ser un número.');
    if (errores.length) {
      setModal({ ...modal, error: errores.join(' ') });
      return;
    }

    setGuardandoEjercicio(true);
    try {
      let ejercicio = modal.ejercicio as Ejercicio;
      if (modal.ejercicio?.crear) {
        const res = await ejercicioService.create({ nombre: modal.ejercicio.nombre.trim(), patronMovimiento: modal.patronNuevo as PatronMovimiento });
        ejercicio = res.data;
        setCatalogoEjercicios(prev => [...prev, res.data]);
      }
      const prescripciones: PrescripcionSemanal[] = modal.filas.map((f, i) => ({
        numeroSemana: i + 1,
        series: f.series.trim() ? parseInt(f.series) : null,
        reps: f.reps.trim() || null,
        rir: f.rir.trim() || null,
        notasPeso: f.notasPeso.trim() || null,
      }));
      // Queda en pantalla; se guarda en la base recien al tocar "Guardar".
      const editado: EjercicioPlanificado = {
        ...(modal.ep || {}),
        id: modal.ep?.id ?? idTemporal(),
        diaPlan: { id: modal.diaId },
        ejercicio,
        circuito: modal.circuito || null,
        prescripciones,
      };
      setEjerciciosPorDia(prev => {
        const lista = [...(prev[modal.diaId] || [])];
        const actual = lista.findIndex(e => e.id === editado.id);
        if (actual >= 0) {
          lista[actual] = editado;
        } else {
          const origen = lista.findIndex(e => e.id === modal.origenId);
          lista.splice(origen >= 0 ? origen + 1 : lista.length, 0, editado);
        }
        return { ...prev, [modal.diaId]: lista };
      });
      marcarCambio();
      setModal(null);
    } catch (err: any) {
      setModal(m => m ? { ...m, error: err.response?.data?.error || 'No se pudo crear el ejercicio nuevo.' } : m);
    } finally {
      setGuardandoEjercicio(false);
    }
  };

  // ---- Eliminar con "Deshacer" (solo en pantalla hasta "Guardar") ----

  const eliminarEjercicio = (ep: EjercicioPlanificado) => {
    if (!dia?.id) return;
    const diaId = dia.id;
    const posicion = (ejerciciosPorDia[diaId] || []).findIndex(e => e.id === ep.id);
    setEjerciciosPorDia(prev => ({ ...prev, [diaId]: (prev[diaId] || []).filter(e => e.id !== ep.id) }));
    setEliminado({ ep, diaId, posicion });
    marcarCambio();
  };

  const deshacerEliminar = () => {
    const borrado = eliminado;
    setEliminado(null);
    if (!borrado || !ejerciciosPorDia[borrado.diaId]) return;
    setEjerciciosPorDia(prev => {
      const lista = [...(prev[borrado.diaId] || [])];
      lista.splice(Math.max(0, Math.min(borrado.posicion, lista.length)), 0, borrado.ep);
      return { ...prev, [borrado.diaId]: lista };
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

  // Circuitos para el selector: los de siempre + los que ya use el plan.
  const opcionesCircuito = Array.from(new Set([
    ...CIRCUITOS,
    ...Object.values(ejerciciosPorDia).flat().map(e => e.circuito || '').filter(Boolean),
    ...(modal?.circuito ? [modal.circuito] : []),
  ]));

  const botonesFila = (ep: EjercicioPlanificado) => (
    <>
      <Tooltip title="Editar">
        <IconButton size="small" onClick={() => abrirEditar(ep)} sx={{ color: '#0284c7' }}>
          <EditIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Copiar">
        <IconButton size="small" onClick={() => abrirEditar(ep, null, true)} sx={{ color: '#16a34a' }}>
          <ContentCopyIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Eliminar">
        <IconButton size="small" color="error" onClick={() => eliminarEjercicio(ep)}>
          <DeleteIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </>
  );

  const chipCircuito = (circuito?: string | null) => circuito
    ? <Chip label={circuito} size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 11 }} />
    : <Typography component="span" sx={{ color: '#94a3b8' }}>—</Typography>;

  return (
    <Box>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3.5, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={volver}
              sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {plan.nombre}
                </Typography>
                <Chip
                  label={st.label}
                  size="small"
                  sx={{ bgcolor: st.bg, color: st.text, border: `1px solid ${st.border}`, fontWeight: 700 }}
                />
                <Chip
                  label={`${cantidadSemanas} ${cantidadSemanas === 1 ? 'semana' : 'semanas'}`}
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 700 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Atleta: <strong>{plan.alumno?.nombre} {plan.alumno?.apellido}</strong> ({plan.alumno?.email || 'Sin email'}) — Vigencia: {formatearFecha(plan.fechaInicio)} {plan.fechaFin ? `al ${formatearFecha(plan.fechaFin)}` : ''}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
            <Tooltip title="Guardar" arrow>
              <span>
                <IconButton onClick={guardarPlan} disabled={guardando} aria-label="Guardar"
                  sx={botonIcono('#16a34a', '#f0fdf4', '#bbf7d0')}>
                  {guardando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Enviar por mail" arrow>
              <IconButton onClick={enviarPorMail} aria-label="Enviar por mail"
                sx={botonIcono('#0284c7', '#f0f9ff', '#bae6fd')}>
                <EmailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ver / imprimir PDF" arrow>
              <IconButton onClick={verPdf} aria-label="Ver o imprimir PDF"
                sx={botonIcono('#dc2626', '#fef2f2', '#fecaca')}>
                <PictureAsPdfIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Bloques Fijos (sin cambios: iguales todas las semanas) */}
      {id && (
        <>
          <BloqueFijo
            tipoBloque="MOVILIDAD"
            titulo="Bloque de Movilidad y Calentamiento"
            catalogoEjercicios={catalogoEjercicios}
            patronFiltro="MOVILIDAD"
            items={fijos.filter(f => f.tipoBloque === 'MOVILIDAD')}
            onItemsChange={(lista) => { setFijos(prev => [...prev.filter(f => f.tipoBloque !== 'MOVILIDAD'), ...lista]); marcarCambio(); }}
          />
          <BloqueFijo
            tipoBloque="ACTIVACION"
            titulo="Bloque de Activación y Core"
            catalogoEjercicios={catalogoEjercicios}
            items={fijos.filter(f => f.tipoBloque === 'ACTIVACION')}
            onItemsChange={(lista) => { setFijos(prev => [...prev.filter(f => f.tipoBloque !== 'ACTIVACION'), ...lista]); marcarCambio(); }}
          />
        </>
      )}

      {/* Bloque de fuerza: un día a la vez, con todas las semanas */}
      <Paper elevation={1} sx={{ mb: 3.5, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={dia ? Math.min(diaActual, dias.length - 1) : false}
            onChange={(_, v) => setDiaActual(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minWidth: 0,
              '& .MuiTabs-indicator': { height: 3, borderRadius: 1.5, bgcolor: '#16a34a' },
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.875rem', textTransform: 'none', color: '#64748b', '&.Mui-selected': { color: '#16a34a' } }
            }}
          >
            {dias.map((d) => <Tab key={d.id} label={d.diaSemana} />)}
          </Tabs>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={agregarDia}
            sx={{ fontWeight: 700, color: '#15803d', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Agregar día
          </Button>
        </Box>

        {!dia && (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              No hay días cargados todavía
            </Typography>
            <Button size="small" variant="outlined" color="primary" startIcon={<AddIcon />} onClick={agregarDia} sx={{ fontWeight: 700 }}>
              Agregar primer día
            </Button>
          </Box>
        )}

        {dia && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>{dia.diaSemana}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  {ejerciciosDia.length} ejercicios
                </Typography>
                <Tooltip title="Eliminar día">
                  <IconButton size="small" color="error" onClick={eliminarDia}>
                    <DeleteIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Compu: matriz ejercicios x semanas */}
            {!esCelular && (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 860 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 36, color: '#64748b', fontWeight: 700, fontSize: 11 }}>#</TableCell>
                      <TableCell sx={{ width: 80, color: '#64748b', fontWeight: 700, fontSize: 11 }}>CIRCUITO</TableCell>
                      <TableCell sx={{ color: '#64748b', fontWeight: 700, fontSize: 11 }}>EJERCICIO</TableCell>
                      {semanas.map(s => (
                        <TableCell key={s} align="center" sx={{ color: '#64748b', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>
                          SEMANA {s}
                        </TableCell>
                      ))}
                      <TableCell sx={{ width: 84 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ejerciciosDia.map((ep, k) => (
                      <TableRow key={ep.id} hover>
                        <TableCell sx={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>{k + 1}</TableCell>
                        <TableCell>{chipCircuito(ep.circuito)}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', minWidth: 200 }}>{ep.ejercicio?.nombre}</TableCell>
                        {semanas.map(s => (
                          <TableCell
                            key={s}
                            align="center"
                            onClick={() => abrirEditar(ep, s)}
                            title={`Editar semana ${s}`}
                            sx={{ cursor: 'pointer', px: 1, '&:hover': { bgcolor: '#f8fafc', outline: '1px solid #e2e8f0', outlineOffset: -4, borderRadius: 2 } }}
                          >
                            <Celda ep={ep} semana={s} />
                          </TableCell>
                        ))}
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{botonesFila(ep)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Celular: una tarjeta por ejercicio con sus semanas en lista */}
            {esCelular && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1.75 }}>
                {ejerciciosDia.map((ep, k) => (
                  <Box key={ep.id} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                          #{k + 1}{ep.circuito ? ` · ${ep.circuito}` : ''}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>{ep.ejercicio?.nombre}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexShrink: 0 }}>{botonesFila(ep)}</Box>
                    </Box>
                    {semanas.map(s => (
                      <Box
                        key={s}
                        onClick={() => abrirEditar(ep, s)}
                        sx={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 1, py: 0.9, px: 0.5, borderTop: '1px solid #e2e8f0', cursor: 'pointer' }}
                      >
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Semana {s}</Typography>
                        <Celda ep={ep} semana={s} />
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                startIcon={<AddIcon />}
                onClick={abrirAgregar}
                sx={{
                  border: '1.5px dashed #16a34a', bgcolor: '#f0fdf4', color: '#15803d', borderRadius: 2.5, py: 1.4, fontWeight: 700,
                  '&:hover': { bgcolor: '#dcfce7' }
                }}
              >
                Agregar ejercicio
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Ventana agregar / editar ejercicio */}
      <Dialog
        open={!!modal}
        onClose={() => !guardandoEjercicio && setModal(null)}
        maxWidth="md"
        fullWidth
        fullScreen={esCelular}
        slotProps={{ paper: { sx: { borderRadius: esCelular ? 0 : 4 } } }}
      >
        {modal && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box component="span" sx={{ display: 'block', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                {modal.ep ? 'Editar ejercicio' : modal.esCopia ? 'Copiar ejercicio' : 'Agregar ejercicio'}
              </Box>
              <Box component="span" sx={{ display: 'block', color: '#64748b', fontSize: 14, fontWeight: 500 }}>
                {dias.find(d => d.id === modal.diaId)?.diaSemana}{modal.semanaFoco ? ` · Semana ${modal.semanaFoco}` : ''}
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0,1fr) 140px' }, gap: 1.5, pt: 1 }}>
                <Autocomplete<OpcionEjercicio>
                  size="small"
                  options={catalogoEjercicios}
                  value={modal.ejercicio}
                  isOptionEqualToValue={(a, b) => a.id === b.id && a.nombre === b.nombre}
                  getOptionLabel={(e) => e.nombre}
                  getOptionKey={(e) => e.crear ? `crear-${e.nombre}` : String(e.id)}
                  filterOptions={(options, estado) => {
                    const lista = filtroBase(options, { ...estado, inputValue: sinTildes(estado.inputValue) });
                    const q = estado.inputValue.trim();
                    if (q && !options.some(o => sinTildes(o.nombre) === sinTildes(q))) {
                      lista.push({ nombre: q, patronMovimiento: 'EMPUJE', crear: true });
                    }
                    return lista;
                  }}
                  renderOption={(props, e) => {
                    const { key, ...resto } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
                    return (
                      <li key={key} {...resto} style={e.crear ? { color: '#15803d', fontWeight: 700 } : undefined}>
                        {e.crear ? `+ Crear ejercicio «${e.nombre}»` : e.nombre}
                      </li>
                    );
                  }}
                  onChange={(_, valor) => setModal(m => m ? { ...m, ejercicio: valor, error: '' } : m)}
                  renderInput={(params) => (
                    <TextField {...params} label="Ejercicio" placeholder="Buscar en el catálogo..." autoFocus={!modal.semanaFoco} />
                  )}
                />
                <TextField
                  select
                  size="small"
                  label="Circuito"
                  value={modal.circuito}
                  onChange={(e) => setModal(m => m ? { ...m, circuito: e.target.value } : m)}
                >
                  <MenuItem value=""><em>Sin circuito</em></MenuItem>
                  {opcionesCircuito.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Box>

              {modal.ejercicio?.crear && (
                <TextField
                  select
                  size="small"
                  label="Patrón del ejercicio nuevo"
                  value={modal.patronNuevo}
                  onChange={(e) => setModal(m => m ? { ...m, patronNuevo: e.target.value as PatronMovimiento } : m)}
                  helperText={`Se agrega «${modal.ejercicio.nombre}» al catálogo de ejercicios.`}
                >
                  {PATRONES.map(p => <MenuItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</MenuItem>)}
                </TextField>
              )}

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontWeight: 700, fontSize: 14 }}>
                    Progresión por semana
                  </Typography>
                  {cantidadSemanas > 1 && (
                    <Button size="small" onClick={repetirSemana1} sx={{ fontWeight: 700, color: '#15803d' }}>
                      Repetir semana 1 en todas
                    </Button>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {!esCelular && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '80px 80px 90px 80px minmax(0,1fr)', gap: 1, px: 0.75 }}>
                      {['SEMANA', 'SERIES', 'REPS', 'RIR', 'NOTAS / PESO'].map(h => (
                        <Typography key={h} variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>{h}</Typography>
                      ))}
                    </Box>
                  )}
                  {modal.filas.map((f, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: esCelular ? '1fr 1fr 1fr' : '80px 80px 90px 80px minmax(0,1fr)',
                        gap: 1, alignItems: 'center', p: 0.75, borderRadius: 2,
                        ...(modal.semanaFoco === i + 1 ? { bgcolor: '#f0fdf4', outline: '1px solid #16a34a' } : {}),
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: 13, gridColumn: esCelular ? '1 / -1' : undefined }}>
                        Semana {i + 1}
                      </Typography>
                      <TextField size="small" placeholder="Series" value={f.series} slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': `Series semana ${i + 1}` } }}
                        autoFocus={modal.semanaFoco === i + 1}
                        onChange={(e) => cambiarFila(i, 'series', e.target.value)} />
                      <TextField size="small" placeholder="Reps" value={f.reps} slotProps={{ htmlInput: { 'aria-label': `Reps semana ${i + 1}` } }}
                        onChange={(e) => cambiarFila(i, 'reps', e.target.value)} />
                      <TextField size="small" placeholder="RIR" value={f.rir} slotProps={{ htmlInput: { 'aria-label': `RIR semana ${i + 1}` } }}
                        onChange={(e) => cambiarFila(i, 'rir', e.target.value)} />
                      <TextField size="small" placeholder="Notas / peso" value={f.notasPeso} slotProps={{ htmlInput: { 'aria-label': `Notas o peso semana ${i + 1}` } }}
                        sx={{ gridColumn: esCelular ? '1 / -1' : undefined }}
                        onChange={(e) => cambiarFila(i, 'notasPeso', e.target.value)} />
                    </Box>
                  ))}
                </Box>
              </Box>

            </DialogContent>
            {/* Fuera del scroll para que el error siempre se vea */}
            {modal.error && <Alert severity="error" sx={{ mx: 3, mt: 1.5 }}>{modal.error}</Alert>}
            <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
              <Button onClick={() => setModal(null)} disabled={guardandoEjercicio} sx={{ color: '#64748b' }}>Cancelar</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={guardarEjercicio}
                disabled={guardandoEjercicio}
                startIcon={guardandoEjercicio ? <CircularProgress size={16} color="inherit" /> : undefined}
                sx={{ fontWeight: 700 }}
              >
                Guardar ejercicio
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Aviso de eliminado con Deshacer */}
      <Snackbar
        open={!!eliminado}
        autoHideDuration={6000}
        onClose={(_, motivo) => { if (motivo !== 'clickaway') setEliminado(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={`Eliminado: ${eliminado?.ep.ejercicio?.nombre || ''}`}
        action={<Button onClick={deshacerEliminar} sx={{ color: '#4ade80', fontWeight: 800 }}>Deshacer</Button>}
      />

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
