import * as procesoModel from '../models/proceso.model.js';

/**
 * Registra un nuevo proceso.
 * Asume que la solicitud ya ha sido aprobada.
 * @param {string} nombre - Nombre del proceso.
 * @param {string} descripcion - Descripción del proceso.
 * @param {string} idSolicitud - ID de la solicitud a la que está vinculado el proceso.
 * @param {string|null} archivoUrl - URL del archivo adjunto (opcional).
 * @returns {Promise<object>} El proceso registrado.
 */
export const registrarProceso = async (nombre, descripcion, idSolicitud, archivoUrl = null) => {
    try {
        // Aquí podrías añadir lógica de negocio adicional, por ejemplo,
        // verificar que el idSolicitud realmente corresponde a una solicitud "Aprobada"
        // (esto requeriría una llamada al solicitudes-service o a la misma DB).
        // Por el momento, asumimos que se llama desde donde ya se hizo esa validación.

        const newProceso = await procesoModel.create({
            nombre,
            descripcion,
            id_solicitud: idSolicitud,
            archivo_url: archivoUrl
        });
        return newProceso;
    } catch (error) {
        console.error('Error al registrar proceso en el servicio:', error);
        throw error;
    }
};

/**
 * Lista todos los procesos o los filtra por ID de solicitud.
 * @param {string|null} idSolicitud - ID de la solicitud para filtrar.
 * @returns {Promise<Array>} Lista de procesos.
 */
export const listarProcesos = async (idSolicitud = null) => {
    try {
        const procesos = await procesoModel.findAll(idSolicitud);
        return procesos;
    } catch (error) {
        console.error('Error al listar procesos en el servicio:', error);
        throw error;
    }
};