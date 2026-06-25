package com.clinica.demo.repository;

import com.clinica.demo.model.Consultorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultorioRepository extends JpaRepository<Consultorio, Long> {

    Optional<Consultorio> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<Consultorio> findByDisponibleTrue();
    List<Consultorio> findByTipo(String tipo);
}