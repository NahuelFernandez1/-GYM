package com.masgym.api.exception;

import lombok.Getter;

@Getter
public class AlumnoConDatosAsociadosException extends RuntimeException {

    private final long cantidadPlanificaciones;
    private final long cantidadPagos;

    public AlumnoConDatosAsociadosException(String mensaje, long cantidadPlanificaciones, long cantidadPagos) {
        super(mensaje);
        this.cantidadPlanificaciones = cantidadPlanificaciones;
        this.cantidadPagos = cantidadPagos;
    }
}
