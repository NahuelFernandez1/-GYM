package com.masgym.api.service;

import com.masgym.api.model.Alumno;
import java.util.List;
import java.util.Optional;

public interface AlumnoService {
    List<Alumno> obtenerTodos();
    Optional<Alumno> obtenerPorId(Long id);
    List<Alumno> obtenerPorEstado(String estado);
    List<Alumno> obtenerPorProfesor(Long usuarioId);
    Alumno guardar(Alumno alumno);
    void eliminar(Long id);
    long contarActivos();
}