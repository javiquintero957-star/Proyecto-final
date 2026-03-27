package cocteleriaBackendWeb.backendCocteleriaWeb.controlador;

import cocteleriaBackendWeb.backendCocteleriaWeb.Dto.AuthRequest;
import cocteleriaBackendWeb.backendCocteleriaWeb.Dto.AuthResponse;
import cocteleriaBackendWeb.backendCocteleriaWeb.entidades.Usuario;
import cocteleriaBackendWeb.backendCocteleriaWeb.servicio.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody Usuario usuario) {
        return service.register(usuario);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return service.login(request);
    }
}