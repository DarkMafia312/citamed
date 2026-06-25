package com.clinica.demo.repository;

import com.clinica.demo.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    Optional<Paciente> findByDni(String dni);

    boolean existsByDni(String dni);
    boolean existsByCorreo(String correo);

    long countByActivoTrue();

    List<Paciente> findByActivoTrue();
    List<Paciente> findByActivoFalse();
    List<Paciente> findByRecepcionistaId(Long recepcionistaId);

    @Query("SELECT p FROM Paciente p WHERE p.activo = true AND " +
            "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
            "LOWER(p.apellido) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
            "p.dni LIKE CONCAT('%', :busqueda, '%'))")
    List<Paciente> buscarPacientes(String busqueda);

    @Query("SELECT p FROM Paciente p WHERE p.activo = true AND p.genero = :genero")
    List<Paciente> findByGenero(String genero);

    @Query("SELECT p FROM Paciente p WHERE p.activo = true AND p.seguroMedico = :seguroMedico")
    List<Paciente> findBySeguroMedico(String seguroMedico);
}