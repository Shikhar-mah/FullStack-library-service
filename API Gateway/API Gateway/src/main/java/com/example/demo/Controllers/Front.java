package com.example.demo.Controllers;


import com.example.demo.Config.JwtUtil;
import com.example.demo.Model.Admin;
import com.example.demo.Repo.AdminRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Slf4j
public class Front {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/whoami")
    public Mono<String> whoami(Authentication authentication) {
        return Mono.just(authentication.getAuthorities().toString());
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin a){
        //1️⃣  settings encrypt password
        a.setPassword(passwordEncoder.encode(a.getPassword()));
        log.info("The password is encoded to :",a.getPassword());
        // allocating the roles
        if(a.getEmail().contains("@hello.com")){
            a.setRole("ADMIN");
            System.out.printf("The email is :",a.getEmail());
        }
        else {
            a.setRole("USER");
        }
        //2️⃣ saving to db
        adminRepo.save(a);
        return ResponseEntity.ok("Saved");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> user) {

        String username = user.get("username");
        String password = user.get("password");

        // 1️⃣ Fetch from DB
        Admin admin = adminRepo.findById(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2️⃣ Compare encoded password
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // 3️⃣ Generate JWT
        String token = jwtUtil.generateToken(username);

        return ResponseEntity.ok(Map.of("token", token));
    }


    @GetMapping("/allUsers")
    public Flux<Admin> getAllUsers() {
        System.out.println("Getting all users :" + adminRepo.findAll());
        List<Admin> list_users = adminRepo.findAll().stream()
                .filter(user->user.getRole()!= null &&
                        user.getRole().equals("USER"))
                .toList();
        return Flux.fromIterable(list_users);
    }
}

