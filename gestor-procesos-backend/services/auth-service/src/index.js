import express from 'express';
import { config } from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import cors from 'cors';

const app = express();

// Middlewares
app.use(express.json()); // Para parsear JSON bodies
app.use(express.urlencoded({ extended: true })); // Para parsear URL-encoded bodies
app.use(cors());

// Rutas
app.use('/auth', authRoutes); // Descomentaremos esto cuando creemos auth.routes.js

// Ruta de bienvenida o health check para el servicio de autenticación
app.get('/', (req, res) => {
    res.send('Servicio de Autenticación funcionando!');
});

// Manejo de errores global simple (puedes mejorarlo)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal en el servicio de autenticación!');
});

app.listen(config.port, () => {
    console.log(`Servicio de Autenticación escuchando en el puerto ${config.port}`);
});