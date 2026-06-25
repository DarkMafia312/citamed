package com.clinica.demo.controller;

import com.clinica.demo.dto.RecepcionistaDTO;
import com.clinica.demo.service.RecepcionistaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recepcionistas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class RecepcionistaController {

    private final RecepcionistaService recepcionistaService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecepcionistaDTO>> listarTodos() {
        return ResponseEntity.ok(recepcionistaService.listarTodos());
    }

    @GetMapping("/activos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecepcionistaDTO>> listarActivos() {
        return ResponseEntity.ok(recepcionistaService.listarActivos());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('RECEPCIONISTA')")
    public ResponseEntity<RecepcionistaDTO> obtenerMiPerfil(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(recepcionistaService.buscarPorUsername(username));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('RECEPCIONISTA')")
    public ResponseEntity<RecepcionistaDTO> actualizarMiPerfil(@RequestBody RecepcionistaDTO dto,
                                                               Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(recepcionistaService.actualizarPropioPerfil(username, dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecepcionistaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(recepcionistaService.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecepcionistaDTO> crear(@Valid @RequestBody RecepcionistaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recepcionistaService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecepcionistaDTO> actualizar(@PathVariable Long id,
                                                       @Valid @RequestBody RecepcionistaDTO dto) {
        return ResponseEntity.ok(recepcionistaService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/habilitar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> habilitar(@PathVariable Long id) {
        recepcionistaService.habilitar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deshabilitar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deshabilitar(@PathVariable Long id) {
        recepcionistaService.deshabilitar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        recepcionistaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}