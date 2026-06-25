package com.clinica.demo;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerarPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("1234"));
        System.out.println(encoder.encode("admin123"));
        System.out.println(encoder.encode("medico123"));
        System.out.println(encoder.encode("recep123"));
    }
}