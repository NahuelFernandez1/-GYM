package com.masgym.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "dias_plan")
public class DiaPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Los dias cuelgan directo del plan; las semanas viven en PrescripcionSemanal.
    @ManyToOne
    @JoinColumn(name = "planificacion_id", nullable = false)
    private Planificacion planificacion;

    @Column(nullable = false)
    private String diaSemana;

    private String notas;

    @JsonIgnore
    @OneToMany(mappedBy = "diaPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden ASC")
    private List<EjercicioPlanificado> ejercicios;
}
