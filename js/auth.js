// Gestión de sesión, permisos, favoritos y notificaciones de usuario en el cliente.
const CLAVE = 'karenflix_sesion';
const CLAVE_NOTIF = 'karenflix_notificaciones';
const CLAVE_FAV = 'karenflix_favoritos_v1';

export const guardarSesion = (token, usuario) =>
    localStorage.setItem(CLAVE, JSON.stringify({ token, usuario }));

export const actualizarUsuarioSesion = (parcial) => {
    const actual = leer();
    if (!actual.token) return null;
    const actualizado = { ...actual.usuario, ...parcial };
    guardarSesion(actual.token, actualizado);
    return actualizado;
};

export const cerrarSesion = () => localStorage.removeItem(CLAVE);

const leer = () => {
    try {
        return JSON.parse(localStorage.getItem(CLAVE)) || {};
    } catch {
        return {};
    }
};

export const getToken = () => leer().token || null;
export const getUsuario = () => leer().usuario || null;
export const esAdmin = () => getUsuario()?.rol === 'admin';

export const requireAuth = () => {
    if (getToken()) return true;
    const rutaLogin = `${location.pathname.includes('/pages/') ? '' : 'pages/'}login.html`;
    const retorno = encodeURIComponent(location.pathname + location.search);
    location.href = `${rutaLogin}?redirect=${retorno}`;
    return false;
};

export const requireAdmin = () => requireAuth() && esAdmin();

// ---- Gestión de Favoritos por Usuario ----
const claveFavUsuario = () => {
    const u = getUsuario();
    return u ? `${CLAVE_FAV}_${u.id || u.email}` : `${CLAVE_FAV}_anon`;
};

export const getFavoritosIds = () => {
    try {
        if (!getUsuario()) return [];
        const guardados = JSON.parse(localStorage.getItem(claveFavUsuario()));
        if (Array.isArray(guardados)) return guardados.map(Number);
        // Favoritos iniciales de muestra para cuentas registradas
        const iniciales = [1, 3];
        localStorage.setItem(claveFavUsuario(), JSON.stringify(iniciales));
        return iniciales;
    } catch {
        return [];
    }
};

export const esFavorito = (peliculaId) => getFavoritosIds().includes(Number(peliculaId));

export const toggleFavorito = (peliculaId) => {
    const idNum = Number(peliculaId);
    const actuales = getFavoritosIds();
    const existe = actuales.includes(idNum);
    const nuevos = existe ? actuales.filter((id) => id !== idNum) : [...actuales, idNum];
    localStorage.setItem(claveFavUsuario(), JSON.stringify(nuevos));
    return !existe;
};

// ---- Sistema de Notificaciones ----
const notificacionesIniciales = () => [
    {
        id: 1,
        titulo: 'Bienvenida a KAREN-FLIX',
        mensaje: 'Explora el catálogo, guarda tus películas en Favoritos y comparte tus reseñas.',
        fecha: 'Hace un momento',
        leida: false,
        paraRol: 'todos',
        enlace: 'pages/catalogo.html'
    },
    {
        id: 2,
        titulo: '2 propuestas pendientes de moderación',
        mensaje: 'Hay títulos sugeridos por la comunidad esperando revisión en Administración.',
        fecha: 'Hace 5 min',
        leida: false,
        paraRol: 'admin',
        enlace: 'pages/admin.html'
    }
];

export const getNotificaciones = () => {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_NOTIF));
        const lista = Array.isArray(guardadas) ? guardadas : notificacionesIniciales();
        if (!guardadas) localStorage.setItem(CLAVE_NOTIF, JSON.stringify(lista));
        const rol = getUsuario()?.rol || 'usuario';
        return lista.filter((n) => n.paraRol === 'todos' || n.paraRol === rol);
    } catch {
        return [];
    }
};

export const agregarNotificacion = ({ titulo, mensaje, paraRol = 'todos', enlace = '' }) => {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_NOTIF)) || notificacionesIniciales();
        guardadas.unshift({
            id: Date.now(),
            titulo,
            mensaje,
            fecha: 'Ahora mismo',
            leida: false,
            paraRol,
            enlace
        });
        localStorage.setItem(CLAVE_NOTIF, JSON.stringify(guardadas.slice(0, 20)));
    } catch {
        // Ignorar errores de almacenamiento
    }
};

export const marcarNotificacionesLeidas = () => {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_NOTIF)) || [];
        const actualizadas = guardadas.map((n) => ({ ...n, leida: true }));
        localStorage.setItem(CLAVE_NOTIF, JSON.stringify(actualizadas));
    } catch {
        // Ignorar errores
    }
};
