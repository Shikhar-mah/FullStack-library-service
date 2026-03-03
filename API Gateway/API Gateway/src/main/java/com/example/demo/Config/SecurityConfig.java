package com.example.demo.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import reactor.core.publisher.Mono;
import java.util.List;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            JwtAuthenticationManager authenticationManager) {

        AuthenticationWebFilter jwtFilter =
                new AuthenticationWebFilter(authenticationManager);

        jwtFilter.setServerAuthenticationConverter(exchange -> {

            String authHeader = exchange.getRequest()
                    .getHeaders()
                    .getFirst("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {

                String token = authHeader.substring(7);

                return Mono.just(
                        new UsernamePasswordAuthenticationToken(token, token)
                );
            }

            return Mono.empty();
        });

        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()   // 🔥 ADD THIS
                        .pathMatchers("/auth/login").permitAll()
                        // USER only
                        .pathMatchers("/BOOK-SERVICE/user/**").hasRole("USER")
                        // ADMIN only
                        .pathMatchers("/BOOK-SERVICE/**").hasRole("ADMIN")
                        .anyExchange().authenticated()
                )
                .addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}