import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SolicitudesList from './components/SolicitudesList';
import SolicitudForm from './components/SolicitudForm';
import SolicitudDetail from './components/SolicitudDetail';
import Register from './components/Register';
import ProcesosListAdmin from './components/ProcesosListAdmin';
import { jwtDecode } from 'jwt-decode'; // Necesario para comprobar el rol en PrivateRouteAdmin

// Componente para rutas protegidas generales (cualquier usuario logueado)
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" />;
};

// Nuevo componente para rutas protegidas por rol (solo admin/evaluador)
const PrivateRouteAdmin = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/" />; // No hay token, redirigir al login
    }
    try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.rol === 'admin' || decodedToken.rol === 'evaluador') {
            return children; // Rol correcto, permitir acceso
        } else {
            // Si el rol no es el adecuado, redirigir al listado de solicitudes o a una página de acceso denegado
            return <Navigate to="/solicitudes" />; 
        }
    } catch (error) {
        // Token inválido o expirado
        localStorage.removeItem('token');
        return <Navigate to="/" />;
    }
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Rutas no protegidas */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rutas protegidas para cualquier usuario autenticado */}
                <Route
                    path="/solicitudes"
                    element={
                        <PrivateRoute>
                            <SolicitudesList />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/crear-solicitud"
                    element={
                        <PrivateRoute>
                            <SolicitudForm />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/solicitudes/:id"
                    element={
                        <PrivateRoute>
                            <SolicitudDetail />
                        </PrivateRoute>
                    }
                />

                {/* Nueva Ruta protegida SOLO para Admin/Evaluador */}
                <Route
                    path="/admin/procesos"
                    element={
                        <PrivateRouteAdmin>
                            <ProcesosListAdmin />
                        </PrivateRouteAdmin>
                    }
                />

                {/* Ruta de "No encontrado" */}
                <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
            </Routes>
        </Router>
    );
}

export default App;