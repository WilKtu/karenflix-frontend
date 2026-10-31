// El token lo emite el backend; aquí solo se guarda. La seguridad real vive en el backend.
const CLAVE = 'karenflix_sesion';
const CLAVE_NOTIF = 'karenflix_notificaciones';
const CLAVE_FAV = 'karenflix_favoritos_v1';

export const guardarSesion = (token, usuario) => localStorage.setItem(CLAVE, JSON.stringify({ token, usuario }));
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
    location.href = `${location.pathname.includes('/pages/') ? '' : 'pages/'}login.html`;
    return false;
};
export const requireAdmin = () => requireAuth() && esAdmin();

// ---- Gestión de Favoritos ----
const claveFavUsuario = () => {
    const u = getUsuario();
    return u ? `${CLAVE_FAV}_${u.id || u.email}` : `${CLAVE_FAV}_anon`;
};

export const getFavoritosIds = () => {
    try {
        if (!getUsuario()) return [];
        const guardados = JSON.parse(localStorage.getItem(claveFavUsuario()));
        return Array.isArray(guardados) ? guardados.map(Number) : [];
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
        paraUsuarioId: null,
        enlace: 'pages/catalogo.html'
    },
    {
        id: 2,
        titulo: '2 propuestas pendientes de moderación',
        mensaje: 'Hay títulos sugeridos por la comunidad esperando revisión en Administración.',
        fecha: 'Hace 5 min',
        leida: false,
        paraRol: 'admin',
        paraUsuarioId: null,
        enlace: 'pages/admin.html'
    }
];

export const getNotificaciones = () => {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_NOTIF));
        const lista = Array.isArray(guardadas) ? guardadas : notificacionesIniciales();
        if (!guardadas) localStorage.setItem(CLAVE_NOTIF, JSON.stringify(lista));
        const u = getUsuario();
        const rol = u?.rol || 'usuario';
        const usuarioId = u?.id ?? null;

        return lista.filter((n) => {
            if (n.paraUsuarioId && usuarioId) {
                return String(n.paraUsuarioId) === String(usuarioId);
            }
            return n.paraRol === 'todos' || n.paraRol === rol;
        });
    } catch {
        return [];
    }
};

export const agregarNotificacion = ({ titulo, mensaje, paraRol = 'todos', paraUsuarioId = null, enlace = '' }) => {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_NOTIF)) || notificacionesIniciales();
        guardadas.unshift({
            id: Date.now(),
            titulo,
            mensaje,
            fecha: 'Ahora mismo',
            leida: false,
            paraRol,
            paraUsuarioId,
            enlace
        });
        localStorage.setItem(CLAVE_NOTIF, JSON.stringify(guardadas.slice(0, 30)));
    } catch {
        // Ignorar errores de almacenamiento
    }
};

export const marcarNotificacionesLeidas = () => {
    try {
        const guardadas = JSON.parse(localStorage.getItem(CLAVE_NOTIF)) || [];
        const u = getUsuario();
        const usuarioId = u?.id ?? null;
        const rol = u?.rol || 'usuario';

        const actualizadas = guardadas.map((n) => {
            const esParaEsteUsuario = (n.paraUsuarioId && usuarioId && String(n.paraUsuarioId) === String(usuarioId)) ||
                                     (!n.paraUsuarioId && (n.paraRol === 'todos' || n.paraRol === rol));
            return esParaEsteUsuario ? { ...n, leida: true } : n;
        });
        localStorage.setItem(CLAVE_NOTIF, JSON.stringify(actualizadas));
    } catch {
        // Ignorar errores
    }
};
