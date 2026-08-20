package com.masgym.api.controller;

import com.masgym.api.model.DiaPlan;
import com.masgym.api.model.EjercicioPlanificado;
import com.masgym.api.model.SemanaPlan;
import com.masgym.api.repository.DiaPlanRepository;
import com.masgym.api.repository.EjercicioPlanificadoRepository;
import com.masgym.api.repository.SemanaPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/semanas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SemanaPlanController {

    private final SemanaPlanRepository semanaPlanRepository;
    private final DiaPlanRepository diaPlanRepository;
    private final EjercicioPlanificadoRepository ejercicioPlanificadoRepository;

    @GetMapping("/planificacion/{planId}")
    public ResponseEntity<List<SemanaPlan>> obtenerPorPlanificacion(@PathVariable Long planId) {
        return ResponseEntity.ok(
                semanaPlanRepository.findByPlanificacionIdOrderByNumeroSemanaAsc(planId)
        );
    }

    @PostMapping
    public ResponseEntity<SemanaPlan> crear(@RequestBody SemanaPlan semana) {
        return ResponseEntity.ok(semanaPlanRepository.save(semana));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SemanaPlan> actualizar(@PathVariable Long id, @RequestBody SemanaPlan semana) {
        semana.setId(id);
        return ResponseEntity.ok(semanaPlanRepository.save(semana));
    }

    @PostMapping("/{id}/copiar")
    @Transactional
    public ResponseEntity<SemanaPlan> copiar(@PathVariable Long id) {
        SemanaPlan original = semanaPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Semana no encontrada"));

        SemanaPlan copia = new SemanaPlan();
        copia.setPlanificacion(original.getPlanificacion());
        copia.setNumeroSemana(original.getNumeroSemana() + 1);
        copia.setNotas(original.getNotas());
        SemanaPlan semanaGuardada = semanaPlanRepository.save(copia);

        List<DiaPlan> dias = diaPlanRepository.findBySemanaPlanId(id);
        for (DiaPlan dia : dias) {
            DiaPlan nuevoDia = new DiaPlan();
            nuevoDia.setSemanaPlan(semanaGuardada);
            nuevoDia.setDiaSemana(dia.getDiaSemana());
            nuevoDia.setNotas(dia.getNotas());
            DiaPlan diaGuardado = diaPlanRepository.save(nuevoDia);

            List<EjercicioPlanificado> ejercicios = ejercicioPlanificadoRepository
                    .findByDiaPlanIdOrderByOrdenAsc(dia.getId());
            for (EjercicioPlanificado ep : ejercicios) {
                EjercicioPlanificado nuevoEp = new EjercicioPlanificado();
                nuevoEp.setDiaPlan(diaGuardado);
                nuevoEp.setEjercicio(ep.getEjercicio());
                nuevoEp.setOrden(ep.getOrden());
                nuevoEp.setCircuito(ep.getCircuito());
                nuevoEp.setSeries(ep.getSeries());
                nuevoEp.setRepeticiones(ep.getRepeticiones());
                nuevoEp.setPesoKg(ep.getPesoKg());
                nuevoEp.setNotas(ep.getNotas());
                nuevoEp.setRir(ep.getRir());
                ejercicioPlanificadoRepository.save(nuevoEp);
            }

        }
        return ResponseEntity.ok(semanaGuardada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        semanaPlanRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}