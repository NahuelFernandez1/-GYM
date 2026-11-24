package com.masgym.api.service;

import com.masgym.api.model.*;
import com.masgym.api.repository.DiaPlanRepository;
import com.masgym.api.repository.EjercicioPlanificadoRepository;
import com.masgym.api.repository.EjercicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Alta y edicion de ejercicios del bloque de fuerza. Un ejercicio se carga una sola
 * vez por dia y tiene una PrescripcionSemanal por cada semana del plan.
 */
@Service
@RequiredArgsConstructor
public class EjercicioPlanificadoService {

    private final EjercicioPlanificadoRepository ejercicioPlanificadoRepository;
    private final DiaPlanRepository diaPlanRepository;
    private final EjercicioRepository ejercicioRepository;

    /**
     * Crea el ejercicio con una prescripcion para cada semana del plan. Las semanas que
     * no vienen en el pedido arrancan con los mismos valores que la semana 1 (o la primera
     * que venga), como hacia antes "Duplicar semana".
     */
    @Transactional
    public EjercicioPlanificado crear(EjercicioPlanificado datos) {
        if (datos.getDiaPlan() == null || datos.getDiaPlan().getId() == null) {
            throw error(HttpStatus.BAD_REQUEST, "Falta el día del ejercicio.");
        }
        DiaPlan dia = diaPlanRepository.findById(datos.getDiaPlan().getId())
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Día no encontrado."));
        int semanas = dia.getPlanificacion().getCantidadSemanas();

        Map<Integer, PrescripcionSemanal> recibidas = porSemana(datos.getPrescripciones(), semanas);
        PrescripcionSemanal base = recibidas.containsKey(1) ? recibidas.get(1)
                : recibidas.values().stream().findFirst().orElse(null);

        EjercicioPlanificado ep = new EjercicioPlanificado();
        ep.setDiaPlan(dia);
        ep.setEjercicio(buscarEjercicio(datos.getEjercicio()));
        ep.setCircuito(textoONull(datos.getCircuito()));
        ep.setOrden(datos.getOrden() != null ? datos.getOrden() : siguienteOrden(dia.getId()));
        for (int s = 1; s <= semanas; s++) {
            ep.getPrescripciones().add(PrescripcionSemanal.copiaDe(recibidas.getOrDefault(s, base), ep, s));
        }
        validarSemana1(ep);
        return ejercicioPlanificadoRepository.save(ep);
    }

    /**
     * Actualiza ejercicio, circuito y orden, y las semanas que vengan en el pedido
     * (las que no vienen quedan como estaban).
     */
    @Transactional
    public EjercicioPlanificado actualizar(Long id, EjercicioPlanificado cambios) {
        EjercicioPlanificado ep = ejercicioPlanificadoRepository.findById(id)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Ejercicio no encontrado."));
        int semanas = ep.getDiaPlan().getPlanificacion().getCantidadSemanas();

        if (cambios.getEjercicio() != null && cambios.getEjercicio().getId() != null) {
            ep.setEjercicio(buscarEjercicio(cambios.getEjercicio()));
        }
        ep.setCircuito(textoONull(cambios.getCircuito()));
        if (cambios.getOrden() != null) ep.setOrden(cambios.getOrden());

        for (Map.Entry<Integer, PrescripcionSemanal> e : porSemana(cambios.getPrescripciones(), semanas).entrySet()) {
            int semana = e.getKey();
            PrescripcionSemanal existente = ep.getPrescripciones().stream()
                    .filter(p -> p.getNumeroSemana() == semana)
                    .findFirst()
                    .orElse(null);
            if (existente != null) {
                existente.copiarValoresDe(e.getValue());
            } else {
                ep.getPrescripciones().add(PrescripcionSemanal.copiaDe(e.getValue(), ep, semana));
            }
        }
        validarSemana1(ep);
        return ejercicioPlanificadoRepository.save(ep);
    }

    private Map<Integer, PrescripcionSemanal> porSemana(List<PrescripcionSemanal> lista, int semanas) {
        Map<Integer, PrescripcionSemanal> mapa = new HashMap<>();
        if (lista == null) return mapa;
        for (PrescripcionSemanal p : lista) {
            Integer s = p.getNumeroSemana();
            if (s == null || s < 1 || s > semanas) {
                throw error(HttpStatus.BAD_REQUEST, "La semana " + s + " no existe en este plan.");
            }
            mapa.put(s, p);
        }
        return mapa;
    }

    private void validarSemana1(EjercicioPlanificado ep) {
        PrescripcionSemanal s1 = ep.getPrescripciones().stream()
                .filter(p -> p.getNumeroSemana() == 1)
                .findFirst()
                .orElse(null);
        if (s1 == null || s1.getSeries() == null || s1.getReps() == null) {
            throw error(HttpStatus.BAD_REQUEST, "La semana 1 necesita series y repeticiones.");
        }
    }

    private Ejercicio buscarEjercicio(Ejercicio ejercicio) {
        if (ejercicio == null || ejercicio.getId() == null) {
            throw error(HttpStatus.BAD_REQUEST, "Elegí un ejercicio.");
        }
        return ejercicioRepository.findById(ejercicio.getId())
                .orElseThrow(() -> error(HttpStatus.BAD_REQUEST, "El ejercicio elegido no existe."));
    }

    private int siguienteOrden(Long diaId) {
        return ejercicioPlanificadoRepository.findByDiaPlanIdOrderByOrdenAsc(diaId).stream()
                .mapToInt(EjercicioPlanificado::getOrden)
                .max()
                .orElse(0) + 1;
    }

    private static String textoONull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }
}
