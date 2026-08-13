package com.masgym.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ejercicios_fijos_plan")
public class EjercicioFijoPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "planificacion_id", nullable = false)
    private Planificacion planificacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoBloqueFijo tipoBloque;

    @ManyToOne
    @JoinColumn(name = "ejercicio_id", nullable = false)
    private Ejercicio ejercicio;

    @Column(nullable = false)
    private Integer orden;

    private String seriesReps;
}
