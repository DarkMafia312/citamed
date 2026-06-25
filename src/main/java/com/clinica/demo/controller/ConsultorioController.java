package com.clinica.demo.controller;

import com.clinica.demo.dto.ConsultorioDTO;
import com.clinica.demo.service.ConsultorioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/consultorios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ConsultorioController {

    private final ConsultorioService consultorioService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<ConsultorioDTO>> listarTodos() {
        return ResponseEntity.ok(consultorioService.listarTodos());
    }

    @GetMapping("/disponibles")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<ConsultorioDTO>> listarDisponibles() {
        return ResponseEntity.ok(consultorioService.listarDisponibles());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<ConsultorioDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(consultorioService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultorioDTO> crear(@Valid @RequestBody ConsultorioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultorioService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultorioDTO> actualizar(@PathVariable Long id,
                                                     @Valid @RequestBody ConsultorioDTO dto) {
        return ResponseEntity.ok(consultorioService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/habilitar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> habilitar(@PathVariable Long id) {
        consultorioService.habilitar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deshabilitar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deshabilitar(@PathVariable Long id) {
        consultorioService.deshabilitar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        consultorioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}