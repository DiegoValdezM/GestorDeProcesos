import React from 'react';

const ToastMessage = ({ message, type, onClose }) => {
    if (!message) {
        return null; // No renderiza nada si no hay mensaje
    }

    const toastStyle = {
        position: 'fixed', 
        bottom: '20px',    
        left: '50%',       
        transform: 'translateX(-50%)', 
        backgroundColor: type === 'success' ? '#4CAF50' : '#f44336', 
        padding: '12px 20px',
        borderRadius: '5px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,      // Asegura que esté por encima de otros elementos
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out',
        animation: 'fadeIn 0.5s, fadeOut 0.5s 2.5s forwards', // Animación de aparecer y desaparecer
    };


    return (
        <div style={toastStyle} onClick={onClose}>
            {message}
        </div>
    );
};

export default ToastMessage;