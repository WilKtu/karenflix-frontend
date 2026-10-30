import { CONFIG } from './config.js';
import { getToken } from './auth.js';
import { demo } from './demo.js';

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
