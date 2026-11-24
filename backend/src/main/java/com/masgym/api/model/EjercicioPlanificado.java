package com.masgym.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * Lo fijo de un ejercicio dentro de un dia (que ejercicio, circuito y orden).
 * Lo que cambia semana a semana (series, reps, RIR, notas/peso) esta en
 * {@link PrescripcionSemanal}: una por cada semana del plan.
 */
@Data
@Entity
@Table(name = "ejercicios_planificados")
public class EjercicioPlanificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dia_plan_id", nullable = false)
    private DiaPlan diaPlan;

    @ManyToOne
    @JoinColumn(name = "ejercicio_id", nullable = false)
    private Ejercicio ejercicio;

    @Column(nullable = false)
    private Integer orden;

    private String circuito;

    @OneToMany(mappedBy = "ejercicioPlanificado", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("numeroSemana ASC")
    private List<PrescripcionSemanal> prescripciones = new ArrayList<>();
}
