package com.masgym.api.controller;

import com.masgym.api.dto.ReporteErrorRequest;
import com.masgym.api.service.ErrorAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Recibe errores de JavaScript sin capturar que pasan en el navegador de un
 * usuario (fuera del alcance del backend). Publico: un error puede pasar
 * incluso antes de loguearse.
 */
@RestController
@RequestMapping("/api/errores")
@RequiredArgsConstructor
public class ErroresController {

    private final ErrorAlertService errorAlertService;

    @PostMapping("/reportar")
    public ResponseEntity<Void> reportar(@RequestBody ReporteErrorRequest request) {
        errorAlertService.notificarErrorFrontend(
                request.getMensaje(), request.getStack(), request.getUrl(), request.getUserAgent());
        return ResponseEntity.noContent().build();
    }
}
