package com.clinica.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "historial_medico")
public class HistorialMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @ManyToOne
    @JoinColumn(name = "cita_id")
    private Cita cita;

    @NotNull
    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(nullable = false)
    private LocalDate fecha;

    private String diagnostico;

    private String tratamiento;

    private String medicamentos;

    private String observaciones;

    @Column(name = "proxima_cita")
    private LocalDate proximaCita;
}