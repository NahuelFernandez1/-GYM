package com.masgym.api.dto;

import lombok.Data;

@Data
public class ReporteErrorRequest {
    private String mensaje;
    private String stack;
    private String url;
    private String userAgent;
}
