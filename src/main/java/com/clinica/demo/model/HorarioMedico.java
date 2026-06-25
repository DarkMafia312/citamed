package com.clinica.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "horarios_medicos")
public class HorarioMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @NotNull
    @Column(nullable = false)
    private String diaSemana;

    @NotNull
    @Column(nullable = false)
    private LocalTime horaInicio;

    @NotNull
    @Column(nullable = false)
    private LocalTime horaFin;

    @Column(nullable = false)
    private Boolean disponible = true;
}