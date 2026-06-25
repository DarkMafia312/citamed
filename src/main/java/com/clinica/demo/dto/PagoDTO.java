package com.clinica.demo.dto;

import com.clinica.demo.model.EstadoPago;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PagoDTO {

    private Long id;

    @NotNull(message = "El paciente es obligatorio")
    private Long pacienteId;
    private String pacienteNombre;

    private Long recepcionistaId;
    private String recepcionistaNombre;

    private Long citaId;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "El monto no tiene un formato válido")
    private BigDecimal monto;

    private LocalDate fecha;

    private EstadoPago estado;

    @Size(max = 255, message = "El concepto no puede exceder 255 caracteres")
    private String concepto;

    @Pattern(regexp = "^(EFECTIVO|TARJETA|TRANSFERENCIA)$",
            message = "El método de pago debe ser EFECTIVO, TARJETA o TRANSFERENCIA")
    private String metodoPago;

    @Size(max = 50, message = "El número de boleta no puede exceder 50 caracteres")
    private String numeroBoleta;

    private LocalDate fechaCreacion;
}