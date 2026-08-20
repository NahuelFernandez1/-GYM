package com.masgym.api.service;

import com.masgym.api.model.Ejercicio;
import com.masgym.api.repository.EjercicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EjercicioServiceImpl implements EjercicioService {

    private final EjercicioRepository ejercicioRepository;

    @Override
    public List<Ejercicio> obtenerTodos() {
        return ejercicioRepository.findAll();
    }

    @Override
    public Optional<Ejercicio> obtenerPorId(Long id) {
        return ejercicioRepository.findById(id);
    }

    @Override
    public List<Ejercicio> obtenerPorPatronMovimiento(String patronMovimiento) {
        return ejercicioRepository.findByPatronMovimiento(patronMovimiento);
    }

    @Override
    public List<Ejercicio> buscarPorNombre(String nombre) {
        return ejercicioRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Override
    public Ejercicio guardar(Ejercicio ejercicio) {
        return ejercicioRepository.save(ejercicio);
    }

    @Override
    public void eliminar(Long id) {
        ejercicioRepository.deleteById(id);
    }
}