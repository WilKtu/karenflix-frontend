import { CONFIG } from './config.js';
import { getToken } from './auth.js';
import { demo } from './demo.js';

const adaptarResena = (r) => {
    if (!r || typeof r !== 'object') return r;
    return {
        ...r,
        autor: r.autor || r.usuario_nombre || 'Usuario',
        created_at: r.created_at ? String(r.created_at).slice(0, 10) : ''
    };
};

const adaptarPelicula = (p) => {
    if (!p || typeof p !== 'object') return p;
    return {
        ...p,
        categoria:
            typeof p.categoria === 'object' && p.categoria !== null
                ? p.categoria.nombre
                : p.categoria || p.categoria_nombre || 'General',
        categoria_id:
            typeof p.categoria === 'object' && p.categoria !== null
                ? p.categoria.id
                : p.categoria_id,
        resenas: Array.isArray(p.resenas) ? p.resenas.map(adaptarResena) : []
    };
};

const adaptarRespuesta = (json) => {
    if (!json) return { datos: null };
    if (json.status && json.data !== undefined) {
        const d = json.data;
        if (d && typeof d === 'object') {
            if (Array.isArray(d.items)) {
                return {
                    datos: d.items.map(adaptarPelicula),
                    total: d.pagination?.total ?? d.items.length
                };
            }
            if (Array.isArray(d)) {
                return { datos: d.map(adaptarPelicula) };
            }
            return { datos: adaptarPelicula(d) };
        }
        return { datos: d };
    }
    return json;
};

const pedir = async (metodo, ruta, cuerpo) => {
    if (CONFIG.USAR_DEMO) return demo(metodo, ruta, cuerpo);

    const cabeceras = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) cabeceras.Authorization = `Bearer ${token}`;

    let respuesta;
    try {
        respuesta = await fetch(CONFIG.API_URL + ruta, {
            method: metodo,
            headers: cabeceras,
            credentials: 'include',
            body: cuerpo ? JSON.stringify(cuerpo) : undefined
        });
    } catch {
        // Si el servidor backend local/Aiven aún no está encendido, usa el motor persistente local
        return demo(metodo, ruta, cuerpo);
    }

    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        const msg =
            json?.error?.message ||
            json?.mensaje ||
            json?.message ||
            'Error al procesar la solicitud.';
        throw new Error(msg);
    }

    const adaptado = adaptarRespuesta(json);

    // Si se pide el detalle de una película al backend real, cargar también sus reseñas
    const partes = ruta.split('?')[0].split('/').filter(Boolean);
    if (metodo === 'GET' && partes[0] === 'peliculas' && partes.length === 2 && partes[1] !== 'pendientes') {
        try {
            const respResenas = await fetch(`${CONFIG.API_URL}/peliculas/${partes[1]}/resenas`, {
                headers: cabeceras,
                credentials: 'include'
            });
            const jsonResenas = await respResenas.json().catch(() => ({}));
            if (respResenas.ok && Array.isArray(jsonResenas.data)) {
                adaptado.datos.resenas = jsonResenas.data.map(adaptarResena);
            }
        } catch {
            // Ignorar si no hay reseñas
        }
    }

    return adaptado;
};

export const api = {
    get: (ruta) => pedir('GET', ruta),
    post: (ruta, cuerpo) => pedir('POST', ruta, cuerpo),
    put: (ruta, cuerpo) => pedir('PUT', ruta, cuerpo),
    patch: (ruta, cuerpo) => pedir('PATCH', ruta, cuerpo),
    delete: (ruta) => pedir('DELETE', ruta)
};
