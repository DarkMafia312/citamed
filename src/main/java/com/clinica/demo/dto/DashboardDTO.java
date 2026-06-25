package com.clinica.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDTO {

    private long totalPacientes;
    private long totalMedicos;
    private long totalCitasProgramadas;
    private long totalCitasHoy;
    private long totalEspecialidades;
    private long totalRecepcionistas;
}