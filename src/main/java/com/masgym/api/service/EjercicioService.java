package com.masgym.api.service;

import com.masgym.api.model.Ejercicio;
import java.util.List;
import java.util.Optional;

public interface EjercicioService {
    List<Ejercicio> obtenerTodos();
    Optional<Ejercicio> obtenerPorId(Long id);
    List<Ejercicio> obtenerPorPatronMovimiento(String patronMovimiento);
    List<Ejercicio> buscarPorNombre(String nombre);
    Ejercicio guardar(Ejercicio ejercicio);
    void eliminar(Long id);
}