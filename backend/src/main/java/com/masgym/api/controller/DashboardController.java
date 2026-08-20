package com.masgym.api.controller;

import com.masgym.api.service.AlumnoService;
import com.masgym.api.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final AlumnoService alumnoService;
    private final PagoService pagoService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerKpis() {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("alumnosActivos", alumnoService.contarActivos());
        kpis.put("pagosPendientes", pagoService.contarPorEstado("PENDIENTE"));
        kpis.put("pagosVencidos", pagoService.contarPorEstado("VENCIDO"));
        kpis.put("alumnosProximosAVencer", pagoService.obtenerProximosAVencer(7).size());
        return ResponseEntity.ok(kpis);
    }
}