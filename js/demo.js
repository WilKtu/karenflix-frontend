// PENDIENTE de validar : nombres de campos y respuestas reales.
// Solo demo: un correo que empiece por "admin" entra con rol admin.


const categorias = [{ id: 1, nombre: 'Ciencia ficción' }, { id: 2, nombre: 'Drama' }, { id: 3, nombre: 'Anime' }, { id: 4, nombre: 'Documental' }];

const peliculas = [
    { id: 1, titulo: 'Odisea estelar', tipo: 'pelicula', anio: 2025, categoria: 'Ciencia ficción', descripcion: 'Una tripulación descubre señales en los límites de una galaxia desconocida.', rating_promedio: 8.7, total_resenas: 2 },
    { id: 2, titulo: 'Planeta azul', tipo: 'documental', anio: 2024, categoria: 'Documental', descripcion: 'Un viaje por ecosistemas extraordinarios y las especies que los habitan.', rating_promedio: 9.1, total_resenas: 1 },
    { id: 3, titulo: 'La última estación', tipo: 'pelicula', anio: 2023, categoria: 'Drama', descripcion: 'Dos desconocidos coinciden en una estación y cambian sus destinos.', rating_promedio: 8.2, total_resenas: 0 },
    { id: 4, titulo: 'Código salvaje', tipo: 'serie', anio: 2025, categoria: 'Ciencia ficción', descripcion: 'Un equipo debe resolver un misterio oculto en una reserva natural.', rating_promedio: 8.5, total_resenas: 0 },
    { id: 5, titulo: 'Sakura Blade', tipo: 'anime', anio: 2022, categoria: 'Anime', descripcion: 'Una espadachina busca el origen de un antiguo pacto.', rating_promedio: 7.9, total_resenas: 0 },
    { id: 6, titulo: 'Ecos del mar', tipo: 'serie', anio: 2021, categoria: 'Drama', descripcion: 'Una familia de pescadores enfrenta una temporada difícil.', rating_promedio: 7.4, total_resenas: 0 }
];

peliculas.push(
    { id: 7, titulo: 'Noches de neón', tipo: 'serie', anio: 2026, categoria: 'Drama', descripcion: 'Un detective recorre una ciudad que nunca duerme.', rating_promedio: 0, total_resenas: 0, estado: 'pendiente' },
    { id: 8, titulo: 'Cumbres del Sur', tipo: 'documental', anio: 2025, categoria: 'Documental', descripcion: 'Una expedición a las montañas más remotas.', rating_promedio: 0, total_resenas: 0, estado: 'pendiente' }
);

const resenas = [
    { id: 1, pelicula_id: 1, autor: 'Camila', titulo: 'Impresionante', comentario: 'Una historia que te atrapa desde el inicio.', calificacion: 9, likes: 4, dislikes: 0, created_at: '2026-10-20' },
    { id: 2, pelicula_id: 1, autor: 'Andrés', titulo: 'Buena, pero larga', comentario: 'Muy buena ambientación, el final se siente apresurado.', calificacion: 8, likes: 1, dislikes: 1, created_at: '2026-09-02' },
    { id: 3, pelicula_id: 2, autor: 'Lucía', titulo: 'Visualmente increíble', comentario: 'Las imágenes del océano valen la pena.', calificacion: 9, likes: 2, dislikes: 0, created_at: '2026-10-11' }
];

const misReacciones = {}; // resena_id -> 'like' | 'dislike' (un solo voto por reseña)
const ordenes = { ranking: (a, b) => b.rating_promedio - a.rating_promedio, popularidad: (a, b) => b.total_resenas - a.total_resenas, recientes: (a, b) => b.anio - a.anio };

const listar = (params) => {
    const q = (params.get('q') || '').toLowerCase();
    const filtradas = peliculas
        .filter(aprobada)
        .filter((p) => !params.get('categoria') || p.categoria === params.get('categoria'))
        .filter((p) => !params.get('tipo') || p.tipo === params.get('tipo'))
        .filter((p) => !params.get('anio') || p.anio === Number(params.get('anio')))
        .filter((p) => p.titulo.toLowerCase().includes(q))
        .sort(ordenes[params.get('orden')] || ordenes.ranking);
    const limit = Number(params.get('limit')) || 8;
    const page = Number(params.get('page')) || 1;
    return { datos: filtradas.slice((page - 1) * limit, page * limit), total: filtradas.length };
};

const reaccionar = (id, tipo) => {
    const resena = resenas.find((r) => r.id === id);
    const previa = misReacciones[id];
    if (previa === tipo) return { datos: { ...resena, miReaccion: tipo } };
    if (previa) resena[`${previa}s`]--;
    resena[`${tipo}s`]++;
    misReacciones[id] = tipo;
    return { datos: { ...resena, miReaccion: tipo } };
};

// ---- Administración (categorías, películas y pendientes) ----
const aprobada = (p) => (p.estado ?? 'aprobada') === 'aprobada';
const normalizar = (t) => t.trim().toLowerCase().replace(/\s+/g, ' ');

const buscar = (lista, id) => {
    const item = lista.find((x) => x.id === Number(id));
    if (!item) throw new Error('No encontrado');
    return item;
};

const rutasCategorias = (metodo, id, cuerpo) => {
    if (metodo === 'GET') return { datos: categorias };
    if (metodo === 'POST') {
        if (categorias.some((c) => normalizar(c.nombre) === normalizar(cuerpo.nombre))) throw new Error('La categoría ya existe');
        const nueva = { id: Math.max(0, ...categorias.map((c) => c.id)) + 1, nombre: cuerpo.nombre, descripcion: cuerpo.descripcion };
        categorias.push(nueva);
        return { datos: nueva };
    }
    const categoria = buscar(categorias, id);
    if (metodo === 'PUT') {
        peliculas.filter((p) => p.categoria === categoria.nombre).forEach((p) => (p.categoria = cuerpo.nombre));
        return { datos: Object.assign(categoria, { nombre: cuerpo.nombre, descripcion: cuerpo.descripcion }) };
    }
    if (peliculas.some((p) => p.categoria === categoria.nombre)) throw new Error('No se puede borrar una categoría que tiene películas');
    categorias.splice(categorias.indexOf(categoria), 1);
    return { datos: null };
};

const rutasPeliculas = (metodo, id, extra, cuerpo) => {
    if (metodo === 'GET' && id === 'pendientes') return { datos: peliculas.filter((p) => p.estado === 'pendiente') };
    if (metodo === 'POST' && !id) {
        if (peliculas.some((p) => normalizar(p.titulo) === normalizar(cuerpo.titulo))) throw new Error('Ya existe una película con ese título');
        const nueva = { id: Math.max(0, ...peliculas.map((p) => p.id)) + 1, ...cuerpo, categoria: buscar(categorias, cuerpo.categoria_id).nombre, rating_promedio: 0, total_resenas: 0, estado: 'pendiente' };
        peliculas.push(nueva);
        return { datos: nueva };
    }
    if (!id || metodo === 'GET' || (extra && extra !== 'estado')) return undefined;
    const pelicula = buscar(peliculas, id);
    if (metodo === 'PATCH') return { datos: Object.assign(pelicula, { estado: cuerpo.estado }) };
    if (metodo === 'PUT') return { datos: Object.assign(pelicula, cuerpo, { categoria: buscar(categorias, cuerpo.categoria_id).nombre }) };
    peliculas.splice(peliculas.indexOf(pelicula), 1);
    return { datos: null };
};

const rutasAdmin = (metodo, [recurso, id, extra], cuerpo) => {
    if (recurso === 'categorias') return rutasCategorias(metodo, id, cuerpo);
    if (recurso === 'peliculas') return rutasPeliculas(metodo, id, extra, cuerpo);
    return undefined;
};

export const demo = async (metodo, ruta, cuerpo) => {
    await new Promise((ok) => setTimeout(ok, 250));
    const [camino, consulta = ''] = ruta.split('?');
    const params = new URLSearchParams(consulta);
    const partes = camino.split('/').filter(Boolean);

    const respuestaAdmin = rutasAdmin(metodo, partes, cuerpo);
    if (respuestaAdmin) return respuestaAdmin;
    if (metodo === 'GET' && camino === '/peliculas') return listar(params);
    if (metodo === 'GET' && partes[0] === 'peliculas' && partes.length === 2) {
        const pelicula = peliculas.find((p) => p.id === Number(partes[1]));
        if (!pelicula) throw new Error('Película no encontrada');
        const lista = resenas.filter((r) => r.pelicula_id === pelicula.id).map((r) => ({ ...r, miReaccion: misReacciones[r.id] || null }));
        return { datos: { ...pelicula, resenas: lista } };
    }
    if (metodo === 'POST' && partes[2] === 'resenas') {
        const nueva = { id: resenas.length + 1, pelicula_id: Number(partes[1]), autor: 'Tú', likes: 0, dislikes: 0, created_at: new Date().toISOString().slice(0, 10), ...cuerpo };
        resenas.push(nueva);
        return { datos: nueva };
    }
    if (metodo === 'POST' && partes[0] === 'resenas' && partes[2] === 'reaccion') return reaccionar(Number(partes[1]), cuerpo.tipo);
    if (metodo === 'POST' && camino === '/auth/login') return { datos: { token: 'token-demo', usuario: { nombre: cuerpo.email.split('@')[0], rol: cuerpo.email.startsWith('admin') ? 'admin' : 'usuario' } } };
    if (metodo === 'POST' && camino === '/auth/register') return { datos: { token: 'token-demo', usuario: { nombre: cuerpo.nombre, rol: 'usuario' } } };
    throw new Error('Ruta no disponible en modo demo');
};
