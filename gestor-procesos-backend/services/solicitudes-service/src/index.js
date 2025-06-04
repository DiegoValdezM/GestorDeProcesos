import express from 'express';
import { config } from './config/config.js';
import solicitudRoutes from './routes/solicitud.routes.js';
import cors from 'cors';    

const app = express();

// Middlewares
app.use(express.json()); // Para parsear JSON bodies
app.use(express.urlencoded({ extended: true })); // Para parsear URL-encoded bodies
app.use(cors());

// Rutas
app.use('/solicitudes', solicitudRoutes); // Prefijo para todas las rutas de este servicio

// Ruta de bienvenida o health check
app.get('/', (req, res) => {
    res.send('Servicio de Solicitudes funcionando!');
});

// Manejo de errores global simple (opcional, puedes mejorarlo)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

app.listen(config.port, () => {
    console.log(`Servicio de Solicitudes escuchando en el puerto ${config.port}`);
    // Aquí podrías añadir una llamada para asegurar que el contenedor de Blob exista,
    // pero usualmente se crea una vez desde el portal de Azure o con un script de setup.
});