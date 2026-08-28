package com.masgym.api.config;

import com.masgym.api.model.Rol;
import com.masgym.api.model.Usuario;
import com.masgym.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crea el usuario ADMIN inicial si todavía no existe ninguno.
 * Las credenciales NO se hardcodean: vienen de las variables de entorno
 * ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NOMBRE. Si no están seteadas, no crea nada
 * (Dueño y Profesores se cargan después desde /api/usuarios, ya logueado como ADMIN).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.admin.nombre:Administrador}")
    private String adminNombre;

    @Override
    public void run(String... args) {
        if (usuarioRepository.existsByRol(Rol.ADMIN)) {
            return;
        }

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.warn("No existe ningún usuario ADMIN y no se seteó ADMIN_EMAIL/ADMIN_PASSWORD. " +
                    "Definí esas variables de entorno y reiniciá para crear el usuario inicial.");
            return;
        }

        Usuario admin = new Usuario();
        admin.setNombre(adminNombre);
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRol(Rol.ADMIN);
        admin.setActivo(true);
        usuarioRepository.save(admin);

        log.info("Usuario ADMIN inicial creado: {}", adminEmail);
    }
}
