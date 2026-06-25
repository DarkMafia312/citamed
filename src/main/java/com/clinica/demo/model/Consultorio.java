package com.clinica.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "consultorios")
public class Consultorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(unique = true, nullable = false)
    private String codigo;

    @NotNull
    @Column(nullable = false)
    private String nombre;

    private String tipo;

    private String piso;

    private String descripcion;

    @Column(nullable = false)
    private Boolean disponible = true;
}