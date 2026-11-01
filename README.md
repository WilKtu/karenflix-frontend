# KarenFlix Frontend · Aplicación Web Modular

[![App en Vivo](https://img.shields.io/badge/Vercel-App_en_Vivo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://karenflix-frontend.vercel.app)
[![API Swagger Docs](https://img.shields.io/badge/Swagger-Documentación_API-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://karenflix-backend.vercel.app/api-docs)
[![Video Demostrativo](https://img.shields.io/badge/Google_Drive-Video_Demostrativo_HD-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/drive/folders/1HSiNq5PU6jD3jWmLozYrz2bn8PvheCkM?usp=sharing)
[![GitHub Projects](https://img.shields.io/badge/SCRUM-GitHub_Projects_Kanban-1F883D?style=for-the-badge&logo=github&logoColor=white)](https://github.com/users/barriosevelyn488-web/projects/1)
[![Repositorio Backend](https://img.shields.io/badge/Backend-Repositorio_Oficial-00599C?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://github.com/barriosevelyn488-web/Karenflix_backend)

> **Aplicación en Producción:** [https://karenflix-frontend.vercel.app](https://karenflix-frontend.vercel.app)  
> **Backend y Swagger UI:** [https://karenflix-backend.vercel.app/api-docs](https://karenflix-backend.vercel.app/api-docs)  
> **Video Demostrativo Oficial (Google Drive):** [https://drive.google.com/drive/folders/1HSiNq5PU6jD3jWmLozYrz2bn8PvheCkM?usp=sharing](https://drive.google.com/drive/folders/1HSiNq5PU6jD3jWmLozYrz2bn8PvheCkM?usp=sharing)  
> **Tablero de Gestión SCRUM (GitHub Projects):** [https://github.com/users/barriosevelyn488-web/projects/1](https://github.com/users/barriosevelyn488-web/projects/1)  
> **Equipo de Desarrollo:** Evelyn Barrios (Scrum Master) & Wilder Katu (Product Owner)  
> **Docentes Evaluadores:** Eduin Salas & Andre Lopez · Campuslands 2026

---

Interfaz de usuario moderna, responsiva y cinemática para la plataforma **KarenFlix**, desarrollada con arquitectura modular basada en HTML5 semántico, CSS3 con variables personalizadas y JavaScript nativo (ES Modules).

## Características de la Aplicación

- **Autenticación Completa:** Inicio de sesión y registro de usuarios, almacenamiento seguro con Cookies `HttpOnly` y JSON Web Tokens (JWT).
- **Catálogo y Filtrado:** Búsqueda en tiempo real por título, director, actor y filtrado dinámico por categorías.
- **Top 10 y Ranking:** Visualización ponderada de películas mejor valoradas según las reseñas y reacciones de la comunidad.
- **Reseñas y Reacciones:** Publicación, edición y eliminación de reseñas propias, selector de calificación visual (1-10) y sistema de likes/dislikes.
- **Panel Administrativo:** Módulo CRUD para gestionar películas, aprobar títulos propuestos por usuarios y administrar categorías.
- **Tema Claro / Oscuro:** Selector de tema con persistencia en el almacenamiento local del navegador.
- **Favoritos y Notificaciones:** Guardado de títulos favoritos y alertas contextuales (toasts).

## Estructura del Proyecto

```text
karenflix-frontend/
├── index.html              # Página principal (Hero con animaciones de cine y Top 10)
├── pages/
│   ├── catalogo.html       # Explorador y buscador de películas por filtros
│   ├── detalle.html        # Vista detallada de película, reproductor y reseñas
│   ├── login.html          # Formulario de inicio de sesión y registro
│   └── admin.html          # Panel de administración de películas y categorías
├── css/
│   ├── base.css            # Reseteo y estilos estructurales
│   ├── variables.css       # Paleta de colores, tipografía y soporte para temas
│   ├── componets.css       # Componentes visuales (tarjetas, botones, badges)
│   └── admin.css           # Estilos para tablas y diálogos del panel admin
├── js/
│   ├── config.js           # Detección automática de entorno (Localhost / Vercel)
│   ├── api.js              # Cliente HTTP unificado con fetch y manejo de errores
│   ├── auth.js             # Gestión de sesión, cookies, tokens y permisos de rol
│   ├── ui.js               # Notificaciones toast, modales y conmutador de tema
│   ├── components/         # Componentes reutilizables (Navbar, Tarjetas, Selector de Notas)
│   └── pages/              # Controladores de lógica para cada vista HTML
└── assents/img/            # Recursos visuales y logotipos
```

## Conexión con el Backend

El archivo `js/config.js` detecta automáticamente si la aplicación se ejecuta localmente o en producción:

```javascript
const enLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

export const CONFIG = {
  API_URL: enLocal
    ? 'http://localhost:3000/api/v1'
    : 'https://karenflix-backend.vercel.app/api/v1'
};
```

## Despliegue en Producción

El proyecto está configurado para desplegarse de manera continua y automática en **Vercel** mediante integración directa con GitHub. Cada cambio integrado a la rama principal se compila y publica en segundos.
