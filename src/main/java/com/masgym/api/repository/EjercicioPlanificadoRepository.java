package com.masgym.api.repository;

import com.masgym.api.model.EjercicioPlanificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EjercicioPlanificadoRepository extends JpaRepository<EjercicioPlanificado, Long> {
    List<EjercicioPlanificado> findByDiaPlanIdOrderByOrdenAsc(Long diaPlanId);
    void deleteByDiaPlanId(Long diaPlanId);
}