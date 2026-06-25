package com.clinica.demo.service;

import com.clinica.demo.dto.CitaDTO;
import com.clinica.demo.model.*;
import com.clinica.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final ConsultorioRepository consultorioRepository;
    private final HorarioMedicoRepository horarioMedicoRepository;

    @Transactional(readOnly = true)
    public List<CitaDTO> listarTodos() {
        return citaRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CitaDTO> listarPorMedico(Long medicoId) {
        return citaRepository.findByMedicoId(medicoId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CitaDTO> listarPorPaciente(Long pacienteId) {
        return citaRepository.findByPacienteId(pacienteId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CitaDTO> listarPorFecha(LocalDate fecha) {
        return citaRepository.findByFecha(fecha)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CitaDTO> listarCitasDelDia() {
        return citaRepository.findByFecha(LocalDate.now())
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CitaDTO buscarPorId(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));
        return convertirADTO(cita);
    }

    @Transactional
    public CitaDTO crear(CitaDTO dto) {
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        Medico medico = medicoRepository.findById(dto.getMedicoId())
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));

        if (!paciente.getActivo()) {
            throw new RuntimeException("No se puede agendar una cita para un paciente deshabilitado");
        }
        if (!medico.getActivo()) {
            throw new RuntimeException("No se puede agendar una cita con un médico deshabilitado");
        }

        validarHorarioMedico(dto.getMedicoId(), dto.getFecha(), dto.getHora());

        boolean ocupado = citaRepository.existeCitaEnHorario(dto.getMedicoId(), dto.getFecha(), dto.getHora());
        if (ocupado) {
            throw new RuntimeException("El médico ya tiene una cita programada en esa fecha y hora");
        }

        Cita cita = new Cita();
        cita.setPaciente(paciente);
        cita.setMedico(medico);

        if (dto.getConsultorioId() != null) {
            Consultorio consultorio = consultorioRepository.findById(dto.getConsultorioId())
                    .orElseThrow(() -> new RuntimeException("Consultorio no encontrado"));
            cita.setConsultorio(consultorio);
        }

        cita.setFecha(dto.getFecha());
        cita.setHora(dto.getHora());
        cita.setMotivo(dto.getMotivo());
        cita.setObservaciones(dto.getObservaciones());
        cita.setEstado(EstadoCita.PROGRAMADA);

        return convertirADTO(citaRepository.save(cita));
    }

    @Transactional
    public CitaDTO actualizar(Long id, CitaDTO dto) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));

        if (cita.getEstado() == EstadoCita.CANCELADA || cita.getEstado() == EstadoCita.ATENDIDA) {
            throw new RuntimeException("No se puede modificar una cita " + cita.getEstado().toString().toLowerCase());
        }

        Long medicoIdFinal = dto.getMedicoId() != null ? dto.getMedicoId() : cita.getMedico().getId();

        boolean cambioFechaHora = !cita.getFecha().equals(dto.getFecha()) || !cita.getHora().equals(dto.getHora());
        boolean cambioMedico = !cita.getMedico().getId().equals(medicoIdFinal);

        if (cambioFechaHora || cambioMedico) {
            validarHorarioMedico(medicoIdFinal, dto.getFecha(), dto.getHora());

            boolean ocupado = citaRepository.existeCitaEnHorario(medicoIdFinal, dto.getFecha(), dto.getHora());
            if (ocupado) {
                throw new RuntimeException("El médico ya tiene una cita programada en esa fecha y hora");
            }
        }

        if (cambioMedico) {
            Medico medico = medicoRepository.findById(medicoIdFinal)
                    .orElseThrow(() -> new RuntimeException("Médico no encontrado"));
            cita.setMedico(medico);
        }
        if (dto.getConsultorioId() != null) {
            Consultorio consultorio = consultorioRepository.findById(dto.getConsultorioId())
                    .orElseThrow(() -> new RuntimeException("Consultorio no encontrado"));
            cita.setConsultorio(consultorio);
        }

        cita.setFecha(dto.getFecha());
        cita.setHora(dto.getHora());
        cita.setMotivo(dto.getMotivo());
        cita.setObservaciones(dto.getObservaciones());

        return convertirADTO(citaRepository.save(cita));
    }

    private void validarHorarioMedico(Long medicoId, LocalDate fecha, LocalTime hora) {
        String diaSemana = traducirDia(fecha.getDayOfWeek());

        List<HorarioMedico> horarios = horarioMedicoRepository
                .findByMedicoIdAndDiaSemanaAndDisponibleTrue(medicoId, diaSemana);

        if (horarios.isEmpty()) {
            throw new RuntimeException("El médico no tiene horario disponible los " + diaSemana.toLowerCase());
        }

        boolean dentroDeHorario = horarios.stream()
                .anyMatch(h -> !hora.isBefore(h.getHoraInicio()) && hora.isBefore(h.getHoraFin()));

        if (!dentroDeHorario) {
            String rangos = horarios.stream()
                    .map(h -> h.getHoraInicio() + " - " + h.getHoraFin())
                    .collect(Collectors.joining(", "));
            throw new RuntimeException("La hora seleccionada está fuera del horario del médico ese día (" + rangos + ")");
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

    @Transactional
    public CitaDTO confirmar(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));
        if (cita.getEstado() != EstadoCita.PROGRAMADA) {
            throw new RuntimeException("Solo se pueden confirmar citas en estado PROGRAMADA");
        }
        cita.setEstado(EstadoCita.CONFIRMADA);
        return convertirADTO(citaRepository.save(cita));
    }

    @Transactional
    public CitaDTO atender(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));
        if (cita.getEstado() == EstadoCita.CANCELADA || cita.getEstado() == EstadoCita.ATENDIDA) {
            throw new RuntimeException("No se puede marcar como atendida una cita " + cita.getEstado().toString().toLowerCase());
        }
        cita.setEstado(EstadoCita.ATENDIDA);
        return convertirADTO(citaRepository.save(cita));
    }

    @Transactional
    public CitaDTO cancelar(Long id, String motivo) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con id: " + id));
        if (cita.getEstado() == EstadoCita.ATENDIDA) {
            throw new RuntimeException("No se puede cancelar una cita ya atendida");
        }
        if (cita.getEstado() == EstadoCita.CANCELADA) {
            throw new RuntimeException("La cita ya está cancelada");
        }
        cita.setEstado(EstadoCita.CANCELADA);
        cita.setMotivoCancelacion(motivo);
        return convertirADTO(citaRepository.save(cita));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!citaRepository.existsById(id)) {
            throw new RuntimeException("Cita no encontrada con id: " + id);
        }
        citaRepository.deleteById(id);
    }

    private CitaDTO convertirADTO(Cita cita) {
        CitaDTO dto = new CitaDTO();
        dto.setId(cita.getId());
        dto.setPacienteId(cita.getPaciente().getId());
        dto.setPacienteNombre(cita.getPaciente().getNombre() + " " + cita.getPaciente().getApellido());
        dto.setPacienteDni(cita.getPaciente().getDni());
        dto.setMedicoId(cita.getMedico().getId());
        dto.setMedicoNombre(cita.getMedico().getNombre() + " " + cita.getMedico().getApellido());
        if (cita.getMedico().getEspecialidad() != null) {
            dto.setMedicoEspecialidad(cita.getMedico().getEspecialidad().getNombre());
        }
        if (cita.getConsultorio() != null) {
            dto.setConsultorioId(cita.getConsultorio().getId());
            dto.setConsultorioNombre(cita.getConsultorio().getNombre());
            dto.setConsultorioCodigo(cita.getConsultorio().getCodigo());
        }
        dto.setFecha(cita.getFecha());
        dto.setHora(cita.getHora());
        dto.setEstado(cita.getEstado());
        dto.setMotivo(cita.getMotivo());
        dto.setObservaciones(cita.getObservaciones());
        dto.setFechaCreacion(cita.getFechaCreacion());
        dto.setMotivoCancelacion(cita.getMotivoCancelacion());
        return dto;
    }
}