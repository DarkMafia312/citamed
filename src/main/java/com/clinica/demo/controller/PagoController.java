package com.clinica.demo.controller;

import com.clinica.demo.dto.PagoDTO;
import com.clinica.demo.service.PagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<PagoDTO>> listarTodos() {
        return ResponseEntity.ok(pagoService.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<PagoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.buscarPorId(id));
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<PagoDTO>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(pagoService.listarPorPaciente(pacienteId));
    }

    @GetMapping("/recepcionista/{recepcionistaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<List<PagoDTO>> listarPorRecepcionista(
            @PathVariable Long recepcionistaId) {
        return ResponseEntity.ok(pagoService.listarPorRecepcionista(recepcionistaId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<PagoDTO> crear(@Valid @RequestBody PagoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<PagoDTO> actualizar(@PathVariable Long id,
                                              @Valid @RequestBody PagoDTO dto) {
        return ResponseEntity.ok(pagoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')")
    public ResponseEntity<PagoDTO> confirmarPago(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.confirmarPago(id));
    }

    @PatchMapping("/{id}/anular")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagoDTO> anularPago(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.anularPago(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pagoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}