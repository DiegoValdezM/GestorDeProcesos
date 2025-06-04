import { getConnection, sql } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Busca un usuario por su ID.
 * @param {string} id - El UUID del usuario.
 * @returns {Promise<object|null>} El objeto usuario o null si no se encuentra.
 */
export const findById = async (id) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query('SELECT id, nombre, email, password_hash, rol FROM Usuarios WHERE id = @id');
        return result.recordset[0] || null;
    } catch (error) {
        console.error('Error en user.model.findById:', error);
        throw error;
    }
};

/**
 * Busca un usuario por su dirección de correo electrónico.
 * @param {string} email - El correo electrónico del usuario.
 * @returns {Promise<object|null>} El objeto usuario o null si no se encuentra.
 */
export const findByEmail = async (email) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('email', sql.VarChar(150), email)
            .query('SELECT id, nombre, email, password_hash, rol FROM Usuarios WHERE email = @email');
        return result.recordset[0] || null;
    } catch (error) {
        console.error('Error en user.model.findByEmail:', error);
        throw error;
    }
};

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {object} userData - Objeto con los datos del usuario (nombre, email, password_hash, rol).
 * @returns {Promise<object>} El objeto del usuario creado (sin el hash de contraseña).
 */
export const create = async (userData) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, uuidv4()) // <-- ¡CAMBIA ESTA LÍNEA! Usa uuidv4() para generar el UUID
            .input('nombre', sql.VarChar(150), userData.nombre)
            .input('email', sql.VarChar(150), userData.email)
            .input('password_hash', sql.Text, userData.password_hash)
            .input('rol', sql.VarChar(20), userData.rol)
            .query(`
                INSERT INTO Usuarios (id, nombre, email, password_hash, rol)
                OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol
                VALUES (@id, @nombre, @email, @password_hash, @rol)
            `);
        return result.recordset[0];
    } catch (error) {
        console.error('Error en user.model.create:', error);
        throw error;
    }
};