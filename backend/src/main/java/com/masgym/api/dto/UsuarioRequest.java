package com.masgym.api.dto;

import com.masgym.api.model.Rol;
import lombok.Data;

/**
 * Body para crear/editar un Usuario desde /api/usuarios.
 * `password` es texto plano y solo se usa para hashearla; nunca se persiste tal cual.
 * En una edición, si viene null/vacía se conserva la password actual.
 */
@Data
public class UsuarioRequest {
    private String nombre;
    private String email;
    private String password;
    private Rol rol;
    private Boolean activo;
}
