package com.clinica.demo.repository;

import com.clinica.demo.model.HorarioMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HorarioMedicoRepository extends JpaRepository<HorarioMedico, Long> {

    List<HorarioMedico> findByMedicoId(Long medicoId);

    List<HorarioMedico> findByMedicoIdAndDisponibleTrue(Long medicoId);

    List<HorarioMedico> findByMedicoIdAndDiaSemanaAndDisponibleTrue(Long medicoId, String diaSemana);

    @Query("SELECT h FROM HorarioMedico h WHERE h.medico.id = :medicoId AND h.diaSemana = :dia")
    List<HorarioMedico> findByMedicoIdAndDia(Long medicoId, String dia);

    @Query("SELECT COUNT(h) > 0 FROM HorarioMedico h WHERE h.medico.id = :medicoId " +
            "AND h.diaSemana = :dia AND h.disponible = true")
    boolean medicoTrabajaElDia(Long medicoId, String dia);
}