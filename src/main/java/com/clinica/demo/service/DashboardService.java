package com.clinica.demo.service;

import com.clinica.demo.dto.DashboardDTO;
import com.clinica.demo.model.EstadoCita;
import com.clinica.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final CitaRepository citaRepository;
    private final EspecialidadRepository especialidadRepository;
    private final RecepcionistaRepository recepcionistaRepository;

    @Transactional(readOnly = true)
    public DashboardDTO obtenerEstadisticas() {
        long totalPacientes = pacienteRepository.countByActivoTrue();
        long totalMedicos = medicoRepository.countByActivoTrue();
        long totalCitasProgramadas = citaRepository.countByEstado(EstadoCita.PROGRAMADA);
        long totalCitasHoy = citaRepository.countCitasPorFecha(LocalDate.now());
        long totalEspecialidades = especialidadRepository.count();
        long totalRecepcionistas = recepcionistaRepository.countByActivoTrue();

        return new DashboardDTO(
                totalPacientes,
                totalMedicos,
                totalCitasProgramadas,
                totalCitasHoy,
                totalEspecialidades,
                totalRecepcionistas
        );
    }
}