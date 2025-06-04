import { Router } from 'express';
import * as procesoController from '../controllers/proceso.controller.js';
import { verifyToken, isEvaluadorOrAdmin } from '../middlewares/authMiddleware.js'; // <-- ¡AÑADE ESTA LÍNEA!

const router = Router();

// POST /procesos - Crear un nuevo proceso (para administradores o evaluadores)
router.post('/', verifyToken, isEvaluadorOrAdmin, procesoController.crearProceso); // <-- ¡Descomentado y añadido middleware!

// GET /procesos - Listar todos los procesos (para administradores o evaluadores)
// O filtrar por id_solicitud
router.get('/', verifyToken, isEvaluadorOrAdmin, procesoController.listarProcesos); // <-- ¡Descomentado y añadido middleware!

export default router;