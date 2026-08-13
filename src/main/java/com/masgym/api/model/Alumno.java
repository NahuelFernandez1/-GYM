package com.masgym.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alumnos")
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_asignado_id")
    private Usuario usuarioAsignado;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(unique = true)
    private String dni;

    private String telefono;

    @Column(unique = true)
    private String email;

    private LocalDate fechaNacimiento;

    private String fotoUrl;

    @Column(nullable = false)
    private String estado; // ACTIVO, INACTIVO, SUSPENDIDO

    private LocalDate fechaVencimientoCuota;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    private String objetivos;

    private String notas;
}