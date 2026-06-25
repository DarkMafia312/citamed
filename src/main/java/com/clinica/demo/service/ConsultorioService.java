package com.clinica.demo.service;

import com.clinica.demo.dto.ConsultorioDTO;
import com.clinica.demo.model.Consultorio;
import com.clinica.demo.repository.ConsultorioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultorioService {

    private final ConsultorioRepository consultorioRepository;

    @Transactional(readOnly = true)
    public List<ConsultorioDTO> listarTodos() {
        return consultorioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultorioDTO> listarDisponibles() {
        return consultorioRepository.findByDisponibleTrue()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConsultorioDTO buscarPorId(Long id) {
        Consultorio consultorio = consultorioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultorio no encontrado con id: " + id));
        return convertirADTO(consultorio);
    }

    @Transactional
    public ConsultorioDTO crear(ConsultorioDTO dto) {
        if (consultorioRepository.existsByCodigo(dto.getCodigo())) {
            throw new RuntimeException("Ya existe un consultorio con ese código");
        }
        Consultorio consultorio = convertirAEntidad(dto);
        return convertirADTO(consultorioRepository.save(consultorio));
    }

    @Transactional
    public ConsultorioDTO actualizar(Long id, ConsultorioDTO dto) {
        Consultorio consultorio = consultorioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultorio no encontrado con id: " + id));
        consultorio.setCodigo(dto.getCodigo());
        consultorio.setNombre(dto.getNombre());
        consultorio.setTipo(dto.getTipo());
        consultorio.setPiso(dto.getPiso());
        consultorio.setDescripcion(dto.getDescripcion());
        return convertirADTO(consultorioRepository.save(consultorio));
    }

    @Transactional
    public void habilitar(Long id) {
        Consultorio consultorio = consultorioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultorio no encontrado con id: " + id));
        consultorio.setDisponible(true);
        consultorioRepository.save(consultorio);
    }

    @Transactional
    public void deshabilitar(Long id) {
        Consultorio consultorio = consultorioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultorio no encontrado con id: " + id));
        consultorio.setDisponible(false);
        consultorioRepository.save(consultorio);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!consultorioRepository.existsById(id)) {
            throw new RuntimeException("Consultorio no encontrado con id: " + id);
        }
        consultorioRepository.deleteById(id);
    }

    private ConsultorioDTO convertirADTO(Consultorio consultorio) {
        ConsultorioDTO dto = new ConsultorioDTO();
        dto.setId(consultorio.getId());
        dto.setCodigo(consultorio.getCodigo());
        dto.setNombre(consultorio.getNombre());
        dto.setTipo(consultorio.getTipo());
        dto.setPiso(consultorio.getPiso());
        dto.setDescripcion(consultorio.getDescripcion());
        dto.setDisponible(consultorio.getDisponible());
        return dto;
    }

    private Consultorio convertirAEntidad(ConsultorioDTO dto) {
        Consultorio consultorio = new Consultorio();
        consultorio.setCodigo(dto.getCodigo());
        consultorio.setNombre(dto.getNombre());
        consultorio.setTipo(dto.getTipo());
        consultorio.setPiso(dto.getPiso());
        consultorio.setDescripcion(dto.getDescripcion());
        consultorio.setDisponible(true);
        return consultorio;
    }
}