package com.clinica.demo.service;

import com.clinica.demo.dto.RecepcionistaDTO;
import com.clinica.demo.model.Recepcionista;
import com.clinica.demo.model.Rol;
import com.clinica.demo.model.Usuario;
import com.clinica.demo.repository.RecepcionistaRepository;
import com.clinica.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecepcionistaService {

    private final RecepcionistaRepository recepcionistaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<RecepcionistaDTO> listarTodos() {
        return recepcionistaRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecepcionistaDTO> listarActivos() {
        return recepcionistaRepository.findByActivoTrue()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecepcionistaDTO buscarPorId(Long id) {
        Recepcionista recepcionista = recepcionistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada con id: " + id));
        return convertirADTO(recepcionista);
    }

    @Transactional(readOnly = true)
    public RecepcionistaDTO buscarPorUsername(String username) {
        Recepcionista recepcionista = recepcionistaRepository.findByUsuarioUsername(username)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada para el usuario: " + username));
        return convertirADTO(recepcionista);
    }

    @Transactional
    public RecepcionistaDTO crear(RecepcionistaDTO dto) {
        if (dto.getDni() != null && recepcionistaRepository.existsByDni(dto.getDni())) {
            throw new RuntimeException("Ya existe una recepcionista con ese DNI");
        }
        if (dto.getCorreo() != null && recepcionistaRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("Ya existe una recepcionista con ese correo");
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
        usuario.setRol(Rol.RECEPCIONISTA);
        usuario.setActivo(true);
        usuario = usuarioRepository.save(usuario);

        Recepcionista recepcionista = convertirAEntidad(dto);
        recepcionista.setUsuario(usuario);
        return convertirADTO(recepcionistaRepository.save(recepcionista));
    }

    @Transactional
    public RecepcionistaDTO actualizar(Long id, RecepcionistaDTO dto) {
        Recepcionista recepcionista = recepcionistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada con id: " + id));

        recepcionista.setNombre(dto.getNombre());
        recepcionista.setApellido(dto.getApellido());
        recepcionista.setCorreo(dto.getCorreo());
        recepcionista.setTelefono(dto.getTelefono());
        recepcionista.setDni(dto.getDni());

        if (recepcionista.getUsuario() != null) {
            Usuario usuario = recepcionista.getUsuario();

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

        return convertirADTO(recepcionistaRepository.save(recepcionista));
    }

    @Transactional
    public RecepcionistaDTO actualizarPropioPerfil(String username, RecepcionistaDTO dto) {
        Recepcionista recepcionista = recepcionistaRepository.findByUsuarioUsername(username)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada para el usuario: " + username));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            if (!dto.getNombre().matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$")) {
                throw new RuntimeException("El nombre solo puede contener letras");
            }
            recepcionista.setNombre(dto.getNombre());
        }
        if (dto.getApellido() != null && !dto.getApellido().isBlank()) {
            if (!dto.getApellido().matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$")) {
                throw new RuntimeException("El apellido solo puede contener letras");
            }
            recepcionista.setApellido(dto.getApellido());
        }
        if (dto.getCorreo() != null && !dto.getCorreo().isBlank()) {
            if (!dto.getCorreo().matches("^[a-zA-Z0-9._%+\\-]+@gmail\\.com$")) {
                throw new RuntimeException("Solo se permiten correos Gmail");
            }
            recepcionista.setCorreo(dto.getCorreo());
        }
        if (dto.getTelefono() != null && !dto.getTelefono().isBlank()) {
            if (!dto.getTelefono().matches("^[0-9]{9}$")) {
                throw new RuntimeException("El teléfono debe tener exactamente 9 dígitos");
            }
            recepcionista.setTelefono(dto.getTelefono());
        }

        if (recepcionista.getUsuario() != null && dto.getPassword() != null && !dto.getPassword().isBlank()) {
            if (dto.getPassword().length() < 6) {
                throw new RuntimeException("La contraseña debe tener mínimo 6 caracteres");
            }
            recepcionista.getUsuario().setPassword(passwordEncoder.encode(dto.getPassword()));
            usuarioRepository.save(recepcionista.getUsuario());
        }

        return convertirADTO(recepcionistaRepository.save(recepcionista));
    }

    @Transactional
    public void habilitar(Long id) {
        Recepcionista recepcionista = recepcionistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada con id: " + id));
        recepcionista.setActivo(true);
        recepcionistaRepository.save(recepcionista);
        if (recepcionista.getUsuario() != null) {
            recepcionista.getUsuario().setActivo(true);
            usuarioRepository.save(recepcionista.getUsuario());
        }
    }

    @Transactional
    public void deshabilitar(Long id) {
        Recepcionista recepcionista = recepcionistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada con id: " + id));
        recepcionista.setActivo(false);
        recepcionistaRepository.save(recepcionista);
        if (recepcionista.getUsuario() != null) {
            recepcionista.getUsuario().setActivo(false);
            usuarioRepository.save(recepcionista.getUsuario());
        }
    }

    @Transactional
    public void eliminar(Long id) {
        Recepcionista recepcionista = recepcionistaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada con id: " + id));
        Usuario usuario = recepcionista.getUsuario();
        recepcionistaRepository.deleteById(id);
        if (usuario != null) {
            usuarioRepository.deleteById(usuario.getId());
        }
    }

    private RecepcionistaDTO convertirADTO(Recepcionista recepcionista) {
        RecepcionistaDTO dto = new RecepcionistaDTO();
        dto.setId(recepcionista.getId());
        dto.setNombre(recepcionista.getNombre());
        dto.setApellido(recepcionista.getApellido());
        dto.setCorreo(recepcionista.getCorreo());
        dto.setTelefono(recepcionista.getTelefono());
        dto.setDni(recepcionista.getDni());
        dto.setActivo(recepcionista.getActivo());
        if (recepcionista.getUsuario() != null) {
            dto.setUsuarioId(recepcionista.getUsuario().getId());
            dto.setUsername(recepcionista.getUsuario().getUsername());
        }
        return dto;
    }

    private Recepcionista convertirAEntidad(RecepcionistaDTO dto) {
        Recepcionista recepcionista = new Recepcionista();
        recepcionista.setNombre(dto.getNombre());
        recepcionista.setApellido(dto.getApellido());
        recepcionista.setCorreo(dto.getCorreo());
        recepcionista.setTelefono(dto.getTelefono());
        recepcionista.setDni(dto.getDni());
        recepcionista.setActivo(true);
        return recepcionista;
    }
}