package com.masgym.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Lo que se pide de un ejercicio en una semana puntual del bloque.
 * Hay una por semana (1..cantidadSemanas del plan) para cada EjercicioPlanificado.
 */
@Data
@Entity
@Table(
        name = "prescripciones_semanales",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_prescripcion_ep_semana",
                columnNames = {"ejercicio_planificado_id", "numero_semana"}
        )
)
public class PrescripcionSemanal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @JsonIgnore + exclusiones de Lombok: evitan el ciclo padre <-> hijo
    // al serializar y en equals/hashCode/toString.
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @ManyToOne
    @JoinColumn(name = "ejercicio_planificado_id", nullable = false)
    private EjercicioPlanificado ejercicioPlanificado;

    @Column(nullable = false)
    private Integer numeroSemana;

    // Solo la semana 1 es obligatoria (se valida en el servicio), por eso son nullables.
    private Integer series;

    // Texto libre: "8", "4-6", "30 s".
    private String reps;

    private String rir;

    // Un solo campo para notas o peso, como en la pantalla actual.
    private String notasPeso;

    /** Copia los valores de {@code origen} (puede ser null: queda vacia) a una semana nueva de {@code destino}. */
    public static PrescripcionSemanal copiaDe(PrescripcionSemanal origen, EjercicioPlanificado destino, int semana) {
        PrescripcionSemanal p = new PrescripcionSemanal();
        p.setEjercicioPlanificado(destino);
        p.setNumeroSemana(semana);
        if (origen != null) p.copiarValoresDe(origen);
        return p;
    }

    /** Pisa series, reps, RIR y notas con los de {@code origen}; los textos vacios quedan en null. */
    public void copiarValoresDe(PrescripcionSemanal origen) {
        this.series = origen.getSeries();
        this.reps = textoONull(origen.getReps());
        this.rir = textoONull(origen.getRir());
        this.notasPeso = textoONull(origen.getNotasPeso());
    }

    private static String textoONull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
