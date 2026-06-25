package com.clinica.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalTime;

@Data
public class HorarioMedicoDTO {

    private Long id;

    @NotNull(message = "El médico es obligatorio")
    private Long medicoId;

    private String medicoNombre;

    private String medicoEspecialidad;

    @NotNull(message = "El día de la semana es obligatorio")
    @Pattern(regexp = "^(LUNES|MARTES|MIERCOLES|JUEVES|VIERNES|SABADO|DOMINGO)$",
            message = "El día debe ser LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO o DOMINGO")
    private String diaSemana;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;

    private Boolean disponible;
}