package com.masgym.api.service;

import com.masgym.api.model.*;
import com.masgym.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final PdfService pdfService;
    private final SemanaPlanRepository semanaPlanRepository;
    private final DiaPlanRepository diaPlanRepository;
    private final EjercicioPlanificadoRepository ejercicioPlanificadoRepository;

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

        mailSender.send(message);
    }

    private String generarHtml(Planificacion plan) {
        Alumno alumno = plan.getAlumno();
        StringBuilder html = new StringBuilder();

        html.append("""
            <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #ddd;">
            <div style="background-color: #1b5e20; padding: 12px 20px;">
                <span style="color: white; font-size: 22px; font-weight: bold;">MASGYM</span>
                <span style="color: #f9a825; font-size: 13px; margin-left: 10px;">Plan de entrenamiento</span>
            </div>
            <div style="padding: 16px 20px; background: #f9f9f9; border-bottom: 2px solid #1b5e20;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1b5e20;">
            """);
        html.append(alumno.getNombre()).append(" ").append(alumno.getApellido());
        html.append("""
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #555;">
                    <strong>Vigencia:</strong> 
            """);
        html.append(plan.getFechaInicio()).append(" — ").append(plan.getFechaFin() != null ? plan.getFechaFin() : "Sin fecha fin");
        html.append("""
                </p>
            </div>
            <div style="padding: 20px;">
                <p style="color: #555;">Hola <strong>
            """);
        html.append(alumno.getNombre());
        html.append("""
                </strong>, adjunto encontrás tu planificación de entrenamiento en PDF.</p>
                <p style="color: #555;">También podés verla directamente en este mail:</p>
            """);

        List<SemanaPlan> semanas = semanaPlanRepository
                .findByPlanificacionIdOrderByNumeroSemanaAsc(plan.getId());

        for (SemanaPlan semana : semanas) {
            html.append("<h3 style='color: #2e7d32; border-bottom: 2px solid #2e7d32; padding-bottom: 5px;'>Semana ")
                    .append(semana.getNumeroSemana()).append("</h3>");

            List<DiaPlan> dias = diaPlanRepository.findBySemanaPlanId(semana.getId());
            int numeroDia = 1;

            for (DiaPlan dia : dias) {
                html.append("<div style='background: white; border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid #2e7d32;'>")
                        .append("<h4 style='color: #1b5e20; margin: 0 0 10px 0;'>")
                        .append(numeroDia).append(" — ").append(dia.getDiaSemana())
                        .append("</h4>");

                List<EjercicioPlanificado> ejercicios = ejercicioPlanificadoRepository
                        .findByDiaPlanIdOrderByOrdenAsc(dia.getId());

                html.append("<table style='width: 100%; border-collapse: collapse; font-size: 13px;'>")
                        .append("<tr style='background: #e8f5e9;'>")
                        .append("<th style='padding: 8px; text-align: left; border: 1px solid #ddd;'>#</th>")
                        .append("<th style='padding: 8px; text-align: left; border: 1px solid #ddd;'>Ejercicio</th>")
                        .append("<th style='padding: 8px; text-align: center; border: 1px solid #ddd;'>Series</th>")
                        .append("<th style='padding: 8px; text-align: center; border: 1px solid #ddd;'>Reps</th>")
                        .append("<th style='padding: 8px; text-align: center; border: 1px solid #ddd;'>Peso</th>")
                        .append("<th style='padding: 8px; text-align: left; border: 1px solid #ddd;'>Notas</th>")
                        .append("</tr>");

                for (EjercicioPlanificado ep : ejercicios) {
                    html.append("<tr style='border: 1px solid #ddd;'>")
                            .append("<td style='padding: 8px; border: 1px solid #ddd; text-align: center; color: #888;'>").append(ep.getOrden()).append("</td>")
                            .append("<td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>").append(ep.getEjercicio().getNombre()).append("</td>")
                            .append("<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>").append(ep.getSeries()).append("</td>")
                            .append("<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>").append(ep.getRepeticiones()).append("</td>")
                            .append("<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>").append(ep.getPesoKg() != null ? ep.getPesoKg() + " kg" : "—").append("</td>")
                            .append("<td style='padding: 8px; border: 1px solid #ddd; color: #555; font-size: 12px;'>").append(ep.getNotas() != null ? ep.getNotas() : "").append("</td>")
                            .append("</tr>");
                }

                html.append("</table></div>");
                numeroDia++;
            }
        }

        html.append("""
            </div>
            <div style="background-color: #1b5e20; padding: 16px; text-align: center;">
                <p style="color: white; margin: 0; font-size: 14px;">💪 MASGYM — Seguí entrenando fuerte</p>
                <p style="color: #f9a825; margin: 4px 0; font-size: 12px;">Este mail fue generado automáticamente</p>
            </div>
            </div>
            """);

        return html.toString();
    }
}