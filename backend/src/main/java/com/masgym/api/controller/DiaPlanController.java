package com.masgym.api.controller;

import com.masgym.api.model.DiaPlan;
import com.masgym.api.repository.DiaPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dias")
@RequiredArgsConstructor
public class DiaPlanController {

    private final DiaPlanRepository diaPlanRepository;

    @GetMapping("/semana/{semanaId}")
    public ResponseEntity<List<DiaPlan>> obtenerPorSemana(@PathVariable Long semanaId) {
        return ResponseEntity.ok(
                diaPlanRepository.findBySemanaPlanId(semanaId)
        );
    }

    @PostMapping
    public ResponseEntity<DiaPlan> crear(@RequestBody DiaPlan dia) {
        return ResponseEntity.ok(diaPlanRepository.save(dia));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        diaPlanRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}