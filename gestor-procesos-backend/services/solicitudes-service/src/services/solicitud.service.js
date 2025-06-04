import { getConnection, sql } from '../config/db.js';
import { generarFolio } from '../utils/folioGenerator.js';
import { evaluarPrioridad } from '../utils/priorityEvaluator.js';
import { uploadFileToBlob } from '../config/blobStorage.js';

export const crearNuevaSolicitud = async (solicitudData, file) => {
    const { descripcion, tipo_area, creado_por_id } = solicitudData;

    let archivoUrl = null;
    if (file) {
        try {
            archivoUrl = await uploadFileToBlob(file);
        } catch (error) {
            console.error('Error uploading file to blob:', error);
            throw new Error('Error al subir el archivo adjunto.');
        }
    }

    const folio = await generarFolio();
    const prioridad = evaluarPrioridad(descripcion);
    const fechaCreacion = new Date();
    const estatusInicial = 'Pendiente Evaluación';

    const pool = await getConnection();
    const result = await pool.request()
        .input('folio', sql.VarChar(20), folio)
        .input('descripcion', sql.Text, descripcion)
        .input('tipo_area', sql.VarChar(50), tipo_area)
        .input('estatus', sql.VarChar(30), estatusInicial)
        .input('prioridad', sql.VarChar(10), prioridad)
        .input('fecha_creacion', sql.DateTime, fechaCreacion)
        .input('archivo_url', sql.Text, archivoUrl)
        .input('creado_por', sql.UniqueIdentifier, creado_por_id)
        // ---- AÑADIR LAS NUEVAS COLUMNAS (con null para los valores iniciales) ----
        .input('responsable_seguimiento', sql.VarChar(150), null) // nvarchar(null)
        .input('fecha_estimacion', sql.DateTime2, null)         // datetime2(null)
        .input('fecha_aprobacion', sql.DateTime2, null)         // datetime2(null)
        .input('retroalimentacion', sql.Text, null)            // nvarchar(null)
        .input('aprobado_por', sql.UniqueIdentifier, null)     // uniqueidentifier(null)
        // -------------------------------------------------------------------------
        .query(`
            INSERT INTO solicitudes (
                id, folio, descripcion, tipo_area, estatus, prioridad, fecha_creacion, archivo_url, creado_por,
                responsable_seguimiento, fecha_estimacion, fecha_aprobacion, retroalimentacion, aprobado_por
            )
            OUTPUT INSERTED.id, INSERTED.folio, INSERTED.estatus, INSERTED.prioridad, INSERTED.fecha_creacion
            VALUES (
                NEWID(), @folio, @descripcion, @tipo_area, @estatus, @prioridad, @fecha_creacion, @archivo_url, @creado_por,
                @responsable_seguimiento, @fecha_estimacion, @fecha_aprobacion, @retroalimentacion, @aprobado_por
            )
        `);
        
    return result.recordset[0];
};

export const listarSolicitudes = async (creadoPorId = null) => {
    try {
        const pool = await getConnection();
        let query = `
            SELECT
                id,
                folio,
                descripcion,
                tipo_area,
                estatus,
                prioridad,
                fecha_creacion,
                fecha_estimacion,
                archivo_url,
                creado_por,
                responsable_seguimiento,
                fecha_aprobacion,
                retroalimentacion,
                aprobado_por
            FROM solicitudes
        `;
        let request = pool.request();

        // Si se proporciona un creadoPorId, filtra las solicitudes por ese usuario
        if (creadoPorId) {
            query += ` WHERE creado_por = @creadoPorId`;
            request.input('creadoPorId', sql.UniqueIdentifier, creadoPorId);
        }

        // Podrías añadir lógica de ORDEN BY aquí si quieres ordenar las solicitudes
        query += ` ORDER BY fecha_creacion DESC`; // Ordenar por fecha de creación descendente

        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.error('Error al listar solicitudes en el servicio:', error);
        throw error;
    }
};

export const actualizarEstadoSolicitud = async (solicitudId, nuevoEstatus, aprobadoPorId = null, retroalimentacion = null, responsableSeguimiento = null, fechaEstimacion = null) => {
    try {
        const pool = await getConnection();
        let query = `
            UPDATE solicitudes
            SET estatus = @nuevoEstatus
        `;
        let request = pool.request()
            .input('solicitudId', sql.UniqueIdentifier, solicitudId)
            .input('nuevoEstatus', sql.VarChar(30), nuevoEstatus);

        // Actualizaciones estándar si el estatus es Aprobada o Rechazada
        if (nuevoEstatus === 'Aprobada' || nuevoEstatus === 'Rechazada') {
            query += `, fecha_aprobacion = GETDATE(), aprobado_por = @aprobadoPorId, retroalimentacion = @retroalimentacion`;
            request.input('aprobadoPorId', sql.UniqueIdentifier, aprobadoPorId);
            request.input('retroalimentacion', sql.Text, retroalimentacion);
        } else { // Si el estatus cambia a algo que no es Aprobada/Rechazada, estas podrían ser limpiadas o no
        }

        query += `, responsable_seguimiento = @responsableSeguimiento`;
        request.input('responsableSeguimiento', sql.VarChar(150), responsableSeguimiento === '' ? null : responsableSeguimiento);

        query += `, fecha_estimacion = @fechaEstimacion`;
        request.input('fechaEstimacion', sql.DateTime2, fechaEstimacion === '' ? null : fechaEstimacion);

        query += ` WHERE id = @solicitudId`;

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            throw new Error('Solicitud no encontrada o no actualizada.');
        }
        return { message: 'Estado de solicitud actualizado correctamente.', rowsAffected: result.rowsAffected[0] };

    } catch (error) {
        console.error('Error al actualizar estado de solicitud en el servicio:', error);
        throw error;
    }
};

export const eliminarSolicitud = async (solicitudId) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('solicitudId', sql.UniqueIdentifier, solicitudId)
            .query(`DELETE FROM solicitudes WHERE id = @solicitudId`);

        // Comprobamos si se eliminó alguna fila
        if (result.rowsAffected[0] === 0) {
            throw new Error('Solicitud no encontrada o no se pudo eliminar.');
        }

        return { message: 'Solicitud eliminada correctamente.', rowsAffected: result.rowsAffected[0] };
    } catch (error) {
        console.error('Error al eliminar solicitud en el servicio:', error);
        throw error;
    }
};

/**
 * Obtiene los detalles de una solicitud específica por su ID.
 * @param {string} solicitudId - El ID de la solicitud.
 * @returns {Promise<object|null>} El objeto solicitud o null si no se encuentra.
 */
export const getSolicitudById = async (solicitudId) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('solicitudId', sql.UniqueIdentifier, solicitudId)
            .query(`
                SELECT
                    id,
                    folio,
                    descripcion,
                    tipo_area,
                    responsable_seguimiento,
                    prioridad,
                    fecha_creacion,
                    fecha_estimacion,
                    estatus,
                    archivo_url,
                    fecha_aprobacion,
                    creado_por,
                    retroalimentacion,
                    aprobado_por
                FROM solicitudes
                WHERE id = @solicitudId
            `);
        return result.recordset[0] || null;
    } catch (error) {
        console.error('Error al obtener solicitud por ID en el servicio:', error);
        throw error;
    }
};