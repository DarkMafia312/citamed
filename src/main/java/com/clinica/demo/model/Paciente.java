package com.clinica.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "pacientes")
public class Paciente {

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

    @NotNull
    @Size(min = 8, max = 8)
    @Column(unique = true, nullable = false)
    private String dni;

    @Column(nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false)
    private String genero;

    @Size(max = 15)
    private String telefono;

    @Size(max = 150)
    private String direccion;

    @Column(unique = true)
    private String correo;

    private String tipoSangre;

    private String seguroMedico;

    private String alergias;

    @ManyToOne
    @JoinColumn(name = "recepcionista_id")
    private Recepcionista recepcionista;

    @Column(nullable = false)
    private Boolean activo = true;
}