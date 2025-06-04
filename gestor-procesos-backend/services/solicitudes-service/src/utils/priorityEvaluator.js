const URGENTE_KEYWORDS = ['urgente', 'inmediato', 'crítico', 'bloqueante'];
const ALTA_KEYWORDS = ['importante', 'alta', 'requerido'];
// Añadir más si es necesario

export const evaluarPrioridad = (descripcion) => {
    const texto = descripcion.toLowerCase();
    if (URGENTE_KEYWORDS.some(keyword => texto.includes(keyword))) {
        return 'Urgente';
    }
    if (ALTA_KEYWORDS.some(keyword => texto.includes(keyword))) {
        return 'Alta';
    }
    // Podrías añadir lógica para "Media" o "Baja" o devolver "Normal" por defecto
    return 'Normal'; // Prioridad por defecto
};