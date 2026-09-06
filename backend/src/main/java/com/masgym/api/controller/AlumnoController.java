package com.masgym.api.controller;

import com.masgym.api.model.Alumno;
import com.masgym.api.service.AlumnoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/alumnos")
@RequiredArgsConstructor
public class AlumnoController {

    private final AlumnoService alumnoService;

    @GetMapping
    public ResponseEntity<List<Alumno>> obtenerTodos() {
        return ResponseEntity.ok(alumnoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alumno> obtenerPorId(@PathVariable Long id) {
        return alumnoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Alumno>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(alumnoService.obtenerPorEstado(estado));
    }

    @GetMapping("/activos/count")
    public ResponseEntity<Long> contarActivos() {
        return ResponseEntity.ok(alumnoService.contarActivos());
    }

    @PostMapping
    public ResponseEntity<Alumno> crear(@RequestBody Alumno alumno) {
        return ResponseEntity.ok(alumnoService.guardar(alumno));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Alumno> actualizar(@PathVariable Long id, @RequestBody Alumno alumno) {
        return alumnoService.obtenerPorId(id)
                .map(a -> {
                    alumno.setId(id);
                    return ResponseEntity.ok(alumnoService.guardar(alumno));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        alumnoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}