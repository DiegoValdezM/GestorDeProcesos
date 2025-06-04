# Gestor de Procesos Empresariales

LINK AZURE: https://polite-coast-0eb431f0f.6.azurestaticapps.net/

## Descripción General

Este proyecto es un sistema web diseñado para registrar, administrar y dar seguimiento a solicitudes operativas dentro de una organización. Permite a los usuarios crear solicitudes formales que son evaluadas y aprobadas por un departamento de procesos, las cuales pueden derivar en uno o varios procesos específicos para su atención y resolución. La aplicación se construye con una arquitectura de microservicios, utilizando Node.js para el backend y React para el frontend, y se despliega en Azure.

## Credenciales de admin
email: admin@example.com
password: PasswordSeguro123

## Características Principales

### Autenticación y Autorización
-   Registro de usuarios con roles (`normal`, `evaluador`, `admin`).
-   Inicio de sesión seguro con JWT (JSON Web Tokens).
-   Rutas protegidas por token y rol en el backend.

### Gestión de Solicitudes
-   Creación de nuevas solicitudes con campos como descripción, tipo de área, etc.
-   Generación automática de un número de folio único para cada solicitud.
-   Evaluación automática de prioridad basada en palabras clave en la descripción.
-   Subida de archivos adjuntos a Azure Blob Storage.
-   Listado de solicitudes (filtrado por usuario para roles `normal`, todas para `admin`/`evaluador`).
-   Visualización detallada de una solicitud específica.
-   Actualización del estado de una solicitud (`Creada`, `Pendiente Evaluación`, `Aprobada`, `Rechazada`, `En Proceso`, `Finalizada`).
-   Asignación de responsable de seguimiento y fecha de estimación al cambiar el estado.
-   Regla de negocio: Una solicitud solo puede ser `Finalizada` si previamente fue `Aprobada`.
-   Eliminación de solicitudes (solo para `admin`).

### Gestión de Procesos
-   Creación de procesos vinculados a solicitudes aprobadas (desde la vista de detalle de la solicitud).
-   Listado de todos los procesos (vista específica para `admin`/`evaluador`).
-   Visualización de información de la solicitud padre en el listado de procesos.

## Arquitectura del Sistema

El sistema sigue una arquitectura de microservicios desplegada en la nube de Microsoft Azure.

-   **Frontend:** Aplicación SPA (Single Page Application) desarrollada con React.
-   **Backend:** Tres microservicios API RESTful desarrollados con Node.js (Express):
    -   `auth-service`: Maneja la autenticación de usuarios y la generación/validación de JWT.
    -   `solicitudes-service`: Gestiona todas las operaciones CRUD relacionadas con las solicitudes.
    -   `procesos-service`: Gestiona las operaciones relacionadas con los procesos.
-   **Base de Datos:** Azure SQL Database.
-   **Almacenamiento de Archivos:** Azure Blob Storage.
-   **Comunicación:** Los microservicios backend se comunican entre sí y con el frontend a través de peticiones HTTP/REST.

## Tecnologías Utilizadas

-   **Frontend:** React.js, JavaScript, HTML, CSS, `axios`, `react-router-dom`, `jwt-decode`.
-   **Backend (Node.js):** Express.js, JavaScript, `dotenv`, `mssql`, `bcryptjs`, `jsonwebtoken`, `cors`, `uuid`, `multer` (`solicitudes-service`).
-   **Base de Datos:** Microsoft Azure SQL Database.
-   **Almacenamiento de Archivos:** Microsoft Azure Blob Storage.
-   **Gestión de Versiones:** Git & GitHub.
-   **Despliegue:** Azure App Service, Azure Static Web Apps.

## Estructura del Proyecto
gestor-procesos/
├── gestor-procesos-backend/
│   ├── services/
│   │   ├── auth-service/           # Microservicio de autenticación
│   │   │   ├── src/
│   │   │   │   ├── config/
│   │   │   │   ├── controllers/
│   │   │   │   ├── models/
│   │   │   │   ├── routes/
│   │   │   │   ├── services/
│   │   │   │   └── index.js
│   │   │   ├── .env                # Variables de entorno para auth-service (IGNORADO POR GIT)
│   │   │   ├── package.json
│   │   │   └── ...
│   │   ├── solicitudes-service/    # Microservicio de gestión de solicitudes
│   │   │   ├── src/
│   │   │   │   ├── config/
│   │   │   │   ├── controllers/
│   │   │   │   ├── middlewares/
│   │   │   │   ├── models/
│   │   │   │   ├── routes/
│   │   │   │   ├── services/
│   │   │   │   ├── utils/
│   │   │   │   └── index.js
│   │   │   ├── .env                # Variables de entorno para solicitudes-service (IGNORADO POR GIT)
│   │   │   ├── package.json
│   │   │   └── ...
│   │   └── procesos-service/       # Microservicio de gestión de procesos
│   │       ├── src/
│   │       │   ├── config/
│   │   │   │   ├── controllers/
│   │   │   │   ├── models/
│   │   │   │   ├── routes/
│   │   │   │   ├── services/
│   │   │   │   └── index.js
│   │   │   ├── .env                # Variables de entorno para procesos-service (IGNORADO POR GIT)
│   │   │   ├── package.json
│   │   │   └── ...
│   │   └── ...
│   ├── .env.example                # Ejemplo de variables de entorno para todo el backend
│   └── ...
├── gestor-procesos-frontend/       # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── SolicitudDetail.js
│   │   │   ├── SolicitudForm.js
│   │   │   ├── SolicitudesList.js
│   │   │   ├── ProcesosListAdmin.js
│   │   │   └── ToastMessage.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   │   └── ...
│   ├── package.json
│   └── ...
├── .gitignore                      # Reglas de ignorado de Git
├── README.md                       # Este archivo
└── ...
