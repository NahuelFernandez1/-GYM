package com.masgym.api.repository;

import com.masgym.api.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByAlumnoId(Long alumnoId);
    List<Pago> findByEstado(String estado);
    List<Pago> findByFechaVencimientoBefore(LocalDate fecha); //trae los pagos cuya fecha de vencimiento es anteior a una fecha dada
    long countByEstado(String estado);
    long countByAlumnoId(Long alumnoId);
    boolean existsByAlumnoIdAndFechaVencimientoBetween(Long alumnoId, LocalDate desde, LocalDate hasta);
}