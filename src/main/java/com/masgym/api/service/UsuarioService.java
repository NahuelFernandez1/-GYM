package com.masgym.api.service;

import com.masgym.api.model.Usuario;
import java.util.List;
import java.util.Optional;

public interface UsuarioService {
    List<Usuario> obtenerTodos();
    Optional<Usuario> obtenerPorId(Long id);
    Optional<Usuario> obtenerPorEmail(String email);
    Usuario guardar(Usuario usuario);
    void eliminar(Long id);
}