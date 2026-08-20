package com.masgym.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "semanas_plan")
public class SemanaPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "planificacion_id", nullable = false)
    private Planificacion planificacion;

    @Column(nullable = false)
    private Integer numeroSemana;

    private String notas;

    @JsonIgnore
    @OneToMany(mappedBy = "semanaPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaPlan> dias;
}