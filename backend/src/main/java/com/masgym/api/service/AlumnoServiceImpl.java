package com.masgym.api.service;

import com.masgym.api.exception.AlumnoConDatosAsociadosException;
import com.masgym.api.model.Alumno;
import com.masgym.api.repository.AlumnoRepository;
import com.masgym.api.repository.PagoRepository;
import com.masgym.api.repository.PlanificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AlumnoServiceImpl implements AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final PlanificacionRepository planificacionRepository;
    private final PagoRepository pagoRepository;

    @Override
    public List<Alumno> obtenerTodos() {
        return alumnoRepository.findAll();
    }

    @Override
    public Optional<Alumno> obtenerPorId(Long id) {
        return alumnoRepository.findById(id);
    }

    @Override
    public List<Alumno> obtenerPorEstado(String estado) {
        return alumnoRepository.findByEstado(estado);
    }

    @Override
    public List<Alumno> obtenerPorProfesor(Long usuarioId) {
        return alumnoRepository.findByUsuarioAsignadoId(usuarioId);
    }

    @Override
    public Alumno guardar(Alumno alumno) {
        return alumnoRepository.save(alumno);
    }

    @Override
    public void eliminar(Long id) {
        long planificaciones = planificacionRepository.countByAlumnoId(id);
        long pagos = pagoRepository.countByAlumnoId(id);

        if (planificaciones > 0 || pagos > 0) {
            throw new AlumnoConDatosAsociadosException(
                    construirMensajeDatosAsociados(planificaciones, pagos),
                    planificaciones,
                    pagos
            );
        }

        alumnoRepository.deleteById(id);
    }

    private String construirMensajeDatosAsociados(long planificaciones, long pagos) {
        StringBuilder sb = new StringBuilder("No se puede eliminar: el alumno tiene ");
        if (planificaciones > 0) {
            sb.append(planificaciones).append(planificaciones == 1 ? " planificación" : " planificaciones");
        }
        if (planificaciones > 0 && pagos > 0) {
            sb.append(" y ");
        }
        if (pagos > 0) {
            sb.append(pagos).append(pagos == 1 ? " pago" : " pagos");
        }
        sb.append(" asociado").append((planificaciones + pagos) == 1 ? "." : "s.");
        return sb.toString();
    }

    @Override
    public long contarActivos() {
        return alumnoRepository.countByEstado("ACTIVO");
    }
}