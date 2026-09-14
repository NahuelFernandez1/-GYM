package com.masgym.api.controller;

import com.masgym.api.dto.LoginRequest;
import com.masgym.api.dto.LoginResponse;
import com.masgym.api.model.Usuario;
import com.masgym.api.repository.UsuarioRepository;
import com.masgym.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    // Devuelve el 401 directamente (no lo tira como excepcion) porque si lo
    // tiramos, Spring Security lo intercepta con el authenticationEntryPoint
    // generico ("No autenticado...") y pisa este mensaje especifico.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Email o contraseña incorrectos"));
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Email o contraseña incorrectos"));
        }

        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name());
        return ResponseEntity.ok(new LoginResponse(token, usuario.getNombre(), usuario.getEmail(), usuario.getRol()));
    }
}
