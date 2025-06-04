import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3003, // Puerto para este servicio
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: true, // Obligatorio para Azure SQL
            trustServerCertificate: false
        }
    },
    jwtSecret: process.env.JWT_SECRET
    // Este servicio no necesita JWT_SECRET ni blobStorage
};