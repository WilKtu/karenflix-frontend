// El token lo emite el backend; aquí solo se guarda. La seguridad real vive en el backend.
const CLAVE = 'karenflix_sesion';

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
