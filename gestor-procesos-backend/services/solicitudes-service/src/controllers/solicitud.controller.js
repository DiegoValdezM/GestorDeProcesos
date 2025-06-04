import * as solicitudService from '../services/solicitud.service.js';
import { getConnection, sql } from '../config/db.js';

export const crearSolicitud = async (req, res) => {
    try {
        // El ID del creador ahora viene del token JWT verificado por el middleware
        const creado_por_id = req.user.id;

        const { descripcion, tipo_area } = req.body;
        const file = req.file;

        if (!descripcion || !tipo_area || !creado_por_id) {
            return res.status(400).json({ message: 'Descripción, tipo de área y ID del creador son requeridos.' });
        }

        const solicitudData = { descripcion, tipo_area, creado_por_id };

        const nuevaSolicitud = await solicitudService.crearNuevaSolicitud(solicitudData, file);
        res.status(201).json(nuevaSolicitud);
    } catch (error) {
        console.error('Error en crearSolicitud controller:', error);
        if (error.message === 'Error al subir el archivo adjunto.') {
            return res.status(500).json({ message: 'Hubo un problema al subir el archivo adjunto. Intente de nuevo.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear la solicitud.', error: error.message });
    }
};


export const listarSolicitudes = async (req, res) => {
    try {
        // Obtener el rol y el ID del usuario del token (gracias a verifyToken)
        const userId = req.user.id;
        const userRol = req.user.rol;

        let solicitudes;
        if (userRol === 'admin' || userRol === 'evaluador') {
            solicitudes = await solicitudService.listarSolicitudes(); // Administradores/Evaluadores ven todas
        } else {
            solicitudes = await solicitudService.listarSolicitudes(userId); // Usuarios normales solo ven las suyas
        }

        res.status(200).json(solicitudes);
    } catch (error) {
        console.error('Error en listarSolicitudes controller:', error);
        res.status(500).json({ message: 'Error interno del servidor al listar solicitudes.', error: error.message });
    }
};

export const actualizarEstadoSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        // Destructurar TODOS los campos que pueden venir en el body
        const { nuevoEstatus, retroalimentacion, responsableSeguimiento, fechaEstimacion } = req.body; 
        const aprobadoPorId = req.user.id; // El ID del aprobador/evaluador viene del token JWT

        if (!nuevoEstatus) {
            return res.status(400).json({ message: 'El nuevo estatus es requerido.' });
        }

        // Lógica para la Funcionalidad 3: Solo puede ser "Finalizada" si ya fue "Aprobada"
        // Primero, obtener el estatus actual de la solicitud desde la base de datos
        const pool = await getConnection(); // Usamos getConnection aquí para obtener el pool
        const currentSolicitudResult = await pool.request()
            .input('solicitudId', sql.UniqueIdentifier, id)
            .query(`SELECT estatus FROM solicitudes WHERE id = @solicitudId`);

        if (currentSolicitudResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada.' });
        }

        const currentEstatus = currentSolicitudResult.recordset[0].estatus;

        // ESTA ES LA VALIDACIÓN QUE ESTABA FALTANDO
        if (nuevoEstatus === 'Finalizada' && currentEstatus !== 'Aprobada') {
            return res.status(400).json({ message: 'Una solicitud solo puede ser marcada como "Finalizada" si previamente ha sido "Aprobada".' });
        }

        // Llamar al servicio para actualizar el estatus con TODOS los campos
        const updateResult = await solicitudService.actualizarEstadoSolicitud(
            id,
            nuevoEstatus,
            aprobadoPorId,
            retroalimentacion,
            responsableSeguimiento, // <-- ¡ASEGÚRATE DE PASAR ESTE!
            fechaEstimacion         // <-- ¡Y ESTE!
        );
        
        // Obtener la solicitud actualizada para devolverla al frontend
        const updatedSolicitud = await solicitudService.getSolicitudById(id); 
        if (!updatedSolicitud) {
            return res.status(500).json({ message: 'Error interno: No se pudo obtener la solicitud después de actualizar.' });
        }
        res.status(200).json(updatedSolicitud); // Devolver la solicitud completa y actualizada

    } catch (error) {
        console.error('Error en actualizarEstadoSolicitud controller:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar la solicitud.', error: error.message });
    }
};

export const eliminarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await solicitudService.eliminarSolicitud(id);
        res.status(200).json(result);

    } catch (error) {
        console.error('Error en eliminarSolicitud controller:', error);
        if (error.message.includes('Solicitud no encontrada')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al eliminar la solicitud.', error: error.message });
    }
};

export const getSolicitud = async (req, res) => {
    try {
        const { id } = req.params; // ID de la solicitud de la URL

        const solicitud = await solicitudService.getSolicitudById(id);

        if (!solicitud) {
            return res.status(404).json({ message: 'Solicitud no encontrada.' });
        }

        res.status(200).json(solicitud);
    } catch (error) {
        console.error('Error en getSolicitud controller:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la solicitud.', error: error.message });
    }
};