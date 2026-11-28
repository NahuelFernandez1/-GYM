package com.masgym.api.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/** Fechas como se muestran en el PDF y en los mails: dd/mm/aaaa. */
public final class Fechas {

    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private Fechas() {}

    public static String formatear(LocalDate fecha, String siVacia) {
        return fecha != null ? fecha.format(FORMATO) : siVacia;
    }
}
