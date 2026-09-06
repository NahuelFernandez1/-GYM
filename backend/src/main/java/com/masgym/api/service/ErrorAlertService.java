package com.masgym.api.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manda un mail al admin cuando pasa un error real (500 del backend, o un
 * error sin capturar reportado por el frontend). Tiene un cooldown por
 * "firma" de error para no inundar el mail si el mismo error se repite
 * en loop (ej: un componente que renderiza mal en cada render).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ErrorAlertService {

    private static final Duration COOLDOWN = Duration.ofMinutes(10);
    private final Map<String, Instant> ultimoEnvioPorFirma = new ConcurrentHashMap<>();

    private final JavaMailSender mailSender;

    @Value("${app.alert.email:}")
    private String emailAlerta;

    public void notificarErrorBackend(String path, Throwable ex) {
        String firma = "backend:" + path + ":" + ex.getClass().getSimpleName();
        String detalle = resumirStackTrace(ex);
        enviar("Error en el servidor — " + ex.getClass().getSimpleName(), firma,
                "Ruta: " + path + "\n" +
                "Error: " + ex.getMessage() + "\n\n" +
                detalle);
    }

    public void notificarErrorFrontend(String mensaje, String stack, String url, String userAgent) {
        String firma = "frontend:" + url + ":" + mensaje;
        enviar("Error en el navegador de un usuario", firma,
                "URL: " + url + "\n" +
                "Navegador: " + userAgent + "\n" +
                "Mensaje: " + mensaje + "\n\n" +
                (stack != null ? stack : "(sin stack trace)"));
    }

    private void enviar(String asunto, String firma, String cuerpo) {
        if (emailAlerta == null || emailAlerta.isBlank()) {
            log.warn("ALERT_EMAIL no configurado, no se puede notificar error: {}", asunto);
            return;
        }

        Instant ultimo = ultimoEnvioPorFirma.get(firma);
        Instant ahora = Instant.now();
        if (ultimo != null && Duration.between(ultimo, ahora).compareTo(COOLDOWN) < 0) {
            log.info("Error repetido dentro del cooldown, no se reenvia mail: {}", firma);
            return;
        }
        ultimoEnvioPorFirma.put(firma, ahora);

        try {
            String hora = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                    .withZone(ZoneId.of("America/Argentina/Buenos_Aires"))
                    .format(ahora);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(emailAlerta);
            helper.setSubject("[MASGYM] " + asunto);
            helper.setText("Hora: " + hora + "\n\n" + cuerpo);
            mailSender.send(message);
        } catch (Exception mailEx) {
            log.error("No se pudo enviar el mail de alerta de error", mailEx);
        }
    }

    private String resumirStackTrace(Throwable ex) {
        StringBuilder sb = new StringBuilder();
        StackTraceElement[] elementos = ex.getStackTrace();
        int limite = Math.min(elementos.length, 15);
        for (int i = 0; i < limite; i++) {
            sb.append("  at ").append(elementos[i]).append("\n");
        }
        return sb.toString();
    }
}
