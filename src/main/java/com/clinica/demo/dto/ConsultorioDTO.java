package com.clinica.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ConsultorioDTO {

    private Long id;

    @NotNull(message = "El código es obligatorio")
    @Pattern(regexp = "^C-[0-9]{3}$", message = "El código debe tener el formato C-XXX")
    private String codigo;

    @NotNull(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @Size(max = 100, message = "El tipo no puede exceder 100 caracteres")
    private String tipo;

    @Size(max = 10, message = "El piso no puede exceder 10 caracteres")
    private String piso;

    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String descripcion;

    private Boolean disponible;
}