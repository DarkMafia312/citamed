package com.clinica.demo.service;

import com.clinica.demo.dto.MedicoDTO;
import com.clinica.demo.model.Especialidad;
import com.clinica.demo.model.Medico;
import com.clinica.demo.model.Rol;
import com.clinica.demo.model.Usuario;
import com.clinica.demo.repository.EspecialidadRepository;
import com.clinica.demo.repository.MedicoRepository;
import com.clinica.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final EspecialidadRepository especialidadRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<MedicoDTO> listarTodos() {
        return medicoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicoDTO> listarActivos() {
        return medicoRepository.findByActivoTrue()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicoDTO buscarPorId(Long id) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado con id: " + id));
        return convertirADTO(medico);
    }

    @Transactional(readOnly = true)
    public List<MedicoDTO> buscarMedicos(String busqueda) {
        return medicoRepository.buscarMedicos(busqueda)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicoDTO> listarPorEspecialidad(String especialidad) {
        return medicoRepository.findMedicosActivosPorEspecialidad(especialidad)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicoDTO buscarPorUsername(String username) {
        Medico medico = medicoRepository.findByUsuarioUsername(username)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado para el usuario: " + username));
        return convertirADTO(medico);
    }

    @Transactional
    public MedicoDTO crear(MedicoDTO dto) {
        if (medicoRepository.existsByCmp(dto.getCmp())) {
            throw new RuntimeException("Ya existe un médico con ese CMP");
        }
        if (dto.getCorreo() != null && medicoRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("Ya existe un médico con ese correo");
        }
        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            throw new RuntimeException("El username es obligatorio");
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }
        if (usuarioRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Ya existe un usuario con ese username");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(dto.getUsername());
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setRol(Rol.MEDICO);
        usuario.setActivo(true);
        usuario = usuarioRepository.save(usuario);

        Medico medico = convertirAEntidad(dto);
        medico.setUsuario(usuario);
        return convertirADTO(medicoRepository.save(medico));
    }

    @Transactional
    public MedicoDTO actualizar(Long id, MedicoDTO dto) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado con id: " + id));

        medico.setNombre(dto.getNombre());
        medico.setApellido(dto.getApellido());
        medico.setCmp(dto.getCmp());
        medico.setCorreo(dto.getCorreo());
        medico.setTelefono(dto.getTelefono());
        medico.setGenero(dto.getGenero());
        medico.setDescripcion(dto.getDescripcion());

        if (dto.getEspecialidadId() != null) {
            Especialidad especialidad = especialidadRepository.findById(dto.getEspecialidadId())
                    .orElseThrow(() -> new RuntimeException("Especialidad no encontrada"));
            medico.setEspecialidad(especialidad);
        }

        if (medico.getUsuario() != null) {
            Usuario usuario = medico.getUsuario();

            if (dto.getUsername() != null && !dto.getUsername().isBlank()
                    && !dto.getUsername().equals(usuario.getUsername())) {
                if (usuarioRepository.existsByUsername(dto.getUsername())) {
                    throw new RuntimeException("Ya existe un usuario con ese username");
                }
                usuario.setUsername(dto.getUsername());
            }

            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
            }

            usuarioRepository.save(usuario);
        }

        return convertirADTO(medicoRepository.save(medico));
    }

    @Transactional
    public MedicoDTO actualizarPropioPerfil(String username, MedicoDTO dto) {
        Medico medico = medicoRepository.findByUsuarioUsername(username)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado para el usuario: " + username));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            if (!dto.getNombre().matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$")) {
                throw new RuntimeException("El nombre solo puede contener letras");
            }
            medico.setNombre(dto.getNombre());
        }
        if (dto.getApellido() != null && !dto.getApellido().isBlank()) {
            if (!dto.getApellido().matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$")) {
                throw new RuntimeException("El apellido solo puede contener letras");
            }
            medico.setApellido(dto.getApellido());
        }
        if (dto.getCorreo() != null && !dto.getCorreo().isBlank()) {
            if (!dto.getCorreo().matches("^[a-zA-Z0-9._%+\\-]+@gmail\\.com$")) {
                throw new RuntimeException("Solo se permiten correos Gmail");
            }
            medico.setCorreo(dto.getCorreo());
        }
        if (dto.getTelefono() != null && !dto.getTelefono().isBlank()) {
            if (!dto.getTelefono().matches("^[0-9]{9}$")) {
                throw new RuntimeException("El teléfono debe tener exactamente 9 dígitos");
            }
            medico.setTelefono(dto.getTelefono());
        }

        if (medico.getUsuario() != null && dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPassword().length() < 6) {
                throw new RuntimeException("La contraseña debe tener mínimo 6 caracteres");
            }
            medico.getUsuario().setPassword(passwordEncoder.encode(dto.getPassword()));
            usuarioRepository.save(medico.getUsuario());
        }

        return convertirADTO(medicoRepository.save(medico));
    }

    @Transactional
    public void habilitar(Long id) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado con id: " + id));
        medico.setActivo(true);
        medicoRepository.save(medico);
        if (medico.getUsuario() != null) {
            medico.getUsuario().setActivo(true);
            usuarioRepository.save(medico.getUsuario());
        }
    }

    @Transactional
    public void deshabilitar(Long id) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado con id: " + id));
        medico.setActivo(false);
        medicoRepository.save(medico);
        if (medico.getUsuario() != null) {
            medico.getUsuario().setActivo(false);
            usuarioRepository.save(medico.getUsuario());
        }
    }

    @Transactional
    public void eliminar(Long id) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado con id: " + id));
        Usuario usuario = medico.getUsuario();
        medicoRepository.deleteById(id);
        if (usuario != null) {
            usuarioRepository.deleteById(usuario.getId());
        }
    }

    private MedicoDTO convertirADTO(Medico medico) {
        MedicoDTO dto = new MedicoDTO();
        dto.setId(medico.getId());
        dto.setNombre(medico.getNombre());
        dto.setApellido(medico.getApellido());
        dto.setCmp(medico.getCmp());
        dto.setCorreo(medico.getCorreo());
        dto.setTelefono(medico.getTelefono());
        dto.setGenero(medico.getGenero());
        dto.setDescripcion(medico.getDescripcion());
        dto.setActivo(medico.getActivo());
        if (medico.getEspecialidad() != null) {
            dto.setEspecialidadId(medico.getEspecialidad().getId());
            dto.setEspecialidadNombre(medico.getEspecialidad().getNombre());
        }
        if (medico.getUsuario() != null) {
            dto.setUsuarioId(medico.getUsuario().getId());
            dto.setUsername(medico.getUsuario().getUsername());
        }
        return dto;
    }

    private Medico convertirAEntidad(MedicoDTO dto) {
        Medico medico = new Medico();
        medico.setNombre(dto.getNombre());
        medico.setApellido(dto.getApellido());
        medico.setCmp(dto.getCmp());
        medico.setCorreo(dto.getCorreo());
        medico.setTelefono(dto.getTelefono());
        medico.setGenero(dto.getGenero());
        medico.setDescripcion(dto.getDescripcion());
        medico.setActivo(true);
        if (dto.getEspecialidadId() != null) {
            Especialidad especialidad = especialidadRepository.findById(dto.getEspecialidadId())
                    .orElseThrow(() -> new RuntimeException("Especialidad no encontrada"));
            medico.setEspecialidad(especialidad);
        }
        return medico;
    }
}