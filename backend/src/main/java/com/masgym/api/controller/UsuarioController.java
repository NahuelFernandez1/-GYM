package com.masgym.api.controller;

import com.masgym.api.dto.UsuarioRequest;
import com.masgym.api.model.Usuario;
import com.masgym.api.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(usuarioService.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<Usuario> crear(@RequestBody UsuarioRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setRol(request.getRol());
        usuario.setActivo(request.getActivo() == null || request.getActivo());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        return ResponseEntity.ok(usuarioService.guardar(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id, @RequestBody UsuarioRequest request) {
        return usuarioService.obtenerPorId(id)
                .map(usuario -> {
                    if (request.getNombre() != null) usuario.setNombre(request.getNombre());
                    if (request.getEmail() != null) usuario.setEmail(request.getEmail());
                    if (request.getRol() != null) usuario.setRol(request.getRol());
                    if (request.getActivo() != null) usuario.setActivo(request.getActivo());
                    if (request.getPassword() != null && !request.getPassword().isBlank()) {
                        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                    }
                    return ResponseEntity.ok(usuarioService.guardar(usuario));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
