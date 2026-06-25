package com.clinica.demo.controller;

import com.clinica.demo.dto.EspecialidadDTO;
import com.clinica.demo.service.EspecialidadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/especialidades")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<List<EspecialidadDTO>> listarTodos() {
        return ResponseEntity.ok(especialidadService.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'RECEPCIONISTA')")
    public ResponseEntity<EspecialidadDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(especialidadService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EspecialidadDTO> crear(@Valid @RequestBody EspecialidadDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(especialidadService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EspecialidadDTO> actualizar(@PathVariable Long id,
                                                      @Valid @RequestBody EspecialidadDTO dto) {
        return ResponseEntity.ok(especialidadService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        especialidadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}