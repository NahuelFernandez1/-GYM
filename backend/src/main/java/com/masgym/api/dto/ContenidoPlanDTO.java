package com.masgym.api.dto;

import com.masgym.api.model.TipoBloqueFijo;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * Todo lo que se arma en la pantalla de detalle del plan: bloques fijos y dias con
 * sus ejercicios. La pantalla lo manda entero al tocar "Guardar" y se guarda todo
 * junto (o nada, si algo esta mal).
 */
@Data
public class ContenidoPlanDTO {

    private List<Fijo> ejerciciosFijos = new ArrayList<>();
    private List<Dia> dias = new ArrayList<>();

    @Data
    public static class Fijo {
        private TipoBloqueFijo tipoBloque;
        private Long ejercicioId;
        private String seriesReps;
    }

    @Data
    public static class Dia {
        private String diaSemana;
        private String notas;
        private List<EjercicioDia> ejercicios = new ArrayList<>();
    }

    @Data
    public static class EjercicioDia {
        private Long ejercicioId;
        private String circuito;
        private List<Semana> prescripciones = new ArrayList<>();
    }

    @Data
    public static class Semana {
        private Integer numeroSemana;
        private Integer series;
        private String reps;
        private String rir;
        private String notasPeso;
    }
}
