package com.masgym.api.exception;

import com.masgym.api.service.ErrorAlertService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final ErrorAlertService errorAlertService;

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "No se pudo guardar: el dato ya existe o falta un campo obligatorio."));
    }

    @ExceptionHandler(AlumnoConDatosAsociadosException.class)
    public ResponseEntity<Map<String, Object>> handleAlumnoConDatosAsociados(AlumnoConDatosAsociadosException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "ALUMNO_CON_DATOS_ASOCIADOS");
        body.put("mensaje", ex.getMessage());
        body.put("cantidadPlanificaciones", ex.getCantidadPlanificaciones());
        body.put("cantidadPagos", ex.getCantidadPagos());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "No tenés permiso para realizar esta acción."));
    }

    // Cualquier error no manejado por los handlers de arriba: se loguea, se le
    // avisa al admin por mail, y se le devuelve al cliente un 500 generico
    // (sin exponer detalles internos como stack traces).
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenerico(Exception ex, HttpServletRequest request) {
        log.error("Error no manejado en {}", request.getRequestURI(), ex);
        errorAlertService.notificarErrorBackend(request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Ocurrió un error inesperado. Ya le avisamos al equipo técnico."));
    }
}
