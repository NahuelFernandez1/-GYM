package com.masgym.api.repository;

import com.masgym.api.model.Planificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlanificacionRepository extends JpaRepository<Planificacion, Long> {
    List<Planificacion> findByAlumnoId(Long alumnoId);
    List<Planificacion> findByEstado(String estado);
    List<Planificacion> findByCreadoPorId(Long usuarioId);
}