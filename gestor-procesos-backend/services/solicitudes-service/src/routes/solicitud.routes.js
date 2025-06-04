import { Router } from 'express';
import * as solicitudController from '../controllers/solicitud.controller.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { verifyToken, isAdmin, isEvaluadorOrAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// POST /solicitudes - Crear una nueva solicitud (usuarios autenticados)
router.post('/', verifyToken, upload.single('adjunto'), solicitudController.crearSolicitud);

// GET /solicitudes - Listar todas las solicitudes (admin/evaluador) o las propias (usuario normal)
router.get('/', verifyToken, solicitudController.listarSolicitudes);

// GET /solicitudes/:id - Obtener una solicitud específica por ID (autenticado)
router.get('/:id', verifyToken, solicitudController.getSolicitud); // <-- ¡AÑADE ESTA LÍNEA!

// PUT /solicitudes/:id/estado - Cambiar estado de una solicitud (evaluadores o administradores)
router.put('/:id/estado', verifyToken, isEvaluadorOrAdmin, solicitudController.actualizarEstadoSolicitud);

// DELETE /solicitudes/:id - Eliminar una solicitud (solo administradores)
router.delete('/:id', verifyToken, isAdmin, solicitudController.eliminarSolicitud);

export default router;