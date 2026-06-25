package com.clinica.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MedicoDTO {

    private Long id;

    @NotNull(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "El nombre solo puede contener letras")
    private String nombre;

    @NotNull(message = "El apellido es obligatorio")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$", message = "El apellido solo puede contener letras")
    private String apellido;

    @NotNull(message = "El CMP es obligatorio")
    @Size(min = 6, max = 10, message = "El CMP debe tener entre 6 y 10 caracteres")
    private String cmp;

    @Email(message = "El correo no tiene un formato válido")
    @Pattern(regexp = "^[a-zA-Z0-9._%+\\-]+@gmail\\.com$", message = "Solo se permiten correos Gmail")
    private String correo;

    @Pattern(regexp = "^[0-9]{9}$", message = "El teléfono debe tener exactamente 9 dígitos numéricos")
    private String telefono;

    @Pattern(regexp = "^(MASCULINO|FEMENINO)$", message = "El género debe ser MASCULINO o FEMENINO")
    private String genero;

    @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
    private String descripcion;

    @NotNull(message = "La especialidad es obligatoria")
    private Long especialidadId;
    private String especialidadNombre;

    private Long usuarioId;

    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9._]+$", message = "El username solo puede contener letras, números, puntos y guion bajo")
    private String username;

    @Size(min = 6, message = "La contraseña debe tener mínimo 6 caracteres")
    private String password;

    private Boolean activo;
}