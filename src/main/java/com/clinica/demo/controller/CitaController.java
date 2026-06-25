package com.clinica.demo.controller;

import com.clinica.demo.dto.CitaDTO;
import com.clinica.demo.service.CitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CitaController {

    private final CitaService citaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<CitaDTO>> listarTodos() {
        return ResponseEntity.ok(citaService.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<CitaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.buscarPorId(id));
    }

    @GetMapping("/medico/{medicoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<CitaDTO>> listarPorMedico(@PathVariable Long medicoId) {
        return ResponseEntity.ok(citaService.listarPorMedico(medicoId));
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<CitaDTO>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(citaService.listarPorPaciente(pacienteId));
    }

    @GetMapping("/fecha")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<CitaDTO>> listarPorFecha(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(citaService.listarPorFecha(fecha));
    }

    @GetMapping("/hoy")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<CitaDTO>> listarCitasDelDia() {
        return ResponseEntity.ok(citaService.listarCitasDelDia());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<CitaDTO> crear(@Valid @RequestBody CitaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<CitaDTO> actualizar(@PathVariable Long id,
                                              @Valid @RequestBody CitaDTO dto) {
        return ResponseEntity.ok(citaService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<CitaDTO> confirmar(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.confirmar(id));
    }

    @PatchMapping("/{id}/atender")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<CitaDTO> atender(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.atender(id));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<CitaDTO> cancelar(@PathVariable Long id,
                                            @RequestParam String motivo) {
        return ResponseEntity.ok(citaService.cancelar(id, motivo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        citaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}