package com.masgym.api.service;

import com.masgym.api.model.Planificacion;
import java.util.List;
import java.util.Optional;

public interface PlanificacionService {
    List<Planificacion> obtenerTodas();
    Optional<Planificacion> obtenerPorId(Long id);
    List<Planificacion> obtenerPorAlumno(Long alumnoId);
    List<Planificacion> obtenerPorProfesor(Long usuarioId);
    Planificacion guardar(Planificacion planificacion);
    Planificacion copiar(Long planificacionId);
    void eliminar(Long id);
}