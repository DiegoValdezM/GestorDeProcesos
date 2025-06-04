
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
const [nombre, setNombre] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [message, setMessage] = useState('');
const [error, setError] = useState('');
const [registrationSuccess, setRegistrationSuccess] = useState(false); // Nuevo estado
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
        const rol = 'normal';
        const response = await axios.post('http://localhost:3002/auth/register', {
            nombre,
            email,
            password,
            rol,
        });

        setMessage(response.data.message);
        setRegistrationSuccess(true); // Marca el registro como exitoso
        setTimeout(() => navigate('/'), 2000); // Redirige después de 2 segundos
    } catch (err) {
        console.error('Error de registro:', err);
        if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
        } else {
            setError('Error al conectar con el servidor de registro.');
        }
        setRegistrationSuccess(false); // Asegura que el estado de éxito sea falso en caso de error
    }
};

return (
    <div style={styles.container}>
        {registrationSuccess ? (
            <div style={styles.successContainer}>
                <span style={styles.successIcon}>✅</span>
                <p style={styles.successText}>{message}</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Crear Cuenta</h2>
                {error && <p style={styles.errorText}>{error}</p>}
                <div style={styles.formGroup}>
                    <label htmlFor="nombre" style={styles.label}>Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.label}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="password" style={styles.label}>Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>Registrar</button>
                <p style={styles.linkText}>
                    ¿Ya tienes una cuenta? <Link to="/" style={styles.link}>Iniciar Sesión</Link>
                </p>
            </form>
        )}
    </div>
);
};

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
width: '350px',
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
marginBottom: '15px',
},
errorText: {
color: 'red',
marginBottom: '15px',
},
linkText: {
marginTop: '10px',
fontSize: '14px',
color: '#555',
},
link: {
color: '#007bff',
textDecoration: 'none',
fontWeight: 'bold',
},
successContainer: {
backgroundColor: '#e6ffe6',
color: '#2e8b57',
padding: '30px',
borderRadius: '8px',
boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
textAlign: 'center',
},
successIcon: {
fontSize: '48px',
marginBottom: '15px',
},
successText: {
fontSize: '18px',
fontWeight: 'bold',
marginBottom: '0',
},
};

export default Register;