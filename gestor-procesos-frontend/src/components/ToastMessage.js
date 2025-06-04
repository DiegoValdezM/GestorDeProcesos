import React from 'react';

const ToastMessage = ({ message, type, onClose }) => {
    if (!message) {
        return null; // No renderiza nada si no hay mensaje
    }

    const toastStyle = {
        position: 'fixed', // Fijo en la pantalla
        bottom: '20px',    // Abajo
        left: '50%',       // Centrado horizontalmente
        transform: 'translateX(-50%)', // Ajuste para centrar
        backgroundColor: type === 'success' ? '#4CAF50' : '#f44336', // Verde para éxito, rojo para error
        color: 'white',
        padding: '12px 20px',
        borderRadius: '5px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,      // Asegura que esté por encima de otros elementos
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out',
        animation: 'fadeIn 0.5s, fadeOut 0.5s 2.5s forwards', // Animación de aparecer y desaparecer
    };

    // Estilos para la animación (necesitas añadirlos a tu index.css o un CSS global)
    /*
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
    */

    return (
        <div style={toastStyle} onClick={onClose}>
            {message}
        </div>
    );
};

export default ToastMessage;