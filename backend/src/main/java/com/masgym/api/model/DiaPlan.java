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

    @ManyToOne
    @JoinColumn(name = "semana_plan_id", nullable = false)
    private SemanaPlan semanaPlan;

    @Column(nullable = false)
    private String diaSemana;

    private String notas;

    @JsonIgnore
    @OneToMany(mappedBy = "diaPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EjercicioPlanificado> ejercicios;
}