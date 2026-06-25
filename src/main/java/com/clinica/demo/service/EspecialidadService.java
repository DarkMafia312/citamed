package com.clinica.demo.service;

import com.clinica.demo.dto.EspecialidadDTO;
import com.clinica.demo.model.Especialidad;
import com.clinica.demo.repository.EspecialidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    @Transactional(readOnly = true)
    public List<EspecialidadDTO> listarTodos() {
        return especialidadRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EspecialidadDTO buscarPorId(Long id) {
        Especialidad especialidad = especialidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada con id: " + id));
        return convertirADTO(especialidad);
    }

    @Transactional
    public EspecialidadDTO crear(EspecialidadDTO dto) {
        if (especialidadRepository.existsByNombre(dto.getNombre())) {
            throw new RuntimeException("Ya existe una especialidad con ese nombre");
        }
        Especialidad especialidad = convertirAEntidad(dto);
        return convertirADTO(especialidadRepository.save(especialidad));
    }

    @Transactional
    public EspecialidadDTO actualizar(Long id, EspecialidadDTO dto) {
        Especialidad especialidad = especialidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada con id: " + id));
        especialidad.setNombre(dto.getNombre());
        especialidad.setDescripcion(dto.getDescripcion());
        return convertirADTO(especialidadRepository.save(especialidad));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!especialidadRepository.existsById(id)) {
            throw new RuntimeException("Especialidad no encontrada con id: " + id);
        }
        especialidadRepository.deleteById(id);
    }

    private EspecialidadDTO convertirADTO(Especialidad especialidad) {
        EspecialidadDTO dto = new EspecialidadDTO();
        dto.setId(especialidad.getId());
        dto.setNombre(especialidad.getNombre());
        dto.setDescripcion(especialidad.getDescripcion());
        return dto;
    }

    private Especialidad convertirAEntidad(EspecialidadDTO dto) {
        Especialidad especialidad = new Especialidad();
        especialidad.setNombre(dto.getNombre());
        especialidad.setDescripcion(dto.getDescripcion());
        return especialidad;
    }
}