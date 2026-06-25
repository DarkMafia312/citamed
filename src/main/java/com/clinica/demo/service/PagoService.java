package com.clinica.demo.service;

import com.clinica.demo.dto.PagoDTO;
import com.clinica.demo.model.*;
import com.clinica.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PacienteRepository pacienteRepository;
    private final RecepcionistaRepository recepcionistaRepository;
    private final CitaRepository citaRepository;

    @Transactional(readOnly = true)
    public List<PagoDTO> listarTodos() {
        return pagoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PagoDTO> listarPorPaciente(Long pacienteId) {
        return pagoRepository.findByPacienteId(pacienteId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PagoDTO> listarPorRecepcionista(Long recepcionistaId) {
        return pagoRepository.findByRecepcionistaId(recepcionistaId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagoDTO buscarPorId(Long id) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
        return convertirADTO(pago);
    }

    @Transactional
    public PagoDTO crear(PagoDTO dto) {
        Pago pago = convertirAEntidad(dto);
        pago.setFecha(LocalDate.now());
        pago.setEstado(EstadoPago.PENDIENTE);
        return convertirADTO(pagoRepository.save(pago));
    }

    @Transactional
    public PagoDTO actualizar(Long id, PagoDTO dto) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
        pago.setMonto(dto.getMonto());
        pago.setConcepto(dto.getConcepto());
        pago.setMetodoPago(dto.getMetodoPago());
        pago.setNumeroBoleta(dto.getNumeroBoleta());
        return convertirADTO(pagoRepository.save(pago));
    }

    @Transactional
    public PagoDTO confirmarPago(Long id) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
        pago.setEstado(EstadoPago.PAGADO);
        return convertirADTO(pagoRepository.save(pago));
    }

    @Transactional
    public PagoDTO anularPago(Long id) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
        pago.setEstado(EstadoPago.ANULADO);
        return convertirADTO(pagoRepository.save(pago));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!pagoRepository.existsById(id)) {
            throw new RuntimeException("Pago no encontrado con id: " + id);
        }
        pagoRepository.deleteById(id);
    }

    private PagoDTO convertirADTO(Pago pago) {
        PagoDTO dto = new PagoDTO();
        dto.setId(pago.getId());
        dto.setMonto(pago.getMonto());
        dto.setFecha(pago.getFecha());
        dto.setEstado(pago.getEstado());
        dto.setConcepto(pago.getConcepto());
        dto.setMetodoPago(pago.getMetodoPago());
        dto.setNumeroBoleta(pago.getNumeroBoleta());
        dto.setFechaCreacion(pago.getFechaCreacion());
        if (pago.getPaciente() != null) {
            dto.setPacienteId(pago.getPaciente().getId());
            dto.setPacienteNombre(pago.getPaciente().getNombre()
                    + " " + pago.getPaciente().getApellido());
        }
        if (pago.getRecepcionista() != null) {
            dto.setRecepcionistaId(pago.getRecepcionista().getId());
            dto.setRecepcionistaNombre(pago.getRecepcionista().getNombre()
                    + " " + pago.getRecepcionista().getApellido());
        }
        if (pago.getCita() != null) {
            dto.setCitaId(pago.getCita().getId());
        }
        return dto;
    }

    private Pago convertirAEntidad(PagoDTO dto) {
        Pago pago = new Pago();
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        pago.setPaciente(paciente);
        pago.setMonto(dto.getMonto());
        pago.setConcepto(dto.getConcepto());
        pago.setMetodoPago(dto.getMetodoPago());
        pago.setNumeroBoleta(dto.getNumeroBoleta());
        if (dto.getRecepcionistaId() != null) {
            Recepcionista recepcionista = recepcionistaRepository.findById(dto.getRecepcionistaId())
                    .orElseThrow(() -> new RuntimeException("Recepcionista no encontrada"));
            pago.setRecepcionista(recepcionista);
        }
        if (dto.getCitaId() != null) {
            Cita cita = citaRepository.findById(dto.getCitaId())
                    .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
            pago.setCita(cita);
        }
        return pago;
    }
}