package com.masgym.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data // genera automaticamente los getter, setters, tostring y constructores
@Entity // le dice a spring que esta clase representa una tabla de la base de datos
@Table(name = "usuarios") // aca se define el nombre exacto de la tabla en psotgreswl.
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String rol; // ADMIN o PROFESOR

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}