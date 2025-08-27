package com.example.dicomproject.security;

import com.example.dicomproject.userrepo.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
public class SecurityBeans {
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> {
            var user = userRepository.findWithRolesByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            var authorities = user.getRoles().stream()
                    .map(r -> new SimpleGrantedAuthority(r.getName()))
                    .toList();
            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(), user.getPasswordHash(), user.isEnabled(),
                    true, true, true, authorities
            );
        };
    }
}