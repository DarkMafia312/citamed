package com.clinica.demo.repository;

import com.clinica.demo.model.Recepcionista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecepcionistaRepository extends JpaRepository<Recepcionista, Long> {

    long countByActivoTrue();

    Optional<Recepcionista> findByUsuarioId(Long usuarioId);
    Optional<Recepcionista> findByUsuarioUsername(String username);

    boolean existsByDni(String dni);
    boolean existsByCorreo(String correo);

    List<Recepcionista> findByActivoTrue();
    List<Recepcionista> findByActivoFalse();
}