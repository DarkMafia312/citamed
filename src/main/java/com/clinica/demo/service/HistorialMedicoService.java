package com.clinica.demo.service;

import com.clinica.demo.dto.HistorialMedicoDTO;
import com.clinica.demo.model.*;
import com.clinica.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistorialMedicoService {

    private final HistorialMedicoRepository historialMedicoRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final CitaRepository citaRepository;
    private final HorarioMedicoRepository horarioMedicoRepository;

    @Transactional(readOnly = true)
    public List<HistorialMedicoDTO> listarTodos() {
        return historialMedicoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HistorialMedicoDTO> listarPorPaciente(Long pacienteId) {
        return historialMedicoRepository.findByPacienteId(pacienteId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HistorialMedicoDTO> listarPorMedico(Long medicoId) {
        return historialMedicoRepository.findByMedicoId(medicoId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HistorialMedicoDTO buscarPorId(Long id) {
        HistorialMedico historial = historialMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado con id: " + id));
        return convertirADTO(historial);
    }

    @Transactional
    public HistorialMedicoDTO crear(HistorialMedicoDTO dto, Authentication authentication) {
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        Medico medico = medicoRepository.findById(dto.getMedicoId())
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));

        validarPermisoMedico(medico, authentication);

        if (dto.getCitaId() == null) {
            throw new RuntimeException("Debe seleccionar una cita existente del paciente");
        }

        Cita cita = citaRepository.findById(dto.getCitaId())
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (!cita.getPaciente().getId().equals(dto.getPacienteId())) {
            throw new RuntimeException("La cita seleccionada no pertenece al paciente indicado");
        }
        if (!cita.getMedico().getId().equals(dto.getMedicoId())) {
            throw new RuntimeException("La cita seleccionada no pertenece al médico indicado");
        }

        validarProximaCita(dto.getMedicoId(), dto.getProximaCita());

        HistorialMedico historial = new HistorialMedico();
        historial.setPaciente(paciente);
        historial.setMedico(medico);
        historial.setCita(cita);
        historial.setDescripcion(dto.getDescripcion());
        historial.setFecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now());
        historial.setDiagnostico(dto.getDiagnostico());
        historial.setTratamiento(dto.getTratamiento());
        historial.setMedicamentos(dto.getMedicamentos());
        historial.setObservaciones(dto.getObservaciones());
        historial.setProximaCita(dto.getProximaCita());

        return convertirADTO(historialMedicoRepository.save(historial));
    }

    @Transactional
    public HistorialMedicoDTO actualizar(Long id, HistorialMedicoDTO dto, Authentication authentication) {
        HistorialMedico historial = historialMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado con id: " + id));

        validarPermisoMedico(historial.getMedico(), authentication);

        if (dto.getCitaId() != null && !dto.getCitaId().equals(historial.getCita() != null ? historial.getCita().getId() : null)) {
            Cita cita = citaRepository.findById(dto.getCitaId())
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

            Long pacienteIdFinal = dto.getPacienteId() != null ? dto.getPacienteId() : historial.getPaciente().getId();
            if (!cita.getPaciente().getId().equals(pacienteIdFinal)) {
                throw new RuntimeException("La cita seleccionada no pertenece al paciente indicado");
            }
            historial.setCita(cita);
        }

        Long medicoIdFinal = dto.getMedicoId() != null ? dto.getMedicoId() : historial.getMedico().getId();
        validarProximaCita(medicoIdFinal, dto.getProximaCita());

        historial.setDescripcion(dto.getDescripcion());
        if (dto.getFecha() != null) {
            historial.setFecha(dto.getFecha());
        }
        historial.setDiagnostico(dto.getDiagnostico());
        historial.setTratamiento(dto.getTratamiento());
        historial.setMedicamentos(dto.getMedicamentos());
        historial.setObservaciones(dto.getObservaciones());
        historial.setProximaCita(dto.getProximaCita());

        return convertirADTO(historialMedicoRepository.save(historial));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!historialMedicoRepository.existsById(id)) {
            throw new RuntimeException("Historial no encontrado con id: " + id);
        }
        historialMedicoRepository.deleteById(id);
    }

    private void validarProximaCita(Long medicoId, LocalDate proximaCita) {
        if (proximaCita == null) {
            throw new RuntimeException("La próxima cita sugerida es obligatoria");
        }
        if (proximaCita.isBefore(LocalDate.now())) {
            throw new RuntimeException("La próxima cita sugerida no puede ser una fecha pasada");
        }

        String diaSemana = traducirDia(proximaCita.getDayOfWeek());
        List<HorarioMedico> horarios = horarioMedicoRepository
                .findByMedicoIdAndDiaSemanaAndDisponibleTrue(medicoId, diaSemana);

        if (horarios.isEmpty()) {
            throw new RuntimeException("El médico no atiende los " + diaSemana.toLowerCase() +
                    ", elige otro día para la próxima cita sugerida");
        }
    }

    private String traducirDia(DayOfWeek dayOfWeek) {
        switch (dayOfWeek) {
            case MONDAY: return "LUNES";
            case TUESDAY: return "MARTES";
            case WEDNESDAY: return "MIERCOLES";
            case THURSDAY: return "JUEVES";
            case FRIDAY: return "VIERNES";
            case SATURDAY: return "SABADO";
            case SUNDAY: return "DOMINGO";
            default: throw new RuntimeException("Día no reconocido");
        }
    }

    private void validarPermisoMedico(Medico medico, Authentication authentication) {
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (esAdmin) {
            return;
        }

        String username = authentication.getName();
        if (medico.getUsuario() == null || !medico.getUsuario().getUsername().equals(username)) {
            throw new RuntimeException("No tienes permiso para registrar o editar historiales de otro médico");
        }
    }

    private HistorialMedicoDTO convertirADTO(HistorialMedico historial) {
        HistorialMedicoDTO dto = new HistorialMedicoDTO();
        dto.setId(historial.getId());
        dto.setPacienteId(historial.getPaciente().getId());
        dto.setPacienteNombre(historial.getPaciente().getNombre() + " " + historial.getPaciente().getApellido());
        dto.setMedicoId(historial.getMedico().getId());
        dto.setMedicoNombre(historial.getMedico().getNombre() + " " + historial.getMedico().getApellido());
        if (historial.getCita() != null) {
            dto.setCitaId(historial.getCita().getId());
        }
        dto.setDescripcion(historial.getDescripcion());
        dto.setFecha(historial.getFecha());
        dto.setDiagnostico(historial.getDiagnostico());
        dto.setTratamiento(historial.getTratamiento());
        dto.setMedicamentos(historial.getMedicamentos());
        dto.setObservaciones(historial.getObservaciones());
        dto.setProximaCita(historial.getProximaCita());
        return dto;
    }
}