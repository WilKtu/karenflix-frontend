// Gestión de sesión con Cookies + JSON Web Token (JWT), permisos, favoritos y notificaciones.
const CLAVE = 'karenflix_sesion';
const CLAVE_NOTIF = 'karenflix_notificaciones';
const CLAVE_FAV = 'karenflix_favoritos_v1';
const COOKIE_TOKEN = 'karenflix_token';
const COOKIE_CONSENT = 'karenflix_cookies_accepted';

const base64UrlDecode = (str) => {
    try {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '==='.slice((base64.length + 3) % 4);
        return decodeURIComponent(
            atob(padded)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
    } catch {
        return null;
    }
};

export const decodificarJwt = (token) => {
    if (!token || typeof token !== 'string') return null;
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    const jsonPayload = base64UrlDecode(partes[1]);
    if (!jsonPayload) return null;
    try {
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

export const leerCookie = (nombre) => {
    const match = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
};

export const cookiesAceptadas = () =>
    leerCookie(COOKIE_CONSENT) === 'true' || localStorage.getItem(COOKIE_CONSENT) === 'true';

export const aceptarCookies = () => {
    document.cookie = `${COOKIE_CONSENT}=true; path=/; max-age=2592000; SameSite=Lax`;
    localStorage.setItem(COOKIE_CONSENT, 'true');
};

export const restablecerAvisoCookies = () => {
    document.cookie = `${COOKIE_CONSENT}=; path=/; max-age=0; SameSite=Lax`;
    localStorage.removeItem(COOKIE_CONSENT);
};

export const guardarSesion = (token, usuario) => {
    // 1. Guardar Cookie de sesión con el JWT (expiración de 2 horas = 7200 segundos)
    document.cookie = `${COOKIE_TOKEN}=${encodeURIComponent(token)}; path=/; max-age=7200; SameSite=Lax`;
    // 2. Sincronizar estado de sesión en almacenamiento local
    localStorage.setItem(CLAVE, JSON.stringify({ token, usuario }));
};

export const actualizarUsuarioSesion = (parcial) => {
    const actual = leer();
    if (!actual.token) return null;
    const actualizado = { ...actual.usuario, ...parcial };
    guardarSesion(actual.token, actualizado);
    return actualizado;
};

export const cerrarSesion = () => {
    document.cookie = `${COOKIE_TOKEN}=; path=/; max-age=0; SameSite=Lax`;
    localStorage.removeItem(CLAVE);
};

const leer = () => {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE)) || {};
        const tokenCookie = leerCookie(COOKIE_TOKEN);
        const token = tokenCookie || datos.token || null;
        if (!token) return {};

        const payload = decodificarJwt(token);
        if (payload?.exp && payload.exp * 1000 < Date.now()) {
            cerrarSesion();
            return {};
        }

        // Asegurar que la cookie permanezca sincronizada si la sesión sigue activa
        if (!tokenCookie && datos.token) {
            document.cookie = `${COOKIE_TOKEN}=${encodeURIComponent(datos.token)}; path=/; max-age=7200; SameSite=Lax`;
        }
        return { token, usuario: datos.usuario || null, payload };
    } catch {
        return {};
    }
};

export const getToken = () => leer().token || null;
export const getUsuario = () => leer().usuario || null;
export const getJwtPayload = () => leer().payload || decodificarJwt(getToken());
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
