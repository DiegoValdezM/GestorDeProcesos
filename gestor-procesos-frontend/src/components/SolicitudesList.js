import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de que esta importación sea correcta

const SolicitudesList = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState(null); // Estado para guardar el rol del usuario
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Decodificar el token para obtener el rol del usuario
        try {
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.rol); // <-- ¡ESTO ES LO QUE FALTABA O ESTABA FUERA!
        } catch (decodeError) {
            console.error('Error al decodificar token:', decodeError);
            localStorage.removeItem('token'); // Token inválido o expirado
            navigate('/');
            return;
        }

        const fetchSolicitudes = async () => {
            try {
                const response = await axios.get('http://localhost:3001/solicitudes', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setSolicitudes(response.data);
            } catch (err) {
                console.error('Error al obtener solicitudes:', err);
                if (err.response && err.response.status === 401) {
                    setError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
                    localStorage.removeItem('token');
                    navigate('/');
                } else if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Error al conectar con el servidor de solicitudes.');
                }
            }
        };

        fetchSolicitudes();
    }, [navigate]); // navigate como dependencia para useEffect

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Función para manejar el clic en una fila de la tabla (navegar a detalles)
    const handleRowClick = (solicitudId) => {
        navigate(`/solicitudes/${solicitudId}`);
    };

    return (
    <div style={styles.container}>
        <div style={styles.header}>
            <h2>Mis Solicitudes</h2>
            <div>
                {/* Botones */}
                {(userRole === 'admin' || userRole === 'evaluador') && (
                    <button onClick={() => navigate('/admin/procesos')} style={{...styles.createButton, backgroundColor: '#6200EE'}}>
                        Ver Todos los Procesos
                    </button>
                )}
                <button onClick={() => navigate('/crear-solicitud')} style={styles.createButton}>Crear Nueva Solicitud</button>
                <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
            </div>
        </div>
        {error && <p style={styles.errorText}>{error}</p>}

        {solicitudes.length === 0 ? (
            <p>No hay solicitudes para mostrar. ¡Crea una nueva!</p>
        ) : (
            // --- INICIO DEL CAMBIO: Envolvemos la tabla en un div con scroll ---
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Folio</th>
                            <th style={styles.th}>Descripción</th>
                            <th style={styles.th}>Tipo Área</th>
                            <th style={styles.th}>Estatus</th>
                            <th style={styles.th}>Prioridad</th>
                            <th style={styles.th}>Fecha Creación</th>
                            <th style={styles.th}>Responsable Seg.</th>
                            <th style={styles.th}>Aprobado Por</th>
                            <th style={styles.th}>Fecha Estimación</th>
                            <th style={styles.th}>Fecha Aprobación</th>
                            <th style={styles.th}>Retroalimentación</th>
                            <th style={styles.th}>Adjunto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudes.map((solicitud) => (
                            <tr key={solicitud.id} onClick={() => handleRowClick(solicitud.id)} className="solicitud-row">
                                <td style={styles.td}>{solicitud.folio}</td>
                                <td style={styles.td}>{solicitud.descripcion}</td>
                                <td style={styles.td}>{solicitud.tipo_area}</td>
                                <td style={styles.td}>{solicitud.estatus}</td>
                                <td style={styles.td}>{solicitud.prioridad}</td>
                                <td style={styles.td}>{new Date(solicitud.fecha_creacion).toLocaleDateString()}</td>
                                {/* Asegúrate de que estos campos existan y se muestren */}
                                <td style={styles.td}>{solicitud.responsable_seguimiento || 'N/A'}</td>
                                <td style={styles.td}>{solicitud.aprobado_por || 'N/A'}</td>
                                <td style={styles.td}>{solicitud.fecha_estimacion ? new Date(solicitud.fecha_estimacion).toLocaleDateString() : 'N/A'}</td>
                                <td style={styles.td}>{solicitud.fecha_aprobacion ? new Date(solicitud.fecha_aprobacion).toLocaleDateString() : 'N/A'}</td>
                                <td style={styles.td}>{solicitud.retroalimentacion || 'N/A'}</td>
                                <td style={styles.td}>
                                    {solicitud.archivo_url ? (
                                        <a
                                            href={solicitud.archivo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
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
            </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        // Aumenta el ancho máximo del contenedor principal.
        // Puedes probar con 1400px, 1600px, o incluso 'auto' si quieres que se adapte al 100% de la ventana.
        // Para una pantalla grande, 'auto' puede ser una buena opción.
        maxWidth: '1400px', // O prueba con 'auto' o un valor más alto si sigue saliendo la barra
        margin: '20px auto',
        backgroundColor: '#fff',
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
    tableWrapper: {
        // Mantener overflowX: 'auto' como fallback por si la pantalla es muy pequeña
        // o si alguna columna es excepcionalmente ancha.
        overflowX: 'auto', 
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '8px',
    },
    table: {
        // Eliminar minWidth para que la tabla se ajuste al contenido o al 100% de su contenedor.
        // Aseguramos que ocupe el 100% del ancho disponible en tableWrapper.
        width: '100%', 
        borderCollapse: 'collapse',
        marginTop: '0px', // Asegúrate de que no haya un margen superior si está dentro de tableWrapper
    },
    th: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'left',
        backgroundColor: '#f2f2f2',
        whiteSpace: 'nowrap', // <-- ¡NUEVO! Evita que los textos de la cabecera se rompan
    },
    td: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'left',
        wordBreak: 'break-word', // <-- ¡NUEVO! Rompe palabras largas para que se ajusten a la celda
        // minWidth: '80px', // Opcional: Puedes usar esto para dar un ancho mínimo a celdas con poco contenido
    },
    tr: {
        cursor: 'pointer',
    },
    errorText: {
        color: 'red',
        marginBottom: '15px',
    },
    createButton: {
        padding: '10px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        marginRight: '10px',
    },
};


export default SolicitudesList;