import express from 'express';
import { config } from './config/config.js';
import cors from 'cors'; 
import procesoRoutes from './routes/proceso.routes.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Habilitar CORS para permitir peticiones desde el frontend

// Rutas
app.use('/procesos', procesoRoutes); 

// Ruta de bienvenida o health check
app.get('/', (req, res) => {
    res.send('Servicio de Procesos funcionando!');
});

// Manejo de errores global simple
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal en el servicio de procesos!');
});

app.listen(config.port, () => {
    console.log(`Servicio de Procesos escuchando en el puerto ${config.port}`);
});
