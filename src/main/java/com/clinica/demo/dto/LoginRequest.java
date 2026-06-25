package com.clinica.demo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotNull(message = "El username es obligatorio")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;

    @NotNull(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 100, message = "La contraseña debe tener mínimo 6 caracteres")
    private String password;
}