package com.masgym.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;

@Data
@Entity
@Table(name = "planificaciones")
public class Planificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @ManyToOne
    @JoinColumn(name = "creado_por_id", nullable = true)
    private Usuario creadoPor;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @Column(nullable = false)
    private String estado; // BORRADOR, ENVIADA, ARCHIVADA

    private LocalDateTime enviadoAt;

    // Semanas del bloque (1 a 5). Cada ejercicio tiene una prescripcion por semana.
    // Sin valor inicial a proposito: en un PUT, null significa "no cambiar".
    // Al crear sin dato arranca en 5 (ver onCreate).
    @Column(nullable = false)
    private Integer cantidadSemanas;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (cantidadSemanas == null) cantidadSemanas = 5;
    }

    @JsonIgnore
    @OneToMany(mappedBy = "planificacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private java.util.List<DiaPlan> dias;

    @JsonIgnore
    @OneToMany(mappedBy = "planificacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<EjercicioFijoPlan> ejerciciosFijos;

}
