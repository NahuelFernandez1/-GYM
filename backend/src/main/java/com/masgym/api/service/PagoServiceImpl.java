package com.masgym.api.service;

import com.masgym.api.model.Pago;
import com.masgym.api.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;

    @Override
    public List<Pago> obtenerTodos() {
        return pagoRepository.findAll();
    }

    @Override
    public Optional<Pago> obtenerPorId(Long id) {
        return pagoRepository.findById(id);
    }

    @Override
    public List<Pago> obtenerPorAlumno(Long alumnoId) {
        return pagoRepository.findByAlumnoId(alumnoId);
    }

    @Override
    public List<Pago> obtenerVencidos() {
        return pagoRepository.findByFechaVencimientoBefore(LocalDate.now());
    }

    @Override
    public List<Pago> obtenerProximosAVencer(int dias) {
        return pagoRepository.findByFechaVencimientoBefore(
                LocalDate.now().plusDays(dias)
        );
    }

    @Override
    public Pago guardar(Pago pago) {
        return pagoRepository.save(pago);
    }

    @Override
    public void eliminar(Long id) {
        pagoRepository.deleteById(id);
    }

    @Override
    public long contarPorEstado(String estado) {
        return pagoRepository.countByEstado(estado);
    }
}