package com.masgym.api.controller;

import com.masgym.api.dto.AlumnoPorVencerDTO;
import com.masgym.api.model.Alumno;
import com.masgym.api.service.AlumnoService;
import com.masgym.api.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private static final long DIAS_VENTANA_POR_VENCER = 5;

    private final AlumnoService alumnoService;
    private final PagoService pagoService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerKpis() {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("alumnosActivos", alumnoService.contarActivos());
        kpis.put("pagosPendientes", pagoService.contarPorEstado("PENDIENTE"));
        kpis.put("pagosVencidos", pagoService.contarPorEstado("VENCIDO"));
        return ResponseEntity.ok(kpis);
    }

    @GetMapping("/planes-por-vencer")
    public ResponseEntity<List<AlumnoPorVencerDTO>> obtenerPlanesPorVencer() {
        LocalDate hoy = LocalDate.now();

        List<AlumnoPorVencerDTO> resultado = alumnoService.obtenerPorEstado("ACTIVO").stream()
                .filter(a -> a.getFechaVencimientoCuota() != null)
                .map(a -> {
                    long dias = ChronoUnit.DAYS.between(hoy, a.getFechaVencimientoCuota());
                    return new AlumnoPorVencerDTO(
                            a.getId(),
                            nombreCompleto(a),
                            a.getFechaVencimientoCuota(),
                            dias,
                            dias < 0
                    );
                })
                .filter(dto -> dto.getDiasRestantes() <= DIAS_VENTANA_POR_VENCER)
                .sorted(Comparator.comparingLong(AlumnoPorVencerDTO::getDiasRestantes))
                .toList();

        return ResponseEntity.ok(resultado);
    }

    private String nombreCompleto(Alumno alumno) {
        return (alumno.getNombre() + " " + alumno.getApellido()).trim();
    }
}