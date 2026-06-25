package com.clinica.demo.repository;

import com.clinica.demo.model.Cita;
import com.clinica.demo.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    long countByEstado(EstadoCita estado);

    List<Cita> findByMedicoId(Long medicoId);
    List<Cita> findByPacienteId(Long pacienteId);
    List<Cita> findByEstado(EstadoCita estado);
    List<Cita> findByFecha(LocalDate fecha);

    @Query("SELECT c FROM Cita c WHERE c.medico.id = :medicoId AND c.fecha = :fecha")
    List<Cita> findCitasDelDiaPorMedico(Long medicoId, LocalDate fecha);

    @Query("SELECT COUNT(c) > 0 FROM Cita c WHERE c.medico.id = :medicoId " +
            "AND c.fecha = :fecha AND c.hora = :hora " +
            "AND c.estado != 'CANCELADA'")
    boolean existeCitaEnHorario(Long medicoId, LocalDate fecha, java.time.LocalTime hora);

    @Query("SELECT COUNT(c) FROM Cita c WHERE c.fecha = :fecha")
    long countCitasPorFecha(LocalDate fecha);
}