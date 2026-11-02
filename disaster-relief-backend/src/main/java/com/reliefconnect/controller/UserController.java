package com.reliefconnect.controller;

import java.util.Optional;
import java.util.List;
import com.reliefconnect.entity.User;
import com.reliefconnect.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(
                userRepository.findByRoleIgnoreCaseOrderByNameAsc(role)
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {

        Optional<User> user = userRepository.findByEmailAndPasswordAndRole(
                loginRequest.getEmail(),
                loginRequest.getPassword(),
                loginRequest.getRole());

        if (user.isPresent()) {

            User loggedInUser = user.get();

            return ResponseEntity.ok(loggedInUser);

        }

        return ResponseEntity
                .status(401)
                .body("Invalid email, password, or role");
    }
}
