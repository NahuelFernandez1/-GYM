package com.masgym.api.service;

import com.masgym.api.model.Alumno;
import com.masgym.api.model.Pago;
import com.masgym.api.repository.AlumnoRepository;
import com.masgym.api.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final AlumnoRepository alumnoRepository;

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

    @Override
    @Transactional
    public int generarPagosDelMes() {
        YearMonth mesActual = YearMonth.now();
        LocalDate inicioMes = mesActual.atDay(1);
        LocalDate finMes = mesActual.atEndOfMonth();
        LocalDate vencimiento = mesActual.atDay(Math.min(10, mesActual.lengthOfMonth()));

        List<Alumno> alumnosActivos = alumnoRepository.findByEstado("ACTIVO");
        int generados = 0;

        for (Alumno alumno : alumnosActivos) {
            boolean yaExiste = pagoRepository.existsByAlumnoIdAndFechaVencimientoBetween(
                    alumno.getId(), inicioMes, finMes);
            if (yaExiste) {
                continue;
            }

            Pago pago = new Pago();
            pago.setAlumno(alumno);
            pago.setMonto(BigDecimal.ZERO);
            pago.setFechaVencimiento(vencimiento);
            pago.setEstado("PENDIENTE");
            pago.setNotas("Generado automáticamente");
            pagoRepository.save(pago);
            generados++;
        }

        return generados;
    }

    // Corre a la 01:00 del dia 1 de cada mes. El endpoint POST /api/pagos/generar-mes
    // llama al mismo generarPagosDelMes() y es idempotente, asi que sirve de respaldo
    // manual si el servidor estuvo caido justo ese dia.
    @Scheduled(cron = "0 0 1 1 * *")
    public void generarPagosDelMesAutomatico() {
        int generados = generarPagosDelMes();
        log.info("Job mensual de pagos: {} pago(s) generado(s).", generados);
    }
}