import { CONFIG } from './config.js';
import { getToken } from './auth.js';
import { demo } from './demo.js';


const adaptarRespuesta = (json) => {
    if (!json) return adaptarRespuesta(json);
    // Si viene en formato backend { status: 'success', data: ... }
    if (json.status && json.data !== undefined) {
        const d = json.data;
        if (d && typeof d === 'object') {
            // Si es listado paginado { items, pagination: { total } }
            if (Array.isArray(d.items)) {
                return {
                    datos: d.items.map(adaptarPelicula),
                    total: d.pagination?.total ?? d.items.length
                };
            }
            // Si data es un array directo (ej: categorias o pendientes)
            if (Array.isArray(d)) {
                return { datos: d.map(adaptarPelicula) };
            }
            // Si es un objeto individual (ej: detalle de pelicula o sesion)
            return { datos: adaptarPelicula(d) };
        }
        return { datos: d };
    }
    return json;
};

const adaptarPelicula = (p) => {
    if (!p || typeof p !== 'object') return p;
    return {
        ...p,
        categoria: typeof p.categoria === 'object' && p.categoria !== null ? p.categoria.nombre : (p.categoria || p.categoria_nombre),
        categoria_id: typeof p.categoria === 'object' && p.categoria !== null ? p.categoria.id : p.categoria_id,
        resenas: p.resenas || []
    };
};

const pedir = async (metodo, ruta, cuerpo) => {
    if (CONFIG.USAR_DEMO) return demo(metodo, ruta, cuerpo);

    const cabeceras = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) cabeceras.Authorization = `Bearer ${token}`;

    const respuesta = await fetch(CONFIG.API_URL + ruta, {
        method: metodo,
        headers: cabeceras,
        body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(json.mensaje || json.message || 'Error del servidor');
    return json;
};

export const api = {
    get: (ruta) => pedir('GET', ruta),
    post: (ruta, cuerpo) => pedir('POST', ruta, cuerpo),
    put: (ruta, cuerpo) => pedir('PUT', ruta, cuerpo),
    patch: (ruta, cuerpo) => pedir('PATCH', ruta, cuerpo),
    delete: (ruta) => pedir('DELETE', ruta)
};
