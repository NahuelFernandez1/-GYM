package com.masgym.api.controller;

import com.masgym.api.model.EjercicioFijoPlan;
import com.masgym.api.repository.EjercicioFijoPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ejercicios-fijos-plan")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EjercicioFijoPlanController {

    private final EjercicioFijoPlanRepository ejercicioFijoPlanRepository;

    @GetMapping("/planificacion/{planificacionId}")
    public ResponseEntity<List<EjercicioFijoPlan>> obtenerPorPlanificacion(@PathVariable Long planificacionId) {
        return ResponseEntity.ok(
                ejercicioFijoPlanRepository.findByPlanificacionIdOrderByOrdenAsc(planificacionId)
        );
    }

    @PostMapping
    public ResponseEntity<EjercicioFijoPlan> crear(@RequestBody EjercicioFijoPlan ejercicioFijoPlan) {
        return ResponseEntity.ok(ejercicioFijoPlanRepository.save(ejercicioFijoPlan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EjercicioFijoPlan> actualizar(
            @PathVariable Long id,
            @RequestBody EjercicioFijoPlan ejercicioFijoPlan) {
        ejercicioFijoPlan.setId(id);
        return ResponseEntity.ok(ejercicioFijoPlanRepository.save(ejercicioFijoPlan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ejercicioFijoPlanRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
