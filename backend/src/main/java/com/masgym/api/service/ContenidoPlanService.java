package com.masgym.api.service;

import com.masgym.api.dto.ContenidoPlanDTO;
import com.masgym.api.model.*;
import com.masgym.api.repository.EjercicioRepository;
import com.masgym.api.repository.PlanificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Guarda de una vez el contenido del plan (bloques fijos, dias y ejercicios) que se
 * edito en pantalla. Hasta que se toca "Guardar" nada de eso llega a la base.
 * Reemplaza todo lo que habia: primero valida todo y recien despues borra y vuelve a
 * crear, dentro de una sola transaccion, asi que si algo falla queda como estaba.
 */
@Service
@RequiredArgsConstructor
public class ContenidoPlanService {

    private final PlanificacionRepository planificacionRepository;
    private final EjercicioRepository ejercicioRepository;

    @Transactional
    public void guardar(Long planId, ContenidoPlanDTO contenido) {
        Planificacion plan = planificacionRepository.findById(planId)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Planificación no encontrada."));
        int semanas = plan.getCantidadSemanas();

        Map<Long, Ejercicio> catalogo = new HashMap<>();
        validar(contenido, semanas, catalogo);

        // Se borra lo anterior y se baja a la base antes de crear lo nuevo.
        plan.getEjerciciosFijos().clear();
        plan.getDias().clear();
        planificacionRepository.saveAndFlush(plan);

        Map<TipoBloqueFijo, Integer> ordenPorBloque = new HashMap<>();
        for (ContenidoPlanDTO.Fijo f : contenido.getEjerciciosFijos()) {
            EjercicioFijoPlan item = new EjercicioFijoPlan();
            item.setPlanificacion(plan);
            item.setTipoBloque(f.getTipoBloque());
            item.setEjercicio(catalogo.get(f.getEjercicioId()));
            item.setSeriesReps(textoONull(f.getSeriesReps()));
            item.setOrden(ordenPorBloque.merge(f.getTipoBloque(), 1, Integer::sum));
            plan.getEjerciciosFijos().add(item);
        }

        for (ContenidoPlanDTO.Dia d : contenido.getDias()) {
            DiaPlan dia = new DiaPlan();
            dia.setPlanificacion(plan);
            dia.setDiaSemana(d.getDiaSemana().trim());
            dia.setNotas(textoONull(d.getNotas()));
            dia.setEjercicios(new java.util.ArrayList<>());

            int orden = 0;
            for (ContenidoPlanDTO.EjercicioDia e : d.getEjercicios()) {
                EjercicioPlanificado ep = new EjercicioPlanificado();
                ep.setDiaPlan(dia);
                ep.setEjercicio(catalogo.get(e.getEjercicioId()));
                ep.setCircuito(textoONull(e.getCircuito()));
                ep.setOrden(++orden);

                Map<Integer, ContenidoPlanDTO.Semana> recibidas = new HashMap<>();
                for (ContenidoPlanDTO.Semana s : e.getPrescripciones()) recibidas.put(s.getNumeroSemana(), s);
                // Las semanas que no vengan arrancan igual que la semana 1.
                ContenidoPlanDTO.Semana base = recibidas.get(1);
                for (int s = 1; s <= semanas; s++) {
                    ContenidoPlanDTO.Semana datos = recibidas.getOrDefault(s, base);
                    PrescripcionSemanal p = new PrescripcionSemanal();
                    p.setEjercicioPlanificado(ep);
                    p.setNumeroSemana(s);
                    p.setSeries(datos.getSeries());
                    p.setReps(textoONull(datos.getReps()));
                    p.setRir(textoONull(datos.getRir()));
                    p.setNotasPeso(textoONull(datos.getNotasPeso()));
                    ep.getPrescripciones().add(p);
                }
                dia.getEjercicios().add(ep);
            }
            plan.getDias().add(dia);
        }
        planificacionRepository.save(plan);
    }

    /** Revisa todo antes de tocar nada; carga en {@code catalogo} los ejercicios usados. */
    private void validar(ContenidoPlanDTO contenido, int semanas, Map<Long, Ejercicio> catalogo) {
        for (ContenidoPlanDTO.Fijo f : contenido.getEjerciciosFijos()) {
            if (f.getTipoBloque() == null) throw error(HttpStatus.BAD_REQUEST, "Falta el bloque de un ejercicio fijo.");
            buscarEjercicio(f.getEjercicioId(), catalogo);
        }
        for (ContenidoPlanDTO.Dia d : contenido.getDias()) {
            if (d.getDiaSemana() == null || d.getDiaSemana().isBlank()) {
                throw error(HttpStatus.BAD_REQUEST, "Hay un día sin nombre.");
            }
            for (ContenidoPlanDTO.EjercicioDia e : d.getEjercicios()) {
                Ejercicio ej = buscarEjercicio(e.getEjercicioId(), catalogo);
                List<ContenidoPlanDTO.Semana> lista = e.getPrescripciones();
                ContenidoPlanDTO.Semana s1 = null;
                for (ContenidoPlanDTO.Semana s : lista) {
                    Integer n = s.getNumeroSemana();
                    if (n == null || n < 1 || n > semanas) {
                        throw error(HttpStatus.BAD_REQUEST, "La semana " + n + " no existe en este plan.");
                    }
                    if (n == 1) s1 = s;
                }
                if (s1 == null || s1.getSeries() == null || s1.getReps() == null || s1.getReps().isBlank()) {
                    throw error(HttpStatus.BAD_REQUEST, d.getDiaSemana().trim() + ", " + ej.getNombre()
                            + ": la semana 1 necesita series y repeticiones.");
                }
            }
        }
    }

    private Ejercicio buscarEjercicio(Long id, Map<Long, Ejercicio> catalogo) {
        if (id == null) throw error(HttpStatus.BAD_REQUEST, "Hay un ejercicio sin elegir.");
        Ejercicio ej = catalogo.get(id);
        if (ej == null) {
            ej = ejercicioRepository.findById(id)
                    .orElseThrow(() -> error(HttpStatus.BAD_REQUEST, "Uno de los ejercicios elegidos no existe."));
            catalogo.put(id, ej);
        }
        return ej;
    }

    private static String textoONull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static ResponseStatusException error(HttpStatus status, String mensaje) {
        return new ResponseStatusException(status, mensaje);
    }
}
