package com.masgym.api.repository;

import com.masgym.api.model.SemanaPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SemanaPlanRepository extends JpaRepository<SemanaPlan, Long> {
    List<SemanaPlan> findByPlanificacionIdOrderByNumeroSemanaAsc(Long planificacionId);
}