import * as procesoService from '../services/proceso.service.js';

export const crearProceso = async (req, res) => {
    try {
        const { nombre, descripcion, id_solicitud, archivo_url } = req.body;

        if (!nombre || !descripcion || !id_solicitud) {
            return res.status(400).json({ message: 'Nombre, descripción e ID de solicitud son requeridos para el proceso.' });
        }

        const newProceso = await procesoService.registrarProceso(nombre, descripcion, id_solicitud, archivo_url);
        res.status(201).json(newProceso);
    } catch (error) {
        console.error('Error en crearProceso controller:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear el proceso.', error: error.message });
    }
};

export const listarProcesos = async (req, res) => {
    try {
        const { idSolicitud } = req.query; // Para filtrar por solicitud si es necesario
        const procesos = await procesoService.listarProcesos(idSolicitud);
        res.status(200).json(procesos);
    } catch (error) {
        console.error('Error en listarProcesos controller:', error);
        res.status(500).json({ message: 'Error interno del servidor al listar procesos.', error: error.message });
    }
};