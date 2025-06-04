import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Para decodificar el token

const ProcesosListAdmin = () => {
    const [procesos, setProcesos] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProcesos = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/'); // Redirigir si no hay token
                return;
            }

            // Verificar rol en el frontend (aunque el backend también lo hará)
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.rol !== 'admin' && decodedToken.rol !== 'evaluador') {
                    setError('Acceso denegado. Se requieren privilegios de administrador o evaluador.');
                    setLoading(false);
                    // Opcional: redirigir a una página de "Acceso Denegado" o al listado de solicitudes
                    navigate('/solicitudes'); // Redirigir a solicitudes si no tiene rol adecuado
                    return;
                }
            } catch (decodeError) {
                console.error('Error al decodificar token:', decodeError);
                setError('Token inválido. Por favor, inicia sesión de nuevo.');
                localStorage.removeItem('token');
                navigate('/');
                return;
            }

            try {
                // Petición GET a tu procesos-service para obtener TODOS los procesos
                const response = await axios.get('http://localhost:3003/procesos', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Para cada proceso, intentar obtener el folio y descripción de la solicitud padre
                const procesosConSolicitudInfo = await Promise.all(response.data.map(async (proceso) => {
                    try {
                        const solicitudResponse = await axios.get(`http://localhost:3001/solicitudes/${proceso.id_solicitud}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        return {
                            ...proceso,
                            solicitud_folio: solicitudResponse.data.folio,
                            solicitud_descripcion: solicitudResponse.data.descripcion,
                        };
                    } catch (solicitudErr) {
                        console.warn(`No se pudo obtener información para la solicitud ${proceso.id_solicitud}:`, solicitudErr.message);
                        return {
                            ...proceso,
                            solicitud_folio: 'N/A',
                            solicitud_descripcion: 'Solicitud no encontrada',
                        };
                    }
                }));
                setProcesos(procesosConSolicitudInfo);

            } catch (err) {
                console.error('Error al obtener procesos:', err);
                if (err.response && err.response.status === 401) {
                    setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
                    localStorage.removeItem('token');
                    navigate('/');
                } else if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Error al conectar con el servidor de procesos.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProcesos();
    }, [navigate]); // navigate como dependencia

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (loading) {
        return <div style={styles.loadingContainer}>Cargando procesos...</div>;
    }

    if (error) {
        return <div style={styles.errorContainer}>{error}</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Gestión de Procesos (Admin/Evaluador)</h2>
                <div> {/* Contenedor de botones */}
                    {/* Botón para volver al listado de solicitudes */}
                    <button 
                        onClick={() => navigate('/solicitudes')} 
                        style={styles.backToListButton} 
                    >
                        Volver al Listado de Solicitudes
                    </button>
                    <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
                </div>
            </div>
            {procesos.length === 0 ? (
                <p>No hay procesos para mostrar.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID Proceso</th>
                            <th style={styles.th}>Nombre Proceso</th>
                            <th style={styles.th}>Descripción Proceso</th>
                            <th style={styles.th}>Fecha Registro</th>
                            <th style={styles.th}>Solicitud Folio</th> {/* <-- Campo de Solicitud */}
                            <th style={styles.th}>Solicitud Descripción</th> {/* <-- Campo de Solicitud */}
                            <th style={styles.th}>Adjunto Proceso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {procesos.map((proceso) => (
                            <tr key={proceso.id} style={styles.tr}> {/* Mantener style={styles.tr} para otros estilos si los tiene */}
                                <td style={styles.td}>{proceso.id}</td>
                                <td style={styles.td}>{proceso.nombre}</td>
                                <td style={styles.td}>{proceso.descripcion}</td>
                                <td style={styles.td}>{new Date(proceso.fecha_registro).toLocaleDateString()}</td>
                                <td style={styles.td}>{proceso.solicitud_folio}</td>
                                <td style={styles.td}>{proceso.solicitud_descripcion}</td>
                                <td style={styles.td}>
                                    {proceso.archivo_url ? (
                                        <a href={proceso.archivo_url} target="_blank" rel="noopener noreferrer">
                                            Ver Archivo
                                        </a>
                                    ) : (
                                        'N/A'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

// Estilos básicos (puedes moverlos a un archivo CSS si lo prefieres)
const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '20px auto',
        backgroundColor: '#f0f2f5',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    logoutButton: {
        padding: '10px 15px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
    },
    th: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'left',
        backgroundColor: '#f2f2f2',
    },
    td: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'left',
    },
    // Eliminado el '&:nth-child(even)' de aquí. Si quieres filas alternas, añádelo a index.css con una clase.
    tr: { 
        // cursor: 'pointer', // No es clicable en esta vista, por lo que no necesita cursor:pointer
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2em',
        color: '#555',
    },
    errorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2em',
        color: 'red',
    },
    backToListButton: { // <-- ¡NUEVO ESTILO!
        padding: '10px 15px',
        backgroundColor: '#007bff', /* Un azul, puedes elegir otro color */
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        marginRight: '10px', /* Espacio entre este botón y el de cerrar sesión */
    },
    // ... (asegúrate de que los estilos 'createButton' no estén duplicados si no se usan aquí) ...
};

export default ProcesosListAdmin;