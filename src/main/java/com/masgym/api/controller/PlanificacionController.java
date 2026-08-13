package com.masgym.api.controller;

import com.masgym.api.model.Planificacion;
import com.masgym.api.service.PlanificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.masgym.api.service.EmailService;
import com.masgym.api.repository.PlanificacionRepository;


@RestController
@RequestMapping("/api/planificaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PlanificacionController {

    private final PlanificacionService planificacionService;
    private final EmailService emailService;
    private final PlanificacionRepository planificacionRepository;

    @GetMapping
    public ResponseEntity<List<Planificacion>> obtenerTodas() {
        return ResponseEntity.ok(planificacionService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Planificacion> obtenerPorId(@PathVariable Long id) {
        return planificacionService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/alumno/{alumnoId}")
    public ResponseEntity<List<Planificacion>> obtenerPorAlumno(@PathVariable Long alumnoId) {
        return ResponseEntity.ok(planificacionService.obtenerPorAlumno(alumnoId));
    }

    @GetMapping("/profesor/{usuarioId}")
    public ResponseEntity<List<Planificacion>> obtenerPorProfesor(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(planificacionService.obtenerPorProfesor(usuarioId));
    }

    @PostMapping
    public ResponseEntity<Planificacion> crear(@RequestBody Planificacion planificacion) {
        return ResponseEntity.ok(planificacionService.guardar(planificacion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Planificacion> actualizar(
            @PathVariable Long id,
            @RequestBody Planificacion planificacion) {
        return planificacionService.obtenerPorId(id)
                .map(p -> {
                    planificacion.setId(id);
                    return ResponseEntity.ok(planificacionService.guardar(planificacion));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/copiar")
    public ResponseEntity<Planificacion> copiar(@PathVariable Long id) {
        return ResponseEntity.ok(planificacionService.copiar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        planificacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enviar")
    public ResponseEntity<String> enviar(@PathVariable Long id) {
        try {
            Planificacion plan = planificacionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Planificacion no encontrada"));
            emailService.enviarPlanificacion(plan);
            plan.setEstado("ENVIADA");
            plan.setEnviadoAt(java.time.LocalDateTime.now());
            planificacionRepository.save(plan);
            return ResponseEntity.ok("Mail enviado correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al enviar: " + e.getMessage());
        }
    }
}