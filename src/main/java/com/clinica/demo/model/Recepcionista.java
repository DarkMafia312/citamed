package com.clinica.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Entity
@Table(name = "recepcionistas")
public class Recepcionista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 2, max = 100)
    @Column(nullable = false)
    private String nombre;

    @NotNull
    @Size(min = 2, max = 100)
    @Column(nullable = false)
    private String apellido;

    @Column(unique = true)
    private String correo;

    @Size(max = 15)
    private String telefono;

    private String dni;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false)
    private Boolean activo = true;
}