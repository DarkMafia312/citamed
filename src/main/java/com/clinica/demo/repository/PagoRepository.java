package com.clinica.demo.repository;

import com.clinica.demo.model.Pago;
import com.clinica.demo.model.EstadoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByPacienteId(Long pacienteId);
    List<Pago> findByRecepcionistaId(Long recepcionistaId);
    List<Pago> findByEstado(EstadoPago estado);
    List<Pago> findByFecha(LocalDate fecha);
    List<Pago> findByMetodoPago(String metodoPago);

    @Query("SELECT SUM(p.monto) FROM Pago p WHERE p.paciente.id = :pacienteId AND p.estado = 'PAGADO'")
    Double totalPagadoPorPaciente(Long pacienteId);

    @Query("SELECT p FROM Pago p WHERE p.fecha = :fecha")
    List<Pago> findPagosDelDia(LocalDate fecha);
}