package com.masgym.api.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.masgym.api.model.*;
import com.masgym.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final SemanaPlanRepository semanaPlanRepository;
    private final DiaPlanRepository diaPlanRepository;
    private final EjercicioPlanificadoRepository ejercicioPlanificadoRepository;

    private static final BaseColor VERDE_OSCURO = new BaseColor(27, 94, 32);
    private static final BaseColor VERDE_CLARO = new BaseColor(232, 245, 233);
    private static final BaseColor AMARILLO = new BaseColor(249, 168, 37);
    private static final BaseColor GRIS = new BaseColor(245, 245, 245);

    public byte[] generarPdf(Planificacion plan) throws Exception {
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        Font fuenteTitulo = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, BaseColor.WHITE);
        Font fuenteSubtitulo = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, AMARILLO);
        Font fuenteAlumno = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, VERDE_OSCURO);
        Font fuenteNormal = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.DARK_GRAY);
        Font fuenteBold = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.DARK_GRAY);
        Font fuenteBlanco = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
        Font fuenteVerde = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, VERDE_OSCURO);

        // Header
        PdfPTable header = new PdfPTable(1);
        header.setWidthPercentage(100);
        PdfPCell headerCell = new PdfPCell();
        headerCell.setBackgroundColor(VERDE_OSCURO);
        headerCell.setPadding(12);
        headerCell.setBorder(Rectangle.NO_BORDER);
        Paragraph headerContent = new Paragraph();
        headerContent.add(new Chunk("MASGYM\n", fuenteTitulo));
        headerContent.add(new Chunk("Plan de entrenamiento", fuenteSubtitulo));
        headerCell.addElement(headerContent);
        header.addCell(headerCell);
        document.add(header);
        document.add(Chunk.NEWLINE);

        // Datos del alumno
        Alumno alumno = plan.getAlumno();
        PdfPTable datosTable = new PdfPTable(2);
        datosTable.setWidthPercentage(100);
        datosTable.setWidths(new float[]{1.5f, 1f});

        PdfPCell alumnoCell = new PdfPCell();
        alumnoCell.setBorderColor(VERDE_OSCURO);
        alumnoCell.setPadding(10);
        alumnoCell.setBackgroundColor(VERDE_CLARO);
        Paragraph alumnoInfo = new Paragraph();
        alumnoInfo.add(new Chunk(alumno.getNombre() + " " + alumno.getApellido() + "\n", fuenteAlumno));
        alumnoInfo.add(new Chunk("Email: " + alumno.getEmail() + "\n", fuenteNormal));
        alumnoInfo.add(new Chunk("Teléfono: " + (alumno.getTelefono() != null ? alumno.getTelefono() : "-"), fuenteNormal));
        alumnoCell.addElement(alumnoInfo);
        datosTable.addCell(alumnoCell);

        PdfPCell vigenciaCell = new PdfPCell();
        vigenciaCell.setBorderColor(VERDE_OSCURO);
        vigenciaCell.setPadding(10);
        vigenciaCell.setBackgroundColor(VERDE_CLARO);
        vigenciaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph vigenciaInfo = new Paragraph();
        vigenciaInfo.add(new Chunk("Entrenador: MASGYM\n", fuenteBold));
        vigenciaInfo.add(new Chunk("Plan: " + plan.getNombre() + "\n", fuenteNormal));
        vigenciaInfo.add(new Chunk("Vigencia: " + plan.getFechaInicio() + " — " +
                (plan.getFechaFin() != null ? plan.getFechaFin() : "Sin fecha"), fuenteNormal));
        vigenciaCell.addElement(vigenciaInfo);
        datosTable.addCell(vigenciaCell);
        document.add(datosTable);
        document.add(Chunk.NEWLINE);

        // Semanas y días
        List<SemanaPlan> semanas = semanaPlanRepository
                .findByPlanificacionIdOrderByNumeroSemanaAsc(plan.getId());

        for (SemanaPlan semana : semanas) {
            // Título semana
            PdfPTable semanaTable = new PdfPTable(1);
            semanaTable.setWidthPercentage(100);
            PdfPCell semanaCell = new PdfPCell(new Phrase("Semana " + semana.getNumeroSemana(), fuenteBlanco));
            semanaCell.setBackgroundColor(VERDE_OSCURO);
            semanaCell.setPadding(8);
            semanaCell.setBorder(Rectangle.NO_BORDER);
            semanaTable.addCell(semanaCell);
            document.add(semanaTable);
            document.add(Chunk.NEWLINE);

            List<DiaPlan> dias = diaPlanRepository.findBySemanaPlanId(semana.getId());
            int numeroDia = 1;

            for (DiaPlan dia : dias) {
                // Título día
                Paragraph tituloDia = new Paragraph(numeroDia + " — " + dia.getDiaSemana(), fuenteVerde);
                tituloDia.setSpacingBefore(6);
                tituloDia.setSpacingAfter(4);
                document.add(tituloDia);

                List<EjercicioPlanificado> ejercicios = ejercicioPlanificadoRepository
                        .findByDiaPlanIdOrderByOrdenAsc(dia.getId());

                if (!ejercicios.isEmpty()) {
                    PdfPTable tabla = new PdfPTable(6);
                    tabla.setWidthPercentage(100);
                    tabla.setWidths(new float[]{0.5f, 2.5f, 0.8f, 0.8f, 0.8f, 2f});

                    // Headers tabla
                    String[] headers = {"#", "Ejercicio", "Series", "Reps", "Peso", "Notas"};
                    for (String h : headers) {
                        PdfPCell cell = new PdfPCell(new Phrase(h, fuenteBlanco));
                        cell.setBackgroundColor(new BaseColor(46, 125, 50));
                        cell.setPadding(6);
                        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        tabla.addCell(cell);
                    }

                    // Filas ejercicios
                    boolean fila = false;
                    for (EjercicioPlanificado ep : ejercicios) {
                        BaseColor bgColor = fila ? GRIS : BaseColor.WHITE;

                        PdfPCell c1 = new PdfPCell(new Phrase(String.valueOf(ep.getOrden()), fuenteNormal));
                        c1.setBackgroundColor(bgColor); c1.setPadding(5);
                        c1.setHorizontalAlignment(Element.ALIGN_CENTER);
                        tabla.addCell(c1);

                        PdfPCell c2 = new PdfPCell(new Phrase(ep.getEjercicio().getNombre(), fuenteBold));
                        c2.setBackgroundColor(bgColor); c2.setPadding(5);
                        tabla.addCell(c2);

                        PdfPCell c3 = new PdfPCell(new Phrase(String.valueOf(ep.getSeries()), fuenteNormal));
                        c3.setBackgroundColor(bgColor); c3.setPadding(5);
                        c3.setHorizontalAlignment(Element.ALIGN_CENTER);
                        tabla.addCell(c3);

                        PdfPCell c4 = new PdfPCell(new Phrase(String.valueOf(ep.getRepeticiones()), fuenteNormal));
                        c4.setBackgroundColor(bgColor); c4.setPadding(5);
                        c4.setHorizontalAlignment(Element.ALIGN_CENTER);
                        tabla.addCell(c4);

                        PdfPCell c5 = new PdfPCell(new Phrase(ep.getPesoKg() != null ? ep.getPesoKg() + " kg" : "—", fuenteNormal));
                        c5.setBackgroundColor(bgColor); c5.setPadding(5);
                        c5.setHorizontalAlignment(Element.ALIGN_CENTER);
                        tabla.addCell(c5);

                        PdfPCell c6 = new PdfPCell(new Phrase(ep.getNotas() != null ? ep.getNotas() : "", fuenteNormal));
                        c6.setBackgroundColor(bgColor); c6.setPadding(5);
                        tabla.addCell(c6);

                        fila = !fila;
                    }
                    document.add(tabla);
                }
                document.add(Chunk.NEWLINE);
                numeroDia++;
            }
        }

        // Footer
        PdfPTable footer = new PdfPTable(1);
        footer.setWidthPercentage(100);
        PdfPCell footerCell = new PdfPCell();
        footerCell.setBackgroundColor(VERDE_OSCURO);
        footerCell.setPadding(10);
        footerCell.setBorder(Rectangle.NO_BORDER);
        footerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        footerCell.addElement(new Paragraph("💪 MASGYM — Seguí entrenando fuerte", fuenteBlanco));
        footer.addCell(footerCell);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }
}