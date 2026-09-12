package com.masgym.api.controller;

import com.masgym.api.dto.LoginRequest;
import com.masgym.api.dto.LoginResponse;
import com.masgym.api.model.Usuario;
import com.masgym.api.repository.UsuarioRepository;
import com.masgym.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // DEBUG TEMPORAL: sacar despues de diagnosticar el login que falla desde el celu.
        log.info("LOGIN intento: email=[{}] (len={}) password len={}",
                request.getEmail(), request.getEmail() == null ? -1 : request.getEmail().length(),
                request.getPassword() == null ? -1 : request.getPassword().length());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            log.info("LOGIN fallo: {}", e.getMessage());
            throw new BadCredentialsException("Email o contraseña incorrectos");
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email o contraseña incorrectos"));

        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name());

        return ResponseEntity.ok(new LoginResponse(token, usuario.getNombre(), usuario.getEmail(), usuario.getRol()));
    }
}
