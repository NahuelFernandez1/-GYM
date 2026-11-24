package com.masgym.api.repository;

import com.masgym.api.model.PrescripcionSemanal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescripcionSemanalRepository extends JpaRepository<PrescripcionSemanal, Long> {

    // Al bajar la cantidad de semanas del plan.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from PrescripcionSemanal p where p.numeroSemana > :cantidad and p.ejercicioPlanificado.id in " +
            "(select e.id from EjercicioPlanificado e where e.diaPlan.planificacion.id = :planId)")
    int borrarSemanasMayoresA(@Param("planId") Long planId, @Param("cantidad") int cantidad);
}
