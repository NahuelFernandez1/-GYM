package com.masgym.api.controller;

import com.masgym.api.model.Ejercicio;
import com.masgym.api.service.EjercicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ejercicios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EjercicioController {

    private final EjercicioService ejercicioService;

    @GetMapping
    public ResponseEntity<List<Ejercicio>> obtenerTodos() {
        return ResponseEntity.ok(ejercicioService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ejercicio> obtenerPorId(@PathVariable Long id) {
        return ejercicioService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Ejercicio>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(ejercicioService.buscarPorNombre(nombre));
    }

    @GetMapping("/patron/{patronMovimiento}")
    public ResponseEntity<List<Ejercicio>> obtenerPorPatron(@PathVariable String patronMovimiento) {
        return ResponseEntity.ok(ejercicioService.obtenerPorPatronMovimiento(patronMovimiento));
    }

    @PostMapping
    public ResponseEntity<Ejercicio> crear(@RequestBody Ejercicio ejercicio) {
        return ResponseEntity.ok(ejercicioService.guardar(ejercicio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ejercicio> actualizar(@PathVariable Long id, @RequestBody Ejercicio ejercicio) {
        return ejercicioService.obtenerPorId(id)
                .map(e -> {
                    ejercicio.setId(id);
                    return ResponseEntity.ok(ejercicioService.guardar(ejercicio));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ejercicioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}