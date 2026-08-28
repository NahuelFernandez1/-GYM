package com.masgym.api.dto;

import com.masgym.api.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String nombre;
    private String email;
    private Rol rol;
}
