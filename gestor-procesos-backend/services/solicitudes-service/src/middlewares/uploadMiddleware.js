import multer from 'multer';

// Configurar multer para almacenar archivos en memoria temporalmente antes de subirlos a Blob
const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB por archivo (ajustar según necesidad)
});