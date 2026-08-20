package com.masgym.api.service;

import com.masgym.api.model.Pago;
import java.util.List;
import java.util.Optional;

public interface PagoService {
    List<Pago> obtenerTodos();
    Optional<Pago> obtenerPorId(Long id);
    List<Pago> obtenerPorAlumno(Long alumnoId);
    List<Pago> obtenerVencidos();
    List<Pago> obtenerProximosAVencer(int dias);
    Pago guardar(Pago pago);
    void eliminar(Long id);
    long contarPorEstado(String estado);
}