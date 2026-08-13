package com.masgym.api.repository;

import com.masgym.api.model.Objetivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ObjetivoRepository extends JpaRepository<Objetivo, Long> {
    List<Objetivo> findByAlumnoId(Long alumnoId);
}