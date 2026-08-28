package com.masgym.api.controller;

import com.masgym.api.model.Pago;
import com.masgym.api.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    public ResponseEntity<List<Pago>> obtenerTodos() {
        return ResponseEntity.ok(pagoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pago> obtenerPorId(@PathVariable Long id) {
        return pagoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/alumno/{alumnoId}")
    public ResponseEntity<List<Pago>> obtenerPorAlumno(@PathVariable Long alumnoId) {
        return ResponseEntity.ok(pagoService.obtenerPorAlumno(alumnoId));
    }

    @GetMapping("/vencidos")
    public ResponseEntity<List<Pago>> obtenerVencidos() {
        return ResponseEntity.ok(pagoService.obtenerVencidos());
    }

    @GetMapping("/proximos-a-vencer")
    public ResponseEntity<List<Pago>> obtenerProximosAVencer(@RequestParam(defaultValue = "7") int dias) {
        return ResponseEntity.ok(pagoService.obtenerProximosAVencer(dias));
    }

    @PostMapping
    public ResponseEntity<Pago> crear(@RequestBody Pago pago) {
        return ResponseEntity.ok(pagoService.guardar(pago));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pago> actualizar(@PathVariable Long id, @RequestBody Pago pago) {
        return pagoService.obtenerPorId(id)
                .map(p -> {
                    pago.setId(id);
                    return ResponseEntity.ok(pagoService.guardar(pago));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pagoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen(Authentication authentication) {
        Map<String, Object> resumen = new java.util.HashMap<>();

        if (esProfesor(authentication)) {
            resumen.put("recaudadoHoy", "****");
            resumen.put("recaudadoMes", "****");
            resumen.put("oculto", true);
            resumen.put("totalPagos", pagoService.obtenerTodos().size());
            return ResponseEntity.ok(resumen);
        }

        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);

        // Recaudado hoy
        double recaudadoHoy = pagoService.obtenerTodos().stream()
                .filter(p -> p.getFechaPago() != null && p.getFechaPago().equals(hoy))
                .filter(p -> "PAGADO".equals(p.getEstado()))
                .mapToDouble(p -> p.getMonto().doubleValue())
                .sum();

        // Recaudado en el mes
        double recaudadoMes = pagoService.obtenerTodos().stream()
                .filter(p -> p.getFechaPago() != null &&
                        !p.getFechaPago().isBefore(inicioMes) &&
                        !p.getFechaPago().isAfter(hoy))
                .filter(p -> "PAGADO".equals(p.getEstado()))
                .mapToDouble(p -> p.getMonto().doubleValue())
                .sum();

        resumen.put("recaudadoHoy", recaudadoHoy);
        resumen.put("recaudadoMes", recaudadoMes);
        resumen.put("oculto", false);
        resumen.put("totalPagos", pagoService.obtenerTodos().size());

        return ResponseEntity.ok(resumen);
    }

    private boolean esProfesor(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_PROFESOR"::equals);
    }
}