package com.masgym.api.controller;

import com.masgym.api.model.EjercicioPlanificado;
import com.masgym.api.repository.EjercicioPlanificadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ejercicios-planificados")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EjercicioPlanificadoController {

    private final EjercicioPlanificadoRepository ejercicioPlanificadoRepository;

    @GetMapping("/dia/{diaId}")
    public ResponseEntity<List<EjercicioPlanificado>> obtenerPorDia(@PathVariable Long diaId) {
        return ResponseEntity.ok(
                ejercicioPlanificadoRepository.findByDiaPlanIdOrderByOrdenAsc(diaId)
        );
    }

    @PostMapping
    public ResponseEntity<EjercicioPlanificado> crear(@RequestBody EjercicioPlanificado ejercicio) {
        return ResponseEntity.ok(ejercicioPlanificadoRepository.save(ejercicio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EjercicioPlanificado> actualizar(
            @PathVariable Long id,
            @RequestBody EjercicioPlanificado ejercicio) {
        ejercicio.setId(id);
        return ResponseEntity.ok(ejercicioPlanificadoRepository.save(ejercicio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ejercicioPlanificadoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
