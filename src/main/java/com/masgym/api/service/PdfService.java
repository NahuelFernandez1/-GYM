package com.masgym.api.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.masgym.api.model.*;
import com.masgym.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final SemanaPlanRepository semanaPlanRepository;
    private final DiaPlanRepository diaPlanRepository;
    private final EjercicioPlanificadoRepository ejercicioPlanificadoRepository;
    private final EjercicioFijoPlanRepository ejercicioFijoPlanRepository;

    private static class FilaFuerza {
        String circuito;
        String nombreEjercicio;
        String notas;
        Integer series;
        List<String> valoresPorSemana;
    }

    private static final BaseColor VERDE_OSCURO = new BaseColor(27, 94, 32);
    private static final BaseColor VERDE_MEDIO = new BaseColor(46, 125, 50);
    private static final BaseColor VERDE_CLARO = new BaseColor(232, 245, 233);
    private static final BaseColor GRIS = new BaseColor(245, 245, 245);

    public byte[] generarPdf(Planificacion plan) throws Exception {
        Document document = new Document(PageSize.A4, 24, 24, 16, 16);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);
        document.open();

        Font fuenteSubtitulo = new Font(Font.FontFamily.HELVETICA, 9.5f, Font.NORMAL, VERDE_OSCURO);
        Font fuenteAlumno = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, VERDE_OSCURO);
        Font fuenteNormal = new Font(Font.FontFamily.HELVETICA, 8.5f, Font.NORMAL, BaseColor.DARK_GRAY);
        Font fuenteBold = new Font(Font.FontFamily.HELVETICA, 8.5f, Font.BOLD, BaseColor.DARK_GRAY);
        Font fuenteBlanco = new Font(Font.FontFamily.HELVETICA, 8.5f, Font.BOLD, BaseColor.WHITE);
        Font fuenteVerde = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, VERDE_OSCURO);

        // Header: logo + subtítulo
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{1f, 2.2f});

        byte[] logoBytes = new ClassPathResource("images/logo-masgym.png").getInputStream().readAllBytes();
        Image logo = Image.getInstance(logoBytes);
        logo.scaleToFit(75, 30);
        PdfPCell logoCell = new PdfPCell(logo, false);
        logoCell.setBorder(Rectangle.NO_BORDER);
        logoCell.setPadding(4);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        header.addCell(logoCell);

        PdfPCell subtituloCell = new PdfPCell(new Phrase("Plan de entrenamiento", fuenteSubtitulo));
        subtituloCell.setBorder(Rectangle.NO_BORDER);
        subtituloCell.setPadding(4);
        subtituloCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        subtituloCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        header.addCell(subtituloCell);
        document.add(header);

        PdfPTable barra = new PdfPTable(1);
        barra.setWidthPercentage(100);
        PdfPCell barraCell = new PdfPCell();
        barraCell.setBackgroundColor(VERDE_OSCURO);
        barraCell.setFixedHeight(3);
        barraCell.setBorder(Rectangle.NO_BORDER);
        barra.addCell(barraCell);
        document.add(barra);
        document.add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 4)));

        // Datos del alumno
        Alumno alumno = plan.getAlumno();
        String edadTexto = "-";
        if (alumno.getFechaNacimiento() != null) {
            int anios = Period.between(alumno.getFechaNacimiento(), LocalDate.now()).getYears();
            edadTexto = anios + " años";
        }

        PdfPTable datosTable = new PdfPTable(2);
        datosTable.setWidthPercentage(100);
        datosTable.setWidths(new float[]{1.5f, 1f});

        PdfPCell alumnoCell = new PdfPCell();
        alumnoCell.setBorderColor(VERDE_OSCURO);
        alumnoCell.setPadding(6);
        alumnoCell.setBackgroundColor(VERDE_CLARO);
        Paragraph alumnoInfo = new Paragraph();
        alumnoInfo.add(new Chunk(alumno.getNombre() + " " + alumno.getApellido() + "\n", fuenteAlumno));
        alumnoInfo.add(new Chunk("Edad: " + edadTexto + "\n", fuenteNormal));
        alumnoInfo.add(new Chunk("Objetivo: " + (alumno.getObjetivos() != null ? alumno.getObjetivos() : "-") + "\n", fuenteNormal));
        alumnoInfo.add(new Chunk("Notas: " + (alumno.getNotas() != null ? alumno.getNotas() : "-"), fuenteNormal));
        alumnoCell.addElement(alumnoInfo);
        datosTable.addCell(alumnoCell);

        PdfPCell vigenciaCell = new PdfPCell();
        vigenciaCell.setBorderColor(VERDE_OSCURO);
        vigenciaCell.setPadding(6);
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
        document.add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 4)));

        // Bloques fijos: Movilidad y Activación (una sola vez, iguales todas las semanas)
        agregarBloqueFijo(document, plan, TipoBloqueFijo.MOVILIDAD, "BLOQUE DE MOVILIDAD",
                fuenteBlanco, fuenteNormal, fuenteBold, GRIS);
        agregarBloqueFijo(document, plan, TipoBloqueFijo.ACTIVACION, "BLOQUE DE ACTIVACIÓN",
                fuenteBlanco, fuenteNormal, fuenteBold, GRIS);

        // Bloque de fuerza: agrupado por Día -> Circuito -> Ejercicio,
        // con la progresión de cada semana en una sola fila (REP/RIR: 7(5)-8(4)-...)
        List<SemanaPlan> semanas = semanaPlanRepository
                .findByPlanificacionIdOrderByNumeroSemanaAsc(plan.getId());

        PdfPTable bloqueFuerzaTitulo = new PdfPTable(1);
        bloqueFuerzaTitulo.setWidthPercentage(100);
        PdfPCell bloqueFuerzaCell = new PdfPCell(new Phrase("BLOQUE DE FUERZA", fuenteBlanco));
        bloqueFuerzaCell.setBackgroundColor(VERDE_OSCURO);
        bloqueFuerzaCell.setPadding(4);
        bloqueFuerzaCell.setBorder(Rectangle.NO_BORDER);
        bloqueFuerzaTitulo.addCell(bloqueFuerzaCell);
        document.add(bloqueFuerzaTitulo);

        // dia -> orden -> fila (agrupa la misma fila a través de las semanas)
        LinkedHashMap<String, LinkedHashMap<Integer, FilaFuerza>> porDia = new LinkedHashMap<>();

        for (int semanaIdx = 0; semanaIdx < semanas.size(); semanaIdx++) {
            SemanaPlan semana = semanas.get(semanaIdx);
            List<DiaPlan> dias = diaPlanRepository.findBySemanaPlanId(semana.getId());
            final int idx = semanaIdx;
            final int totalSemanas = semanas.size();

            for (DiaPlan dia : dias) {
                LinkedHashMap<Integer, FilaFuerza> filasDia =
                        porDia.computeIfAbsent(dia.getDiaSemana(), d -> new LinkedHashMap<>());

                List<EjercicioPlanificado> ejercicios = ejercicioPlanificadoRepository
                        .findByDiaPlanIdOrderByOrdenAsc(dia.getId());

                for (EjercicioPlanificado ep : ejercicios) {
                    FilaFuerza fila = filasDia.computeIfAbsent(ep.getOrden(), o -> {
                        FilaFuerza f = new FilaFuerza();
                        f.circuito = ep.getCircuito();
                        f.nombreEjercicio = ep.getEjercicio().getNombre();
                        f.notas = ep.getNotas();
                        f.series = ep.getSeries();
                        f.valoresPorSemana = new ArrayList<>(Collections.nCopies(totalSemanas, "-"));
                        return f;
                    });
                    String rir = ep.getRir() != null && !ep.getRir().isBlank() ? "(" + ep.getRir() + ")" : "";
                    fila.valoresPorSemana.set(idx, ep.getRepeticiones() + rir);
                }
            }
        }

        for (Map.Entry<String, LinkedHashMap<Integer, FilaFuerza>> diaEntry : porDia.entrySet()) {
            PdfPTable tituloDiaTabla = new PdfPTable(1);
            tituloDiaTabla.setWidthPercentage(100);
            tituloDiaTabla.setSpacingBefore(4);
            tituloDiaTabla.setSpacingAfter(2);
            PdfPCell tituloDiaCell = new PdfPCell(new Phrase(diaEntry.getKey(), fuenteVerde));
            tituloDiaCell.setBackgroundColor(VERDE_CLARO);
            tituloDiaCell.setPadding(4);
            tituloDiaCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            tituloDiaCell.setBorderColor(VERDE_OSCURO);
            tituloDiaTabla.addCell(tituloDiaCell);
            document.add(tituloDiaTabla);

            // Agrupar las filas del día por circuito, preservando el orden de aparición
            LinkedHashMap<String, List<FilaFuerza>> porCircuito = new LinkedHashMap<>();
            for (FilaFuerza fila : diaEntry.getValue().values()) {
                String circuito = fila.circuito != null && !fila.circuito.isBlank() ? fila.circuito : "—";
                porCircuito.computeIfAbsent(circuito, c -> new ArrayList<>()).add(fila);
            }

            for (Map.Entry<String, List<FilaFuerza>> circuitoEntry : porCircuito.entrySet()) {
                List<FilaFuerza> filas = circuitoEntry.getValue();
                Integer seriesCircuito = filas.get(0).series;
                String tituloCircuito = circuitoEntry.getKey() +
                        (seriesCircuito != null ? " (" + seriesCircuito + " series)" : "");

                Paragraph pCircuito = new Paragraph(tituloCircuito, fuenteBold);
                pCircuito.setSpacingBefore(2);
                pCircuito.setSpacingAfter(1);
                document.add(pCircuito);

                PdfPTable tabla = new PdfPTable(2);
                tabla.setWidthPercentage(100);
                tabla.setWidths(new float[]{2.5f, 3.5f});

                boolean filaAlterna = false;
                for (FilaFuerza fila : filas) {
                    BaseColor bgColor = filaAlterna ? GRIS : BaseColor.WHITE;

                    String textoEjercicio = fila.nombreEjercicio;
                    if (fila.notas != null && !fila.notas.isBlank()) {
                        textoEjercicio += " (" + fila.notas.trim() + ")";
                    }
                    PdfPCell c1 = new PdfPCell(new Phrase(textoEjercicio, fuenteBold));
                    c1.setBackgroundColor(bgColor); c1.setPadding(3);
                    tabla.addCell(c1);

                    String valores = String.join("-", fila.valoresPorSemana);
                    PdfPCell c2 = new PdfPCell(new Phrase("REP/RIR: " + valores, fuenteNormal));
                    c2.setBackgroundColor(bgColor); c2.setPadding(3);
                    tabla.addCell(c2);

                    filaAlterna = !filaAlterna;
                }
                document.add(tabla);
            }
        }

        // Footer: línea de cierre + logo centrado, anclado cerca del final de la hoja
        Image footerLogo = Image.getInstance(logoBytes);
        footerLogo.scaleToFit(55, 22);
        float pageWidth = document.getPageSize().getWidth();
        float footerY = 26;
        float lineY = footerY + footerLogo.getScaledHeight() + 6;

        PdfContentByte cb = writer.getDirectContent();
        cb.setColorFill(VERDE_OSCURO);
        cb.rectangle(document.leftMargin(), lineY, pageWidth - document.leftMargin() - document.rightMargin(), 1.5f);
        cb.fill();

        footerLogo.setAbsolutePosition((pageWidth - footerLogo.getScaledWidth()) / 2, footerY);
        cb.addImage(footerLogo);

        document.close();
        return out.toByteArray();
    }

    private void agregarBloqueFijo(Document document, Planificacion plan, TipoBloqueFijo tipoBloque,
                                    String titulo, Font fuenteBlanco, Font fuenteNormal, Font fuenteBold,
                                    BaseColor gris) throws DocumentException {
        List<EjercicioFijoPlan> items = ejercicioFijoPlanRepository
                .findByPlanificacionIdAndTipoBloqueOrderByOrdenAsc(plan.getId(), tipoBloque);
        if (items.isEmpty()) return;

        PdfPTable tituloTabla = new PdfPTable(1);
        tituloTabla.setWidthPercentage(100);
        PdfPCell tituloCell = new PdfPCell(new Phrase(titulo, fuenteBlanco));
        tituloCell.setBackgroundColor(VERDE_OSCURO);
        tituloCell.setPadding(4);
        tituloCell.setBorder(Rectangle.NO_BORDER);
        tituloTabla.addCell(tituloCell);
        document.add(tituloTabla);

        PdfPTable tabla = new PdfPTable(3);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{0.4f, 3.6f, 1.6f});

        String[] headers = {"#", "Ejercicio", "Series/Repeticiones"};
        for (String h : headers) {
            PdfPCell headerCell = new PdfPCell(new Phrase(h, fuenteBlanco));
            headerCell.setBackgroundColor(VERDE_MEDIO);
            headerCell.setPadding(3);
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            tabla.addCell(headerCell);
        }

        boolean filaAlterna = false;
        for (EjercicioFijoPlan item : items) {
            BaseColor bgColor = filaAlterna ? gris : BaseColor.WHITE;

            PdfPCell c1 = new PdfPCell(new Phrase(String.valueOf(item.getOrden()), fuenteNormal));
            c1.setBackgroundColor(bgColor); c1.setPadding(3);
            c1.setHorizontalAlignment(Element.ALIGN_CENTER);
            tabla.addCell(c1);

            PdfPCell c2 = new PdfPCell(new Phrase(item.getEjercicio().getNombre(), fuenteBold));
            c2.setBackgroundColor(bgColor); c2.setPadding(3);
            tabla.addCell(c2);

            PdfPCell c3 = new PdfPCell(new Phrase(item.getSeriesReps() != null ? item.getSeriesReps() : "", fuenteNormal));
            c3.setBackgroundColor(bgColor); c3.setPadding(3);
            c3.setHorizontalAlignment(Element.ALIGN_CENTER);
            tabla.addCell(c3);

            filaAlterna = !filaAlterna;
        }
        document.add(tabla);
        document.add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 3)));
    }
}