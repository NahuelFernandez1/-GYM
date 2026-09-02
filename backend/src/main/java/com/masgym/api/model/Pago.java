package com.masgym.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @Column(nullable = false)
    private BigDecimal monto;

    // Null hasta que el pago se marca como PAGADO (no tiene sentido una fecha de pago
    // para un pago generado automaticamente que todavia esta PENDIENTE).
    private LocalDate fechaPago;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;

    // Null hasta que el pago se marca como PAGADO, por el mismo motivo que fechaPago.
    private String metodoPago; // EFECTIVO, TRANSFERENCIA

    @Column(nullable = false)
    private String estado; // PAGADO, PENDIENTE, VENCIDO (valor real persistido)

    private String notas;

    /**
     * Estado a mostrar: igual al persistido, salvo que este PENDIENTE y ya haya
     * pasado la fecha de vencimiento, en cuyo caso se muestra VENCIDO sin tocar
     * el valor real en la base (eso solo cambia cuando alguien lo marca PAGADO).
     */
    @JsonProperty("estadoEfectivo")
    @Transient
    public String getEstadoEfectivo() {
        if ("PENDIENTE".equals(estado) && fechaVencimiento != null && LocalDate.now().isAfter(fechaVencimiento)) {
            return "VENCIDO";
        }
        return estado;
    }
}