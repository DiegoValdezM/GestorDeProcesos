import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// POST /auth/register - Ruta para registrar un nuevo usuario
router.post('/register', authController.register);

// POST /auth/login - Ruta para iniciar sesión
router.post('/login', authController.login);

export default router;