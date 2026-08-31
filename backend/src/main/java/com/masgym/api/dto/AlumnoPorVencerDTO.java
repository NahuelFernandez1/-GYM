package com.masgym.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AlumnoPorVencerDTO {
    private Long alumnoId;
    private String nombreCompleto;
    private LocalDate fechaVencimientoCuota;
    private long diasRestantes;
    private boolean vencido;
}
