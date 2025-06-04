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
        console.log('Conexión a la base de datos establecida para procesos-service.');
        return pool;
    } catch (error) {
        console.error('Error de conexión a la base de datos en procesos-service:', error);
        throw error;
    }
};

export { sql };