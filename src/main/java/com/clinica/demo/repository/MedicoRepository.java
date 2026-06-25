package com.clinica.demo.repository;

import com.clinica.demo.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    long countByActivoTrue();

    Optional<Medico> findByCmp(String cmp);

    boolean existsByCmp(String cmp);

    boolean existsByCorreo(String correo);

    List<Medico> findByActivoTrue();
    List<Medico> findByActivoFalse();
    List<Medico> findByEspecialidadId(Long especialidadId);

    Optional<Medico> findByUsuarioUsername(String username);

    @Query("SELECT m FROM Medico m WHERE m.activo = true AND m.especialidad.nombre = :especialidad")
    List<Medico> findMedicosActivosPorEspecialidad(String especialidad);

    @Query("SELECT m FROM Medico m WHERE m.activo = true AND " +
            "(LOWER(m.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
            "LOWER(m.apellido) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
            "m.cmp LIKE CONCAT('%', :busqueda, '%'))")
    List<Medico> buscarMedicos(String busqueda);
}