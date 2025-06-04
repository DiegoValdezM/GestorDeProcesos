import * as authService from '../services/auth.service.js';

export const register = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ message: 'Nombre, email, contraseña y rol son requeridos.' });
        }

        const newUser = await authService.registerUser(nombre, email, password, rol);
        res.status(201).json({ message: 'Usuario registrado exitosamente.', user: newUser });
    } catch (error) {
        console.error('Error en el controlador de registro:', error);
        if (error.message.includes('El email ya está registrado')) {
            return res.status(409).json({ message: error.message }); // 409 Conflict
        }
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
        }

        const authResult = await authService.loginUser(email, password);
        res.status(200).json({ message: 'Inicio de sesión exitoso.', ...authResult });
    } catch (error) {
        console.error('Error en el controlador de login:', error);
        if (error.message.includes('Email o contraseña incorrectos')) {
            return res.status(401).json({ message: error.message }); // 401 Unauthorized
        }
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.', error: error.message });
    }
};