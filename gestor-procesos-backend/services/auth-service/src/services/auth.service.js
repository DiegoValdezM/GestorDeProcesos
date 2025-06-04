import * as userModel from '../models/user.model.js'; // <-- ¡AÑADE ESTA LÍNEA!
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

const HASH_SALT_ROUNDS = 10;

export const registerUser = async (nombre, email, password, rol) => {
    try {
        // 1. Verificar si el email ya existe usando el modelo
        const userExists = await userModel.findByEmail(email); // <-- USANDO EL MODELO

        if (userExists) { // Simplificado
            throw new Error('El email ya está registrado.');
        }

        // 2. Hashear la contraseña
        const passwordHash = await bcrypt.hash(password, HASH_SALT_ROUNDS);

        // 3. Insertar nuevo usuario en la base de datos usando el modelo
        const newUser = await userModel.create({ // <-- USANDO EL MODELO
            nombre,
            email,
            password_hash: passwordHash,
            rol
        });

        return newUser;
    } catch (error) {
        console.error('Error al registrar usuario en el servicio:', error);
        throw error;
    }
};

export const loginUser = async (email, password) => {
    try {
        // 1. Buscar usuario por email usando el modelo
        const user = await userModel.findByEmail(email); // <-- USANDO EL MODELO

        if (!user) {
            throw new Error('Email o contraseña incorrectos.');
        }

        // 2. Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            throw new Error('Email o contraseña incorrectos.');
        }

        // 3. Generar JWT
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        return {
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        };
    } catch (error) {
        console.error('Error al iniciar sesión en el servicio:', error);
        throw error;
    }
};