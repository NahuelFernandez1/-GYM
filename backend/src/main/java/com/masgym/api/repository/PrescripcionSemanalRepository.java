package com.masgym.api.repository;

import com.masgym.api.model.PrescripcionSemanal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescripcionSemanalRepository extends JpaRepository<PrescripcionSemanal, Long> {

    // Las tres consultas se usan juntas para sacar una semana del plan y correr
    // las siguientes un lugar (semana 4 -> 3, 5 -> 4).

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from PrescripcionSemanal p where p.numeroSemana = :semana and p.ejercicioPlanificado.id in " +
            "(select e.id from EjercicioPlanificado e where e.diaPlan.planificacion.id = :planId)")
    int borrarSemana(@Param("planId") Long planId, @Param("semana") int semana);

    // Paso 1: las semanas posteriores pasan a negativo (ya restadas en uno). Postgres
    // chequea el unique (ejercicio, semana) fila por fila, asi que correrlas directo
    // podria chocar con la semana de al lado; en negativo no hay choque posible.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update PrescripcionSemanal p set p.numeroSemana = -(p.numeroSemana - 1) " +
            "where p.numeroSemana > :semana and p.ejercicioPlanificado.id in " +
            "(select e.id from EjercicioPlanificado e where e.diaPlan.planificacion.id = :planId)")
    int correrSemanasANegativo(@Param("planId") Long planId, @Param("semana") int semana);

    // Paso 2: vuelven a positivo.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update PrescripcionSemanal p set p.numeroSemana = -p.numeroSemana " +
            "where p.numeroSemana < 0 and p.ejercicioPlanificado.id in " +
            "(select e.id from EjercicioPlanificado e where e.diaPlan.planificacion.id = :planId)")
    int volverSemanasAPositivo(@Param("planId") Long planId);
}
