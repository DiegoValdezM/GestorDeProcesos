import { BlobServiceClient } from '@azure/storage-blob';
import { config } from './config.js';
import { v4 as uuidv4 } from 'uuid'; // Para nombres de archivo únicos

console.log('DEBUG (Blob Storage): Connection String being used:', config.blobStorage.connectionString);

const blobServiceClient = BlobServiceClient.fromConnectionString(config.blobStorage.connectionString);
const containerName = config.blobStorage.containerName;

export const uploadFileToBlob = async (file) => {
    if (!file) {
        throw new Error('No file provided for upload.');
    }
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Asegurarse de que el contenedor exista (opcional, se puede hacer una vez al iniciar)
    // await containerClient.createIfNotExists(); 

    const blobName = `${uuidv4()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });
    return blockBlobClient.url; // URL del archivo subido
};