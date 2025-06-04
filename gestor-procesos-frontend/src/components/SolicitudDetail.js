import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ToastMessage from './ToastMessage';

const SolicitudDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [solicitud, setSolicitud] = useState(null);
    const [procesos, setProcesos] = useState([]);
    const [requestError, setRequestError] = useState('');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    
    const [newStatus, setNewStatus] = useState(''); 
    const [retroalimentacionInput, setRetroalimentacionInput] = useState('');
    
    const [responsableSeguimientoInput, setResponsableSeguimientoInput] = useState('');
    const [fechaEstimacionInput, setFechaEstimacionInput] = useState(''); 
    
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    
    const [procesoNombre, setProcesoNombre] = useState('');
    const [procesoDescripcion, setProcesoDescripcion] = useState('');
    const [procesoArchivo, setProcesoArchivo] = useState(null);
    const [creatingProceso, setCreatingProceso] = useState(false);

    // Envuelve fetchData en useCallback
    const fetchData = useCallback(async () => {
        setLoading(true);
        setRequestError('');
        setToastMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.rol);
        } catch (decodeError) {
            console.error('Error al decodificar token:', decodeError);
            localStorage.removeItem('token');
            navigate('/');
            return;
        }

        try {
            // 1. Obtener detalles de la solicitud
            const solicitudResponse = await axios.get(`${process.env.REACT_APP_SOLICITUDES_API_URL}/solicitudes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSolicitud(solicitudResponse.data);
            setNewStatus(solicitudResponse.data.estatus);
            setRetroalimentacionInput(solicitudResponse.data.retroalimentacion || '');
            
            // Cargar valores existentes para edición
            setResponsableSeguimientoInput(solicitudResponse.data.responsable_seguimiento || '');
            if (solicitudResponse.data.fecha_estimacion) {
                const date = new Date(solicitudResponse.data.fecha_estimacion);
                setFechaEstimacionInput(date.toISOString().split('T')[0]);
            } else {
                setFechaEstimacionInput('');
            }

            // 2. Obtener procesos vinculados a esta solicitud
            const procesosResponse = await axios.get(`${process.env.REACT_APP_PROCESOS_API_URL}/procesos?idSolicitud=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProcesos(procesosResponse.data);

        } catch (err) {
            console.error('Error al obtener detalles/procesos:', err);
            if (err.response && err.response.status === 401) {
                setRequestError('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
                localStorage.removeItem('token');
                navigate('/');
            } else if (err.response && err.response.data && err.response.data.message) {
                setRequestError(err.response.data.message);
            } else {
                setRequestError('Error al conectar con los servidores.');
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Función para manejar el cambio de estatus
    const handleStatusChange = async () => {
        setRequestError('');
        setToastMessage('');

        const token = localStorage.getItem('token');
        const aprobadoPorId = jwtDecode(token).id;

        try {
            const response = await axios.put(`${process.env.REACT_APP_SOLICITUDES_API_URL}/solicitudes/${solicitud.id}/estado`,
                {
                    nuevoEstatus: newStatus,
                    aprobadoPorId: (newStatus === 'Aprobada' || newStatus === 'Rechazada' || newStatus === 'En Proceso' || newStatus === 'Finalizada') ? aprobadoPorId : null,
                    retroalimentacion: retroalimentacionInput,
                    responsableSeguimiento: responsableSeguimientoInput || null,
                    fechaEstimacion: fechaEstimacionInput || null
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSolicitud(prevSolicitud => ({
                ...prevSolicitud,
                estatus: newStatus,
                aprobado_por: response.data.aprobado_por || prevSolicitud.aprobado_por,
                fecha_aprobacion: response.data.fecha_aprobacion || prevSolicitud.fecha_aprobacion,
                retroalimentacion: retroalimentacionInput,
                responsable_seguimiento: responsableSeguimientoInput,
                fecha_estimacion: fechaEstimacionInput
            }));
            
            setToastMessage('Estatus actualizado correctamente!');
            setToastType('success');

        } catch (err) {
            console.error('Error al actualizar estatus:', err);
            let errorMessage = 'Error al actualizar el estatus de la solicitud.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }
            setToastMessage(errorMessage);
            setToastType('error');
        }
    };

    // Nueva función para crear un proceso
    const handleCreateProceso = async (e) => {
        e.preventDefault();
        setToastMessage('');
        setRequestError('');
        setCreatingProceso(true);

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            setCreatingProceso(false);
            return;
        }

        const formData = new FormData();
        formData.append('nombre', procesoNombre);
        formData.append('descripcion', procesoDescripcion);
        formData.append('id_solicitud', solicitud.id);
        
        if (procesoArchivo) {
            formData.append('archivo_url', `https://example.com/procesos_adjuntos/${procesoArchivo.name}`); 
        } else {
            formData.append('archivo_url', null);
        }

        try {
            await axios.post(`${process.env.REACT_APP_PROCESOS_API_URL}/procesos`, Object.fromEntries(formData), { 
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            setToastMessage('Proceso añadido exitosamente!');
            setToastType('success');
            
            setProcesoNombre('');
            setProcesoDescripcion('');
            setProcesoArchivo(null);

            await fetchData(); // Refrescar la lista de procesos después de añadir uno

        } catch (err) {
            console.error('Error al crear proceso:', err);
            let errorMessage = 'Error al añadir el proceso.';
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }
            setToastMessage(errorMessage);
            setToastType('error');
        } finally {
            setCreatingProceso(false);
        }
    };

    // Función para ocultar el toast manualmente si se hace click
    const handleCloseToast = () => {
        setToastMessage('');
    };

    if (loading) {
        return <div style={styles.loadingContainer}>Cargando detalles de la solicitud...</div>;
    }

    if (requestError) {
        return <div style={styles.errorContainer}>{requestError}</div>;
    }

    if (!solicitud) {
        return <div style={styles.notFoundContainer}>Solicitud no encontrada.</div>;
    }

    const canUpdateStatus = userRole === 'admin' || userRole === 'evaluador';

    return (
        <div style={styles.container}>
            <ToastMessage message={toastMessage} type={toastType} onClose={handleCloseToast} />

            <div style={styles.header}>
                <h2>Detalle de Solicitud: {solicitud.folio}</h2>
                <button onClick={() => navigate('/solicitudes')} style={styles.backButton}>Volver al Listado</button>
            </div>

            <div style={styles.detailCard}>
                <h3>Información de la Solicitud</h3>
                <p><strong>Descripción:</strong> {solicitud.descripcion}</p>
                <p><strong>Tipo de Área:</strong> {solicitud.tipo_area}</p>
                <p><strong>Estatus Actual:</strong> {solicitud.estatus}</p>
                <p><strong>Prioridad:</strong> {solicitud.prioridad}</p>
                <p><strong>Fecha Creación:</strong> {new Date(solicitud.fecha_creacion).toLocaleDateString()}</p>
                <p><strong>Responsable Seguimiento:</strong> {solicitud.responsable_seguimiento || 'N/A'}</p>
                <p><strong>Aprobado Por:</strong> {solicitud.aprobado_por || 'N/A'}</p>
                <p><strong>Fecha Estimación:</strong> {solicitud.fecha_estimacion ? new Date(solicitud.fecha_estimacion).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Fecha Aprobación:</strong> {solicitud.fecha_aprobacion ? new Date(solicitud.fecha_aprobacion).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Retroalimentación:</strong> {solicitud.retroalimentacion || 'N/A'}</p>
                <p>
                    <strong>Archivo Adjunto:</strong> {' '}
                    {solicitud.archivo_url ? (
                        <a href={solicitud.archivo_url} target="_blank" rel="noopener noreferrer">Ver Archivo</a>
                    ) : (
                        'No adjunto'
                    )}
                </p>

                {/* Sección para cambiar estatus (solo si el usuario tiene permiso) */}
                {canUpdateStatus && (
                    <div style={styles.statusUpdateSection}>
                        <h4>Cambiar Estatus</h4>
                        <div style={styles.formGroup}>
                            <label htmlFor="newStatus" style={styles.label}>Nuevo Estatus:</label>
                            <select
                                id="newStatus"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                style={styles.select}
                            >
                                <option value="Creada">Creada</option>
                                <option value="Pendiente Evaluación">Pendiente Evaluación</option>
                                <option value="Aprobada">Aprobada</option>
                                <option value="Rechazada">Rechazada</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Finalizada">Finalizada</option>
                            </select>
                        </div>
                        {(newStatus === 'Aprobada' || newStatus === 'En Proceso') && (
                            <>
                                <div style={styles.formGroup}>
                                    <label htmlFor="responsableSeguimientoInput" style={styles.label}>Responsable de Seguimiento:</label>
                                    <input
                                        type="text"
                                        id="responsableSeguimientoInput"
                                        value={responsableSeguimientoInput}
                                        onChange={(e) => setResponsableSeguimientoInput(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label htmlFor="fechaEstimacionInput" style={styles.label}>Fecha Estimación:</label>
                                    <input
                                        type="date"
                                        id="fechaEstimacionInput"
                                        value={fechaEstimacionInput}
                                        onChange={(e) => setFechaEstimacionInput(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </>
                        )}
                        {(newStatus === 'Aprobada' || newStatus === 'Rechazada') && (
                            <div style={styles.formGroup}>
                                <label htmlFor="retroalimentacionInput" style={styles.label}>Retroalimentación:</label>
                                <textarea
                                    id="retroalimentacionInput"
                                    value={retroalimentacionInput}
                                    onChange={(e) => setRetroalimentacionInput(e.target.value)}
                                    style={styles.textarea}
                                    rows="3"
                                ></textarea>
                            </div>
                        )}
                        <button onClick={handleStatusChange} style={styles.updateButton}>Actualizar Estatus</button>
                    </div>
                )}
            </div>

            {/* Sección de Procesos Vinculados */}
            <div style={styles.procesosCard}>
                <h3>Procesos Vinculados</h3>
                {procesos.length === 0 ? (
                    <p>No hay procesos vinculados a esta solicitud.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Nombre Proceso</th>
                                <th style={styles.th}>Descripción Proceso</th>
                                <th style={styles.th}>Fecha Registro</th>
                                <th style={styles.th}>Archivo Adjunto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {procesos.map((proceso) => (
                                <tr key={proceso.id}>
                                    <td style={styles.td}>{proceso.nombre}</td>
                                    <td style={styles.td}>{proceso.descripcion}</td>
                                    <td style={styles.td}>{new Date(proceso.fecha_registro).toLocaleDateString()}</td>
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

                {/* --- SECCIÓN PARA AÑADIR NUEVO PROCESO (SOLO PARA ADMIN --- */}
                {canUpdateStatus && (
                    <div style={styles.addProcesoSection}>
                        <h4>Añadir Nuevo Proceso</h4>
                        <form onSubmit={handleCreateProceso}>
                            <div style={styles.formGroup}>
                                <label htmlFor="procesoNombre" style={styles.label}>Nombre del Proceso:</label>
                                <input
                                    type="text"
                                    id="procesoNombre"
                                    value={procesoNombre}
                                    onChange={(e) => setProcesoNombre(e.target.value)}
                                    required
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label htmlFor="procesoDescripcion" style={styles.label}>Descripción del Proceso:</label>
                                <textarea
                                    id="procesoDescripcion"
                                    value={procesoDescripcion}
                                    onChange={(e) => setProcesoDescripcion(e.target.value)}
                                    required
                                    style={styles.textarea}
                                    rows="3"
                                ></textarea>
                            </div>
                            <div style={styles.formGroup}>
                                <label htmlFor="procesoArchivo" style={styles.label}>Adjuntar Archivo (Opcional):</label>
                                <input
                                    type="file"
                                    id="procesoArchivo"
                                    onChange={(e) => setProcesoArchivo(e.target.files[0])}
                                    style={styles.fileInput}
                                />
                            </div>
                            <button type="submit" disabled={creatingProceso} style={styles.createProcesoButton}>
                                {creatingProceso ? 'Creando...' : 'Añadir Proceso'}
                            </button>
                        </form>
                    </div>
                )}
                {/* ----------------------------------------------------------------- */}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '900px',
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
    backButton: {
        padding: '10px 15px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    detailCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        marginBottom: '20px',
        textAlign: 'left',
    },
    procesosCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        textAlign: 'left',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '15px',
    },
    th: {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'left',
        backgroundColor: '#f2f2f2',
    },
    td: {
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'left',
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
    notFoundContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2em',
        color: '#888',
    },
    statusUpdateSection: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
    },
    addProcesoSection: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
    },
    select: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
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
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
        resize: 'vertical',
    },
    fileInput: {
        width: '100%',
        padding: '10px 0',
    },
    updateButton: {
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        marginTop: '10px',
    },
    createProcesoButton: { 
        padding: '10px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        marginTop: '10px',
    },
};

export default SolicitudDetail;