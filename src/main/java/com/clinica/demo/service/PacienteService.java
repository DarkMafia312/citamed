package com.clinica.demo.service;

import com.clinica.demo.dto.PacienteDTO;
import com.clinica.demo.model.Paciente;
import com.clinica.demo.model.Recepcionista;
import com.clinica.demo.repository.PacienteRepository;
import com.clinica.demo.repository.RecepcionistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final RecepcionistaRepository recepcionistaRepository;

    @Transactional(readOnly = true)
    public List<PacienteDTO> listarTodos() {
        return pacienteRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PacienteDTO> listarActivos() {
        return pacienteRepository.findByActivoTrue()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PacienteDTO buscarPorId(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con id: " + id));
        return convertirADTO(paciente);
    }

    @Transactional(readOnly = true)
    public List<PacienteDTO> buscarPacientes(String busqueda) {
        return pacienteRepository.buscarPacientes(busqueda)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PacienteDTO> listarPorRecepcionista(Long recepcionistaId) {
        return pacienteRepository.findByRecepcionistaId(recepcionistaId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PacienteDTO crear(PacienteDTO dto) {
        if (pacienteRepository.existsByDni(dto.getDni())) {
            throw new RuntimeException("Ya existe un paciente con ese DNI");
        }
        if (dto.getCorreo() != null && pacienteRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("Ya existe un paciente con ese correo");
        }
        Paciente paciente = convertirAEntidad(dto);
        return convertirADTO(pacienteRepository.save(paciente));
    }

    @Transactional
    public PacienteDTO actualizar(Long id, PacienteDTO dto) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con id: " + id));
        paciente.setNombre(dto.getNombre());
        paciente.setApellido(dto.getApellido());
        paciente.setDni(dto.getDni());
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setGenero(dto.getGenero());
        paciente.setTelefono(dto.getTelefono());
        paciente.setDireccion(dto.getDireccion());
        paciente.setCorreo(dto.getCorreo());
        paciente.setTipoSangre(dto.getTipoSangre());
        paciente.setSeguroMedico(dto.getSeguroMedico());
        paciente.setAlergias(dto.getAlergias());
        return convertirADTO(pacienteRepository.save(paciente));
    }

    @Transactional
    public void habilitar(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con id: " + id));
        paciente.setActivo(true);
        pacienteRepository.save(paciente);
    }

    @Transactional
    public void deshabilitar(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con id: " + id));
        paciente.setActivo(false);
        pacienteRepository.save(paciente);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!pacienteRepository.existsById(id)) {
            throw new RuntimeException("Paciente no encontrado con id: " + id);
        }
        pacienteRepository.deleteById(id);
    }

    private PacienteDTO convertirADTO(Paciente paciente) {
        PacienteDTO dto = new PacienteDTO();
        dto.setId(paciente.getId());
        dto.setNombre(paciente.getNombre());
        dto.setApellido(paciente.getApellido());
        dto.setDni(paciente.getDni());
        dto.setFechaNacimiento(paciente.getFechaNacimiento());
        dto.setGenero(paciente.getGenero());
        dto.setTelefono(paciente.getTelefono());
        dto.setDireccion(paciente.getDireccion());
        dto.setCorreo(paciente.getCorreo());
        dto.setTipoSangre(paciente.getTipoSangre());
        dto.setSeguroMedico(paciente.getSeguroMedico());
        dto.setAlergias(paciente.getAlergias());
        dto.setActivo(paciente.getActivo());
        if (paciente.getRecepcionista() != null) {
            dto.setRecepcionistaId(paciente.getRecepcionista().getId());
            dto.setRecepcionistaNombre(paciente.getRecepcionista().getNombre()
                    + " " + paciente.getRecepcionista().getApellido());
        }
        return dto;
    }

    private Paciente convertirAEntidad(PacienteDTO dto) {
        Paciente paciente = new Paciente();
        paciente.setNombre(dto.getNombre());
        paciente.setApellido(dto.getApellido());
        paciente.setDni(dto.getDni());
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setGenero(dto.getGenero());
        paciente.setTelefono(dto.getTelefono());
        paciente.setDireccion(dto.getDireccion());
        paciente.setCorreo(dto.getCorreo());
        paciente.setTipoSangre(dto.getTipoSangre());
        paciente.setSeguroMedico(dto.getSeguroMedico());
        paciente.setAlergias(dto.getAlergias());
        paciente.setActivo(true);
        if (dto.getRecepcionistaId() != null) {
            Recepcionista recepcionista = recepcionistaRepository.findById(dto.getRecepcionistaId())
                    .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada"));
            paciente.setRecepcionista(recepcionista);
        }
        return paciente;
    }
}