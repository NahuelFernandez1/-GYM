package com.masgym.api.repository;

import com.masgym.api.model.EjercicioFijoPlan;
import com.masgym.api.model.TipoBloqueFijo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EjercicioFijoPlanRepository extends JpaRepository<EjercicioFijoPlan, Long> {
    List<EjercicioFijoPlan> findByPlanificacionIdAndTipoBloqueOrderByOrdenAsc(Long planificacionId, TipoBloqueFijo tipoBloque);
    List<EjercicioFijoPlan> findByPlanificacionIdOrderByOrdenAsc(Long planificacionId);
    void deleteByPlanificacionId(Long planificacionId);
}
