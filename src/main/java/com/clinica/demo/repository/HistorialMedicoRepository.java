package com.clinica.demo.repository;

import com.clinica.demo.model.HistorialMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistorialMedicoRepository extends JpaRepository<HistorialMedico, Long> {

    List<HistorialMedico> findByPacienteId(Long pacienteId);
    List<HistorialMedico> findByMedicoId(Long medicoId);
    List<HistorialMedico> findByCitaId(Long citaId);
}
