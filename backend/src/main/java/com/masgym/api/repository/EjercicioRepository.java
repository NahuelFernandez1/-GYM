package com.masgym.api.repository;

import com.masgym.api.model.Ejercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {
    List<Ejercicio> findByPatronMovimiento(String patronMovimiento);
    List<Ejercicio> findByNombreContainingIgnoreCase(String nombre);
}