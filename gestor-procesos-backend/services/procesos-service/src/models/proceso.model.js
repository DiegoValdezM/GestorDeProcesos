import { getConnection, sql } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
/**
 * Crea un nuevo proceso en la base de datos.
 * @param {object} procesoData - Datos del proceso (nombre, descripcion, id_solicitud, archivo_url).
 * @returns {Promise<object>} El objeto del proceso creado.
 */
export const create = async (procesoData) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, uuidv4()) // <-- ¡CAMBIA ESTA LÍNEA! Usa uuidv4() para generar el UUID
            .input('nombre', sql.VarChar(150), procesoData.nombre)
            .input('descripcion', sql.Text, procesoData.descripcion)
            .input('id_solicitud', sql.UniqueIdentifier, procesoData.id_solicitud)
            .input('archivo_url', sql.Text, procesoData.archivo_url || null)
            .input('fecha_registro', sql.DateTime, new Date())
            .query(`
                INSERT INTO Procesos (id, nombre, descripcion, id_solicitud, archivo_url, fecha_registro)
                OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.descripcion, INSERTED.id_solicitud, INSERTED.archivo_url, INSERTED.fecha_registro
                VALUES (@id, @nombre, @descripcion, @id_solicitud, @archivo_url, @fecha_registro)
            `);
        return result.recordset[0];
    } catch (error) {
        console.error('Error en proceso.model.create:', error);
        throw error;
    }
};

/**
 * Lista todos los procesos o filtra por id de solicitud.
 * @param {string|null} idSolicitud - ID de la solicitud para filtrar procesos.
 * @returns {Promise<Array>} Lista de objetos de proceso.
 */
export const findAll = async (idSolicitud = null) => {
    try {
        const pool = await getConnection();
        let query = `
            SELECT
                id,
                nombre,
                descripcion,
                id_solicitud,
                archivo_url,
                fecha_registro
            FROM Procesos
        `;
        let request = pool.request();

        if (idSolicitud) {
            query += ` WHERE id_solicitud = @idSolicitud`;
            request.input('idSolicitud', sql.UniqueIdentifier, idSolicitud);
        }

        query += ` ORDER BY fecha_registro DESC`;

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Error en proceso.model.findAll:', error);
        throw error;
    }
};