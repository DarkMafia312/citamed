package com.clinica.demo.service;

import com.clinica.demo.dto.HorarioMedicoDTO;
import com.clinica.demo.model.HorarioMedico;
import com.clinica.demo.model.Medico;
import com.clinica.demo.repository.HorarioMedicoRepository;
import com.clinica.demo.repository.MedicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HorarioMedicoService {

    private final HorarioMedicoRepository horarioMedicoRepository;
    private final MedicoRepository medicoRepository;

    @Transactional(readOnly = true)
    public List<HorarioMedicoDTO> listarTodos() {
        return horarioMedicoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HorarioMedicoDTO> listarPorMedico(Long medicoId) {
        return horarioMedicoRepository.findByMedicoId(medicoId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HorarioMedicoDTO> listarDisponiblesPorMedico(Long medicoId) {
        return horarioMedicoRepository.findByMedicoIdAndDisponibleTrue(medicoId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HorarioMedicoDTO buscarPorId(Long id) {
        HorarioMedico horario = horarioMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado con id: " + id));
        return convertirADTO(horario);
    }

    @Transactional
    public HorarioMedicoDTO crear(HorarioMedicoDTO dto) {
        Medico medico = medicoRepository.findById(dto.getMedicoId())
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));

        boolean yaExiste = !horarioMedicoRepository
                .findByMedicoIdAndDia(dto.getMedicoId(), dto.getDiaSemana())
                .isEmpty();

        if (yaExiste) {
            throw new RuntimeException("El médico ya tiene un horario registrado para el día " + dto.getDiaSemana());
        }

        HorarioMedico horario = convertirAEntidad(dto, medico);
        return convertirADTO(horarioMedicoRepository.save(horario));
    }

    @Transactional
    public HorarioMedicoDTO actualizar(Long id, HorarioMedicoDTO dto) {
        HorarioMedico horario = horarioMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado con id: " + id));

        if (!horario.getDiaSemana().equals(dto.getDiaSemana())) {
            boolean yaExiste = horarioMedicoRepository
                    .findByMedicoIdAndDia(horario.getMedico().getId(), dto.getDiaSemana())
                    .stream()
                    .anyMatch(h -> !h.getId().equals(id));

            if (yaExiste) {
                throw new RuntimeException("El médico ya tiene un horario registrado para el día " + dto.getDiaSemana());
            }
        }

        horario.setDiaSemana(dto.getDiaSemana());
        horario.setHoraInicio(dto.getHoraInicio());
        horario.setHoraFin(dto.getHoraFin());
        if (dto.getDisponible() != null) {
            horario.setDisponible(dto.getDisponible());
        }
        return convertirADTO(horarioMedicoRepository.save(horario));
    }

    @Transactional
    public void habilitar(Long id) {
        HorarioMedico horario = horarioMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado con id: " + id));
        horario.setDisponible(true);
        horarioMedicoRepository.save(horario);
    }

    @Transactional
    public void deshabilitar(Long id) {
        HorarioMedico horario = horarioMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Horario no encontrado con id: " + id));
        horario.setDisponible(false);
        horarioMedicoRepository.save(horario);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!horarioMedicoRepository.existsById(id)) {
            throw new RuntimeException("Horario no encontrado con id: " + id);
        }
        horarioMedicoRepository.deleteById(id);
    }

    private HorarioMedicoDTO convertirADTO(HorarioMedico horario) {
        HorarioMedicoDTO dto = new HorarioMedicoDTO();
        dto.setId(horario.getId());
        dto.setMedicoId(horario.getMedico().getId());
        dto.setMedicoNombre(horario.getMedico().getNombre()
                + " " + horario.getMedico().getApellido());
        if (horario.getMedico().getEspecialidad() != null) {
            dto.setMedicoEspecialidad(horario.getMedico().getEspecialidad().getNombre());
        }
        dto.setDiaSemana(horario.getDiaSemana());
        dto.setHoraInicio(horario.getHoraInicio());
        dto.setHoraFin(horario.getHoraFin());
        dto.setDisponible(horario.getDisponible());
        return dto;
    }

    private HorarioMedico convertirAEntidad(HorarioMedicoDTO dto, Medico medico) {
        HorarioMedico horario = new HorarioMedico();
        horario.setMedico(medico);
        horario.setDiaSemana(dto.getDiaSemana());
        horario.setHoraInicio(dto.getHoraInicio());
        horario.setHoraFin(dto.getHoraFin());
        horario.setDisponible(true);
        return horario;
    }
}