import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link para el enlace a Register

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario (recargar la página)
        setError(''); // Limpia errores previos

        try {
            // Haz la petición POST a tu auth-service
            // Asegúrate de que la URL sea correcta (el puerto 3002 de tu auth-service)
            const response = await axios.post(`${process.env.REACT_APP_AUTH_API_URL}/auth/login`, {
                email,
                password,
            });

            // Si el login es exitoso, guarda el token en el almacenamiento local
            localStorage.setItem('token', response.data.token);
            // Opcional: guardar también la información del usuario si la devuelves
            // localStorage.setItem('user', JSON.stringify(response.data.user)); // Esto lo puedes usar si tu backend devuelve user data

            // Redirige al usuario a la página principal de solicitudes
            navigate('/solicitudes');
        } catch (err) {
            // Manejo de errores
            console.error('Error de inicio de sesión:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Error al conectar con el servidor de autenticación.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Iniciar Sesión</h2>
                {error && <p style={styles.errorText}>{error}</p>}
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
                <button type="submit" style={styles.button}>Entrar</button>
                {/* Enlace para ir a la página de registro */}
                <p style={styles.linkText}>
                    ¿No tienes una cuenta? <Link to="/register" style={styles.link}>Crear Cuenta</Link>
                </p>
            </form>
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
    }
};

export default Login;