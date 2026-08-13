package com.masgym.api.service;

import com.masgym.api.model.Alumno;
import com.masgym.api.repository.AlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AlumnoServiceImpl implements AlumnoService {

    private final AlumnoRepository alumnoRepository;

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
        alumnoRepository.deleteById(id);
    }

    @Override
    public long contarActivos() {
        return alumnoRepository.countByEstado("ACTIVO");
    }
}