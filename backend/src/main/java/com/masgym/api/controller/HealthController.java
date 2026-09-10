package com.masgym.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Responde 200 en "/" sin autenticacion: Render (y cualquier balanceador)
// pega aca para el health check del deploy.
@RestController
public class HealthController {

    @GetMapping("/")
    public String health() {
        return "OK";
    }
}
