package com.clinica.demo.controller;

import com.clinica.demo.dto.HorarioMedicoDTO;
import com.clinica.demo.service.HorarioMedicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class HorarioMedicoController {

    private final HorarioMedicoService horarioMedicoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<HorarioMedicoDTO>> listarTodos() {
        return ResponseEntity.ok(horarioMedicoService.listarTodos());
    }

    @GetMapping("/medico/{medicoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<HorarioMedicoDTO>> listarPorMedico(@PathVariable Long medicoId) {
        return ResponseEntity.ok(horarioMedicoService.listarPorMedico(medicoId));
    }

    @GetMapping("/medico/{medicoId}/disponibles")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<HorarioMedicoDTO>> listarDisponiblesPorMedico(
            @PathVariable Long medicoId) {
        return ResponseEntity.ok(horarioMedicoService.listarDisponiblesPorMedico(medicoId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<HorarioMedicoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(horarioMedicoService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HorarioMedicoDTO> crear(@Valid @RequestBody HorarioMedicoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(horarioMedicoService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<HorarioMedicoDTO> actualizar(@PathVariable Long id,
                                                       @Valid @RequestBody HorarioMedicoDTO dto) {
        return ResponseEntity.ok(horarioMedicoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/habilitar")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<Void> habilitar(@PathVariable Long id) {
        horarioMedicoService.habilitar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deshabilitar")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<Void> deshabilitar(@PathVariable Long id) {
        horarioMedicoService.deshabilitar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        horarioMedicoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}