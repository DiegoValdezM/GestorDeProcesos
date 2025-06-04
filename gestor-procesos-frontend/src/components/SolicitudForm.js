import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SolicitudForm = () => {
    const [descripcion, setDescripcion] = useState('');
    const [tipoArea, setTipoArea] = useState('');
    const [adjunto, setAdjunto] = useState(null); // Para el archivo
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Usamos FormData porque vamos a enviar un archivo (multipart/form-data)
        const formData = new FormData();
        formData.append('descripcion', descripcion);
        formData.append('tipo_area', tipoArea);
        if (adjunto) {
            formData.append('adjunto', adjunto); // 'adjunto' debe coincidir con el nombre del campo en Multer
        }

        try {
            // Asegúrate de que la URL apunte a tu solicitudes-service (puerto 3001)
            const response = await axios.post('http://localhost:3001/solicitudes', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data', // Indispensable para FormData
                },
            });

            setMessage('Solicitud creada exitosamente. Folio: ' + response.data.folio);
            // Limpiar el formulario
            setDescripcion('');
            setTipoArea('');
            setAdjunto(null);
            // Opcional: redirigir a la lista de solicitudes después de un tiempo
            setTimeout(() => navigate('/solicitudes'), 2000);
        } catch (err) {
            console.error('Error al crear solicitud:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Error al conectar con el servidor de solicitudes.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Crear Nueva Solicitud</h2>
                {message && <p style={styles.successText}>{message}</p>}
                {error && <p style={styles.errorText}>{error}</p>}

                <div style={styles.formGroup}>
                    <label htmlFor="descripcion" style={styles.label}>Descripción:</label>
                    <textarea
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                        style={styles.textarea}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="tipoArea" style={styles.label}>Tipo de Área:</label>
                    <input
                        type="text"
                        id="tipoArea"
                        value={tipoArea}
                        onChange={(e) => setTipoArea(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="adjunto" style={styles.label}>Adjuntar Archivo (Opcional):</label>
                    <input
                        type="file"
                        id="adjunto"
                        onChange={(e) => setAdjunto(e.target.files[0])}
                        style={styles.fileInput}
                    />
                </div>
                <button type="submit" style={styles.button}>Crear Solicitud</button>
                <button type="button" onClick={() => navigate('/solicitudes')} style={{ ...styles.button, ...styles.backButton }}>Volver al Listado</button>
            </form>
        </div>
    );
};

// Estilos básicos (puedes moverlos a un archivo CSS si lo prefieres)
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
    },
    form: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '450px',
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: '20px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
        minHeight: '80px',
        resize: 'vertical',
    },
    fileInput: {
        width: '100%',
        padding: '10px 0',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease',
        marginBottom: '10px',
    },
    backButton: {
        backgroundColor: '#6c757d',
    },
    successText: {
        color: 'green',
        marginBottom: '15px',
    },
    errorText: {
        color: 'red',
        marginBottom: '15px',
    },
};

export default SolicitudForm;