package com.clinica.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class HistorialMedicoDTO {

    private Long id;

    @NotNull(message = "El paciente es obligatorio")
    private Long pacienteId;
    private String pacienteNombre;

    @NotNull(message = "El médico es obligatorio")
    private Long medicoId;
    private String medicoNombre;

    private Long citaId;

    @NotNull(message = "La descripción es obligatoria")
    @Size(min = 10, max = 500, message = "La descripción debe tener entre 10 y 500 caracteres")
    private String descripcion;

    private LocalDate fecha;

    @Size(max = 255, message = "El diagnóstico no puede exceder 255 caracteres")
    private String diagnostico;

    @Size(max = 255, message = "El tratamiento no puede exceder 255 caracteres")
    private String tratamiento;

    @Size(max = 255, message = "Los medicamentos no pueden exceder 255 caracteres")
    private String medicamentos;

    @Size(max = 255, message = "Las observaciones no pueden exceder 255 caracteres")
    private String observaciones;

    private LocalDate proximaCita;
}