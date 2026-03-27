package cocteleriaBackendWeb.backendCocteleriaWeb.servicio;

import cocteleriaBackendWeb.backendCocteleriaWeb.Dto.AuthRequest;
import cocteleriaBackendWeb.backendCocteleriaWeb.Dto.AuthResponse;
import cocteleriaBackendWeb.backendCocteleriaWeb.entidades.Usuario;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AuthService {

    private final PasswordEncoder encoder;

    private final List<Usuario> usuarios = new ArrayList<>();

    public AuthService(PasswordEncoder encoder) {
        this.encoder = encoder;

        // 👨‍💼 JEFE
        usuarios.add(new Usuario(
                "Carlos",
                "Lopez",
                "jefe@mail.com",
                encoder.encode("123456"),
                "JEFE"
        ));

        // 👷 EMPLEADO
        usuarios.add(new Usuario(
                "Ana",
                "Perez",
                "empleado@mail.com",
                encoder.encode("123456"),
                "EMPLEADO"
        ));
    }

    // 🔹 REGISTER
    public AuthResponse register(Usuario usuario) {

        usuario.setContraseña(encoder.encode(usuario.getContraseña()));

        if (usuario.getRol() == null) {
            usuario.setRol("EMPLEADO");
        }

        usuarios.add(usuario);

        return new AuthResponse("TOKEN_FAKE", usuario.getRol());
    }

    // 🔹 LOGIN
    public AuthResponse login(AuthRequest request) {

        Usuario user = usuarios.stream()
                .filter(u -> u.getCorreo().equals(request.getCorreo()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));

        if (!encoder.matches(request.getContraseña(), user.getContraseña())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        return new AuthResponse("TOKEN_FAKE", user.getRol());
    }
}