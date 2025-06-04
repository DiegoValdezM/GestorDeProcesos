import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3002, // Usamos 3002 por defecto para auth-service
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: true,
            trustServerCertificate: false
        }
    },
    jwtSecret: process.env.JWT_SECRET
};
