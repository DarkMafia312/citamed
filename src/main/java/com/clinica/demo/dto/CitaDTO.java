package com.clinica.demo.dto;

import com.clinica.demo.model.EstadoCita;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CitaDTO {

    private Long id;

    @NotNull(message = "El paciente es obligatorio")
    private Long pacienteId;
    private String pacienteNombre;
    private String pacienteDni;

    @NotNull(message = "El médico es obligatorio")
    private Long medicoId;
    private String medicoNombre;
    private String medicoEspecialidad;

    private Long consultorioId;
    private String consultorioNombre;
    private String consultorioCodigo;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;

    private EstadoCita estado;

    @Size(max = 255, message = "El motivo no puede exceder 255 caracteres")
    private String motivo;

    @Size(max = 255, message = "Las observaciones no pueden exceder 255 caracteres")
    private String observaciones;

    private LocalDate fechaCreacion;

    @Size(max = 255, message = "El motivo de cancelación no puede exceder 255 caracteres")
    private String motivoCancelacion;
}