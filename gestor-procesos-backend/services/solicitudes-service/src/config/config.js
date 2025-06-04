import dotenv from 'dotenv';
dotenv.config(); // Carga las variables del .env

export const config = {
    port: process.env.PORT || 3001,
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: true, // Obligatorio para Azure SQL
            trustServerCertificate: false // Cambiar a true si usas un certificado auto-firmado (no recomendado para prod)
        }
    },
    blobStorage: {
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
        containerName: process.env.AZURE_STORAGE_CONTAINER_NAME
    },
    jwtSecret: process.env.JWT_SECRET
};