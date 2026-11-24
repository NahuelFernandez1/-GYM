package com.masgym.api.service;

import com.masgym.api.model.*;
import com.masgym.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlanificacionServiceImpl implements PlanificacionService {

    // Tambien esta como CHECK en la base (ck_planificaciones_cantidad_semanas).
    private static final int MAX_SEMANAS = 5;

    private final PlanificacionRepository planificacionRepository;
    private final DiaPlanRepository diaPlanRepository;
    private final EjercicioPlanificadoRepository ejercicioPlanificadoRepository;
    private final PrescripcionSemanalRepository prescripcionSemanalRepository;

    @Override
    public List<Planificacion> obtenerTodas() {
        return planificacionRepository.findAll();
    }

    @Override
    public Optional<Planificacion> obtenerPorId(Long id) {
        return planificacionRepository.findById(id);
    }

    @Override
    public List<Planificacion> obtenerPorAlumno(Long alumnoId) {
        return planificacionRepository.findByAlumnoId(alumnoId);
    }

    @Override
    public List<Planificacion> obtenerPorProfesor(Long usuarioId) {
        return planificacionRepository.findByCreadoPorId(usuarioId);
    }

    @Override
    public Planificacion guardar(Planificacion planificacion) {
        return planificacionRepository.save(planificacion);
    }

    /**
     * Actualiza solo los campos simples del plan (nombre, alumno, fechas, estado).
     * A proposito NO usa guardar(planificacion) con el objeto que manda el cliente:
     * como "dias"/"ejerciciosFijos" tienen @JsonIgnore, nunca viajan en el payload,
     * y si se guardara ese objeto tal cual, Hibernate interpretaria "sin dias" y
     * los borraria en cascada (cascade=ALL + orphanRemoval=true). Por eso se carga la
     * entidad persistida y se pisan solo los campos que el form de edicion expone.
     * La cantidad de semanas se cambia con agregarSemana/eliminarSemana.
     */
    @Override
    @Transactional
    public Optional<Planificacion> actualizarDatosBasicos(Long id, Planificacion cambios) {
        return planificacionRepository.findById(id).map(existente -> {
            if (cambios.getNombre() != null) existente.setNombre(cambios.getNombre());
            if (cambios.getAlumno() != null) existente.setAlumno(cambios.getAlumno());
            if (cambios.getFechaInicio() != null) existente.setFechaInicio(cambios.getFechaInicio());
            if (cambios.getFechaFin() != null) existente.setFechaFin(cambios.getFechaFin());
            if (cambios.getEstado() != null) existente.setEstado(cambios.getEstado());
            return planificacionRepository.save(existente);
        });
    }

    @Override
    @Transactional
    public Planificacion copiar(Long planificacionId) {
        Planificacion original = planificacionRepository.findById(planificacionId)
                .orElseThrow(() -> new RuntimeException("Planificacion no encontrada"));

        Planificacion copia = new Planificacion();
        copia.setAlumno(original.getAlumno());
        copia.setCreadoPor(original.getCreadoPor());
        copia.setNombre(original.getNombre() + " (copia)");
        copia.setFechaInicio(original.getFechaInicio());
        copia.setFechaFin(original.getFechaFin());
        copia.setEstado("BORRADOR");
        copia.setCantidadSemanas(original.getCantidadSemanas());
        Planificacion copiaPlan = planificacionRepository.save(copia);

        for (DiaPlan dia : diaPlanRepository.findByPlanificacionIdOrderByIdAsc(planificacionId)) {
            DiaPlan nuevoDia = new DiaPlan();
            nuevoDia.setPlanificacion(copiaPlan);
            nuevoDia.setDiaSemana(dia.getDiaSemana());
            nuevoDia.setNotas(dia.getNotas());
            DiaPlan diaGuardado = diaPlanRepository.save(nuevoDia);

            for (EjercicioPlanificado ejercicio : ejercicioPlanificadoRepository
                    .findByDiaPlanIdOrderByOrdenAsc(dia.getId())) {
                EjercicioPlanificado nuevoEjercicio = new EjercicioPlanificado();
                nuevoEjercicio.setDiaPlan(diaGuardado);
                nuevoEjercicio.setEjercicio(ejercicio.getEjercicio());
                nuevoEjercicio.setOrden(ejercicio.getOrden());
                nuevoEjercicio.setCircuito(ejercicio.getCircuito());
                for (PrescripcionSemanal p : ejercicio.getPrescripciones()) {
                    nuevoEjercicio.getPrescripciones()
                            .add(PrescripcionSemanal.copiaDe(p, nuevoEjercicio, p.getNumeroSemana()));
                }
                ejercicioPlanificadoRepository.save(nuevoEjercicio);
            }
        }
        return copiaPlan;
    }

    /** Agrega una semana al final, arrancando con los mismos valores que la ultima. */
    @Override
    @Transactional
    public Planificacion agregarSemana(Long planificacionId) {
        Planificacion plan = buscar(planificacionId);
        int actual = plan.getCantidadSemanas();
        if (actual >= MAX_SEMANAS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El plan ya tiene el máximo de " + MAX_SEMANAS + " semanas.");
        }
        int nueva = actual + 1;
        for (DiaPlan dia : plan.getDias()) {
            for (EjercicioPlanificado ep : dia.getEjercicios()) {
                PrescripcionSemanal ultima = ep.getPrescripciones().stream()
                        .filter(p -> p.getNumeroSemana() == actual)
                        .findFirst()
                        .orElse(null);
                ep.getPrescripciones().add(PrescripcionSemanal.copiaDe(ultima, ep, nueva));
            }
        }
        plan.setCantidadSemanas(nueva);
        return planificacionRepository.save(plan);
    }

    /** Saca una semana y corre las siguientes un lugar (si se borra la 2, la 3 pasa a ser la 2). */
    @Override
    @Transactional
    public Planificacion eliminarSemana(Long planificacionId, int numeroSemana) {
        int actual = buscar(planificacionId).getCantidadSemanas();
        if (actual <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El plan tiene que tener al menos una semana.");
        }
        if (numeroSemana < 1 || numeroSemana > actual) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La semana " + numeroSemana + " no existe en este plan.");
        }
        prescripcionSemanalRepository.borrarSemana(planificacionId, numeroSemana);
        prescripcionSemanalRepository.correrSemanasANegativo(planificacionId, numeroSemana);
        prescripcionSemanalRepository.volverSemanasAPositivo(planificacionId);

        // Las consultas de arriba limpian el contexto de JPA: se vuelve a cargar el plan.
        Planificacion plan = buscar(planificacionId);
        plan.setCantidadSemanas(actual - 1);
        return planificacionRepository.save(plan);
    }

    private Planificacion buscar(Long id) {
        return planificacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Planificación no encontrada."));
    }

    @Override
    public void eliminar(Long id) {
        planificacionRepository.deleteById(id);
    }
}
