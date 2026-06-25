package com.clinica.demo.controller;

import com.clinica.demo.dto.HistorialMedicoDTO;
import com.clinica.demo.service.HistorialMedicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class HistorialMedicoController {

    private final HistorialMedicoService historialMedicoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<HistorialMedicoDTO>> listarTodos() {
        return ResponseEntity.ok(historialMedicoService.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<HistorialMedicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(historialMedicoService.buscarPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<HistorialMedicoDTO>> listarPorPaciente(
            @PathVariable Long pacienteId) {
        return ResponseEntity.ok(historialMedicoService.listarPorPaciente(pacienteId));
    }

    @GetMapping("/medico/{medicoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<HistorialMedicoDTO>> listarPorMedico(
            @PathVariable Long medicoId) {
        return ResponseEntity.ok(historialMedicoService.listarPorMedico(medicoId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<HistorialMedicoDTO> crear(@Valid @RequestBody HistorialMedicoDTO dto,
                                                    Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(historialMedicoService.crear(dto, authentication));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<HistorialMedicoDTO> actualizar(@PathVariable Long id,
                                                         @Valid @RequestBody HistorialMedicoDTO dto,
                                                         Authentication authentication) {
        return ResponseEntity.ok(historialMedicoService.actualizar(id, dto, authentication));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        historialMedicoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}