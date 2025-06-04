import sql from 'mssql';
import { config } from './config.js';

const dbSettings = {
    user: config.db.user,
    password: config.db.password,
    server: config.db.server,
    database: config.db.database,
    options: config.db.options
};

export const getConnection = async () => {
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error; // Re-throw para manejo global o específico
    }
};

// Export sql para usar tipos de datos si es necesario (e.g. sql.VarChar, sql.Int)
export { sql };