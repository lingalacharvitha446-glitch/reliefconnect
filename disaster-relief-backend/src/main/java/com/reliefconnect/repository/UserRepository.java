package com.reliefconnect.repository;

import com.reliefconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndPasswordAndRole(
            String email,
            String password,
            String role);

    List<User> findByRoleIgnoreCaseOrderByNameAsc(String role);
}
