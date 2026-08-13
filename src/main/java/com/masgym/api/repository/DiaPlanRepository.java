package com.masgym.api.repository;

import com.masgym.api.model.DiaPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiaPlanRepository extends JpaRepository<DiaPlan, Long> {
    List<DiaPlan> findBySemanaPlanId(Long semanaPlanId);
}