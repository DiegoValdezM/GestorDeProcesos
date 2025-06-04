import jwt from 'jsonwebtoken';
import { config } from '../config/config.js'; // Necesitamos el JWT_SECRET de la config del solicitudes-service
// Nota: El JWT_SECRET idealmente debería ser compartido de forma segura,
// o tener su propio servicio de configuración si los microservicios son muy independientes.
// Por simplicidad, por ahora lo leeremos del config del solicitudes-service.

/**
 * Middleware para verificar la validez del token JWT.
 * Adjunta req.user = { id, rol } si el token es válido.
 */
export const verifyToken = (req, res, next) => {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers['authorization'];
    // El token viene en formato "Bearer TOKEN_VALUE"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token de autenticación.' });
    }

    try {
        // Verificar el token usando el secreto JWT
        const decoded = jwt.verify(token, config.jwtSecret);
        // Adjuntar la información del usuario decodificada a la solicitud
        req.user = decoded; // { id: user_id, rol: user_rol }
        next(); // Continuar con la siguiente función de middleware/controlador
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token de autenticación expirado.' });
        }
        console.error('Error al verificar token:', error);
        return res.status(403).json({ message: 'Token de autenticación inválido.' });
    }
};

/**
 * Middleware para verificar si el usuario es un administrador.
 * Debe usarse después de verifyToken.
 */
export const isAdmin = (req, res, next) => {
    // req.user debe haber sido adjuntado por verifyToken
    if (req.user && req.user.rol === 'admin') {
        next(); // Es admin, continuar
    } else {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
    }
};

/**
 * Middleware para verificar si el usuario es un evaluador o un administrador.
 * Debe usarse después de verifyToken.
 */
export const isEvaluadorOrAdmin = (req, res, next) => {
    if (req.user && (req.user.rol === 'evaluador' || req.user.rol === 'admin')) {
        next(); // Es evaluador o admin, continuar
    } else {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de evaluador o administrador.' });
    }
};