package com.clinica.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PacienteDTO {

    private Long id;

    @NotNull(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "El nombre solo puede contener letras")
    private String nombre;

    @NotNull(message = "El apellido es obligatorio")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "El apellido solo puede contener letras")
    private String apellido;

    @NotNull(message = "El DNI es obligatorio")
    @Pattern(regexp = "^[0-9]{8}$", message = "El DNI debe tener exactamente 8 dígitos numéricos")
    private String dni;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @NotNull(message = "El género es obligatorio")
    @Pattern(regexp = "^(MASCULINO|FEMENINO)$", message = "El género debe ser MASCULINO o FEMENINO")
    private String genero;

    @Pattern(regexp = "^[0-9]{9}$", message = "El teléfono debe tener exactamente 9 dígitos numéricos")
    private String telefono;

    @Size(max = 150, message = "La dirección no puede exceder 150 caracteres")
    private String direccion;

    @Email(message = "El correo no tiene un formato válido")
    @Pattern(regexp = "^[a-zA-Z0-9._%+\\-]+@gmail\\.com$", message = "Solo se permiten correos Gmail")
    private String correo;

    @Pattern(regexp = "^(A\\+|A-|B\\+|B-|O\\+|O-|AB\\+|AB-)$", message = "Tipo de sangre inválido")
    private String tipoSangre;

    @Size(max = 100, message = "El seguro médico no puede exceder 100 caracteres")
    private String seguroMedico;

    @Size(max = 255, message = "Las alergias no pueden exceder 255 caracteres")
    private String alergias;

    private Long recepcionistaId;
    private String recepcionistaNombre;

    private Boolean activo;
}