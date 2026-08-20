package com.masgym.api.repository;

import com.masgym.api.model.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Long> {
    List<Alumno> findByEstado(String estado);
    List<Alumno> findByUsuarioAsignadoId(Long usuarioId);
    long countByEstado(String estado); // cuenta alumnos que hay por estado, esto es para un kpi
}