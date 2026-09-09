package com.masgym.api.service;

import com.masgym.api.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final PdfService pdfService;

    public void enviarPlanificacion(Planificacion planificacion) throws Exception {
        String html = generarHtml(planificacion);
        byte[] pdf = pdfService.generarPdf(planificacion);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(planificacion.getAlumno().getEmail());
        helper.setSubject("Tu planificación de entrenamiento - MASGYM");
        helper.setText(html, true);

        // Adjuntar PDF
        helper.addAttachment(
                "Planificacion_" + planificacion.getNombre().replace(" ", "_") + ".pdf",
                new org.springframework.core.io.ByteArrayResource(pdf)
        );

        // Logo embebido inline, referenciado en el HTML como cid:logoEmail.
        helper.addInline("logoEmail", new org.springframework.core.io.ClassPathResource("images/logo-masgym.png"));

        mailSender.send(message);
    }

    private String generarHtml(Planificacion plan) {
        Alumno alumno = plan.getAlumno();
        String fechaFin = plan.getFechaFin() != null ? plan.getFechaFin().toString() : "sin fecha de fin";

        String plantilla = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
            <meta charset="UTF-8">
            <title>Plan de entrenamiento - +GYM</title>
            </head>
            <body style="margin:0; padding:0; background-color:#fafafa; font-family: 'Segoe UI', Arial, sans-serif;">

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa; padding:40px 0;">
              <tr>
                <td align="center">

                  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;">

                    <tr>
                      <td align="center" style="padding-bottom:28px;">
                        <img src="{{LOGO_URL}}" alt="+GYM" width="90" style="display:block;">
                      </td>
                    </tr>

                    <tr>
                      <td style="border-top:3px solid #facc15; padding-bottom:24px;"></td>
                    </tr>

                    <tr>
                      <td>
                        <p style="margin:0 0 4px 0; color:#9ca3af; font-size:12px; text-transform:uppercase; letter-spacing:1px;">
                          Plan de entrenamiento
                        </p>
                        <h1 style="margin:0 0 20px 0; color:#111827; font-size:20px; font-weight:600;">
                          Hola {{NOMBRE_ALUMNO}}
                        </h1>

                        <p style="margin:0 0 16px 0; color:#374151; font-size:15px; line-height:1.6;">
                          Te compartimos tu nueva planificación, vigente del <strong>{{FECHA_INICIO}}</strong> al <strong>{{FECHA_FIN}}</strong>.
                        </p>

                        <p style="margin:0 0 28px 0; color:#374151; font-size:15px; line-height:1.6;">
                          El detalle completo — semanas, días y ejercicios — lo encontrás en el PDF adjunto a este mail.
                        </p>

                        <p style="margin:0; color:#6b7280; font-size:14px; line-height:1.6;">
                          Cualquier duda, consultá con tu profesor.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-top:40px;">
                        <p style="margin:0; color:#9ca3af; font-size:12px;">
                          +GYM — este mail fue generado automáticamente.
                        </p>
                      </td>
                    </tr>

                  </table>

                </td>
              </tr>
            </table>

            </body>
            </html>
            """;

        return plantilla
                .replace("{{LOGO_URL}}", "cid:logoEmail")
                .replace("{{NOMBRE_ALUMNO}}", alumno.getNombre())
                .replace("{{FECHA_INICIO}}", String.valueOf(plan.getFechaInicio()))
                .replace("{{FECHA_FIN}}", fechaFin);
    }
}