package cocteleriaBackendWeb.backendCocteleriaWeb.config;

import cocteleriaBackendWeb.backendCocteleriaWeb.seguridad.JwtFilter;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.*;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf().disable()
                .authorizeHttpRequests()

                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/jefe/**").hasRole("JEFE")
                .requestMatchers("/privado/**").hasAnyRole("ADMIN", "JEFE")

                .anyRequest().permitAll()

                .and()
                .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}