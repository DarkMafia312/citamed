package com.clinica.demo.controller;

import com.clinica.demo.dto.LoginRequest;
import com.clinica.demo.dto.LoginResponse;
import com.clinica.demo.model.Usuario;
import com.clinica.demo.repository.UsuarioRepository;
import com.clinica.demo.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtils.generateToken(userDetails);

            Usuario usuario = usuarioRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            return ResponseEntity.ok(new LoginResponse(
                    token,
                    usuario.getUsername(),
                    usuario.getRol().name(),
                    "Login exitoso"
            ));

        } catch (DisabledException ex) {
            return construirError("Tu cuenta está deshabilitada. Contacta al administrador del sistema.", HttpStatus.UNAUTHORIZED);
        } catch (UsernameNotFoundException | BadCredentialsException ex) {
            return construirError("Usuario o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.", HttpStatus.UNAUTHORIZED);
        } catch (Exception ex) {
            return construirError("Ocurrió un error al iniciar sesión. Inténtalo nuevamente.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ResponseEntity<?> construirError(String mensaje, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("mensaje", mensaje);
        body.put("error", "Error de autenticación");
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        return ResponseEntity.status(status).body(body);
    }
}