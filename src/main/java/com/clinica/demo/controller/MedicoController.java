package com.clinica.demo.controller;

import com.clinica.demo.dto.MedicoDTO;
import com.clinica.demo.service.MedicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MedicoController {

    private final MedicoService medicoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<MedicoDTO>> listarTodos() {
        return ResponseEntity.ok(medicoService.listarTodos());
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<MedicoDTO>> listarActivos() {
        return ResponseEntity.ok(medicoService.listarActivos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<MedicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.buscarPorId(id));
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<MedicoDTO>> buscar(@RequestParam String busqueda) {
        return ResponseEntity.ok(medicoService.buscarMedicos(busqueda));
    }

    @GetMapping("/especialidad")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<MedicoDTO>> listarPorEspecialidad(@RequestParam String nombre) {
        return ResponseEntity.ok(medicoService.listarPorEspecialidad(nombre));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<MedicoDTO> obtenerMiPerfil(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(medicoService.buscarPorUsername(username));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<MedicoDTO> actualizarMiPerfil(@RequestBody MedicoDTO dto,
                                                        Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(medicoService.actualizarPropioPerfil(username, dto));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicoDTO> crear(@Valid @RequestBody MedicoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicoService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicoDTO> actualizar(@PathVariable Long id,
                                                @Valid @RequestBody MedicoDTO dto) {
        return ResponseEntity.ok(medicoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/habilitar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> habilitar(@PathVariable Long id) {
        medicoService.habilitar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deshabilitar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deshabilitar(@PathVariable Long id) {
        medicoService.deshabilitar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        medicoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}