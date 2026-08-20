package com.masgym.api.service;

import com.masgym.api.model.*;
import com.masgym.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlanificacionServiceImpl implements PlanificacionService {

    private final PlanificacionRepository planificacionRepository;
    private final SemanaPlanRepository semanaPlanRepository;
    private final DiaPlanRepository diaPlanRepository;
    private final EjercicioPlanificadoRepository ejercicioPlanificadoRepository;

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

    @Override
    @Transactional
    public Planificacion copiar(Long planificacionId) {
        Planificacion original = planificacionRepository.findById(planificacionId)
                .orElseThrow(() -> new RuntimeException("Planificacion no encontrada"));

        // Copia la planificacion
        Planificacion copia = new Planificacion();
        copia.setAlumno(original.getAlumno());
        copia.setCreadoPor(original.getCreadoPor());
        copia.setNombre(original.getNombre() + " (copia)");
        copia.setFechaInicio(original.getFechaInicio());
        copia.setFechaFin(original.getFechaFin());
        copia.setEstado("BORRADOR");
        Planificacion copiaPlan = planificacionRepository.save(copia);

        // Copia las semanas
        List<SemanaPlan> semanas = semanaPlanRepository
                .findByPlanificacionIdOrderByNumeroSemanaAsc(planificacionId);

        for (SemanaPlan semana : semanas) {
            SemanaPlan nuevaSemana = new SemanaPlan();
            nuevaSemana.setPlanificacion(copiaPlan);
            nuevaSemana.setNumeroSemana(semana.getNumeroSemana());
            nuevaSemana.setNotas(semana.getNotas());
            SemanaPlan semanaGuardada = semanaPlanRepository.save(nuevaSemana);

            // Copia los dias
            List<DiaPlan> dias = diaPlanRepository
                    .findBySemanaPlanId(semana.getId());

            for (DiaPlan dia : dias) {
                DiaPlan nuevoDia = new DiaPlan();
                nuevoDia.setSemanaPlan(semanaGuardada);
                nuevoDia.setDiaSemana(dia.getDiaSemana());
                nuevoDia.setNotas(dia.getNotas());
                DiaPlan diaGuardado = diaPlanRepository.save(nuevoDia);

                // Copia los ejercicios
                List<EjercicioPlanificado> ejercicios = ejercicioPlanificadoRepository
                        .findByDiaPlanIdOrderByOrdenAsc(dia.getId());

                for (EjercicioPlanificado ejercicio : ejercicios) {
                    EjercicioPlanificado nuevoEjercicio = new EjercicioPlanificado();
                    nuevoEjercicio.setDiaPlan(diaGuardado);
                    nuevoEjercicio.setEjercicio(ejercicio.getEjercicio());
                    nuevoEjercicio.setOrden(ejercicio.getOrden());
                    nuevoEjercicio.setSeries(ejercicio.getSeries());
                    nuevoEjercicio.setRepeticiones(ejercicio.getRepeticiones());
                    nuevoEjercicio.setPesoKg(ejercicio.getPesoKg());
                    nuevoEjercicio.setNotas(ejercicio.getNotas());
                    ejercicioPlanificadoRepository.save(nuevoEjercicio);
                }
            }
        }
        return copiaPlan;
    }

    @Override
    public void eliminar(Long id) {
        planificacionRepository.deleteById(id);
    }
}