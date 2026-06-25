package com.clinica.demo.dto;

import com.clinica.demo.model.Rol;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioDTO {

    private Long id;

    @NotNull(message = "El username es obligatorio")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;

    @Size(min = 6, max = 100, message = "La contraseña debe tener mínimo 6 caracteres")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private Rol rol;

    private Boolean activo;
}