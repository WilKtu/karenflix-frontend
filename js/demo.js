import { getUsuario, agregarNotificacion } from './auth.js';

const DB_KEY = 'karenflix_db_v3';

const estadoInicial = () => ({
    usuarios: [
        {
            id: 1,
            nombre: 'Evelyn Barrios',
            email: 'admin@karenflix.com',
            password: 'Admin1234!',
            rol: 'admin',
            bio: 'Administradora general y curadora de cine en KAREN-FLIX.',
            genero_favorito: 'Ciencia ficción'
        },
        {
            id: 2,
            nombre: 'Wilder Katu',
            email: 'wilder@karenflix.com',
            password: 'Wilder1234!',
            rol: 'usuario',
            bio: 'Crítico de cine y entusiasta de las series de suspenso.',
            genero_favorito: 'Acción'
        },
        {
            id: 3,
            nombre: 'Usuario Prueba',
            email: 'usuario@karenflix.com',
            password: 'Usuario1234!',
            rol: 'usuario',
            bio: 'Amante del séptimo arte y los estrenos de fin de semana.',
            genero_favorito: 'Drama'
        }
    ],
    categorias: [
        { id: 1, nombre: 'Ciencia ficción', descripcion: 'Viajes espaciales, futuros distópicos y tecnología avanzada.' },
        { id: 2, nombre: 'Acción', descripcion: 'Adrenalina pura, persecuciones y secuencias de alto impacto.' },
        { id: 3, nombre: 'Drama', descripcion: 'Historias humanas profundas con actuaciones memorables.' },
        { id: 4, nombre: 'Anime', descripcion: 'Animación japonesa de culto, fantasía épica y cyberpunk.' },
        { id: 5, nombre: 'Documental', descripcion: 'Exploraciones reales de la naturaleza, ciencia e historia.' },
        { id: 6, nombre: 'Suspenso', descripcion: 'Misterios psicológicos y giros inesperados hasta el último minuto.' }
    ],
    peliculas: [
        {
            id: 1,
            titulo: 'Interstellar: Odisea Cósmica',
            tipo: 'pelicula',
            anio: 2014,
            duracion_minutos: 169,
            categoria_id: 1,
            categoria: 'Ciencia ficción',
            director: 'Christopher Nolan',
            actores: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
            imagen_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
            descripcion: 'Un grupo de exploradores espaciales atraviesa un agujero de gusano cerca de Saturno en busca de un nuevo planeta habitable para salvar a la humanidad.',
            rating_promedio: 9.4,
            total_resenas: 2,
            estado: 'aprobada'
        },
        {
            id: 2,
            titulo: 'Inception: El Origen',
            tipo: 'pelicula',
            anio: 2010,
            duracion_minutos: 148,
            categoria_id: 1,
            categoria: 'Ciencia ficción',
            director: 'Christopher Nolan',
            actores: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
            imagen_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
            descripcion: 'Dom Cobb es un ladrón hábil en el arte de la extracción: robar secretos valiosos desde lo más profundo del subconsciente durante el estado de sueño.',
            rating_promedio: 9.2,
            total_resenas: 1,
            estado: 'aprobada'
        },
        {
            id: 3,
            titulo: 'Dune: Parte Dos',
            tipo: 'pelicula',
            anio: 2024,
            duracion_minutos: 166,
            categoria_id: 1,
            categoria: 'Ciencia ficción',
            director: 'Denis Villeneuve',
            actores: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
            imagen_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
            descripcion: 'Paul Atreides se une a Chani y a los Fremen mientras emprende una guerra de venganza contra los conspiradores que destruyeron a su familia.',
            rating_promedio: 9.0,
            total_resenas: 1,
            estado: 'aprobada'
        },
        {
            id: 4,
            titulo: 'Cyberpunk: Edgerunners',
            tipo: 'anime',
            anio: 2022,
            duracion_minutos: 240,
            categoria_id: 4,
            categoria: 'Anime',
            director: 'Hiroyuki Imaishi',
            actores: ['Kenn', 'Aoi Yuuki', 'Hiroki Touchi'],
            imagen_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=JtqIas3bYhg',
            descripcion: 'Un chico de la calle intenta sobrevivir en una ciudad del futuro obsesionada con la tecnología y las modificaciones corporales cibernéticas.',
            rating_promedio: 8.9,
            total_resenas: 1,
            estado: 'aprobada'
        },
        {
            id: 5,
            titulo: 'Oppenheimer',
            tipo: 'pelicula',
            anio: 2023,
            duracion_minutos: 180,
            categoria_id: 3,
            categoria: 'Drama',
            director: 'Christopher Nolan',
            actores: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
            imagen_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
            descripcion: 'La historia del físico estadounidense J. Robert Oppenheimer y su papel crucial al frente del Proyecto Manhattan en el desarrollo de la bomba atómica.',
            rating_promedio: 8.8,
            total_resenas: 1,
            estado: 'aprobada'
        },
        {
            id: 6,
            titulo: 'John Wick 4: Baba Yaga',
            tipo: 'pelicula',
            anio: 2023,
            duracion_minutos: 169,
            categoria_id: 2,
            categoria: 'Acción',
            director: 'Chad Stahelski',
            actores: ['Keanu Reeves', 'Donnie Yen', 'Bill Skarsgård', 'Laurence Fishburne'],
            imagen_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=qEVUtrk8_B4',
            descripcion: 'John Wick descubre un camino para derrotar a la Alta Mesa, pero antes de ganar su libertad debe enfrentarse a un nuevo enemigo con alianzas globales.',
            rating_promedio: 8.5,
            total_resenas: 1,
            estado: 'aprobada'
        },
        {
            id: 7,
            titulo: 'Planeta Tierra III',
            tipo: 'documental',
            anio: 2024,
            duracion_minutos: 300,
            categoria_id: 5,
            categoria: 'Documental',
            director: 'David Attenborough',
            actores: ['David Attenborough'],
            imagen_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=c8aFcHFu8QM',
            descripcion: 'Un recorrido cinematográfico sobrecogedor por los hábitats más extremos del planeta y las extraordinarias estrategias de supervivencia animal.',
            rating_promedio: 9.1,
            total_resenas: 1,
            estado: 'aprobada'
        },
        {
            id: 8,
            titulo: 'Dark: Los Secretos del Tiempo',
            tipo: 'serie',
            anio: 2020,
            duracion_minutos: 60,
            categoria_id: 6,
            categoria: 'Suspenso',
            director: 'Baran bo Odar',
            actores: ['Louis Hofmann', 'Lisa Vicari', 'Maja Schöne'],
            imagen_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=ESEUoa-mz2c',
            descripcion: 'La desaparición de un niño en el pueblo de Winden expone los secretos ocultos y las conexiones fracturadas entre cuatro familias a través de tres generaciones.',
            rating_promedio: 9.3,
            total_resenas: 1,
            estado: 'aprobada'
        },
        {
            id: 9,
            titulo: 'Blade Runner 2049',
            tipo: 'pelicula',
            anio: 2017,
            duracion_minutos: 164,
            categoria_id: 1,
            categoria: 'Ciencia ficción',
            director: 'Denis Villeneuve',
            actores: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
            imagen_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
            descripcion: 'El descubrimiento de un secreto enterrado durante mucho tiempo lleva a un joven Blade Runner a buscar al antiguo agente Rick Deckard.',
            rating_promedio: 0,
            total_resenas: 0,
            estado: 'pendiente',
            creado_por_nombre: 'Wilder Katu'
        },
        {
            id: 10,
            titulo: 'Your Name (Kimi no Na wa)',
            tipo: 'anime',
            anio: 2016,
            duracion_minutos: 106,
            categoria_id: 4,
            categoria: 'Anime',
            director: 'Makoto Shinkai',
            actores: ['Ryunosuke Kamiki', 'Mone Kamishiraishi'],
            imagen_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
            trailer_url: 'https://www.youtube.com/watch?v=xU47nhruN-Q',
            descripcion: 'Dos adolescentes comparten una profunda y mágica conexión al descubrir que están intercambiando cuerpos a través de sus sueños.',
            rating_promedio: 0,
            total_resenas: 0,
            estado: 'pendiente',
            creado_por_nombre: 'Usuario Prueba'
        }
    ],
    resenas: [
        {
            id: 1,
            pelicula_id: 1,
            usuario_id: 2,
            autor: 'Wilder Katu',
            titulo: 'Una obra maestra visual y emocional',
            comentario: 'La banda sonora de Hans Zimmer combinada con la fotografía del agujero negro Gargantúa es simplemente inolvidable.',
            calificacion: 10,
            likes: 8,
            dislikes: 0,
            created_at: '2026-10-20'
        },
        {
            id: 2,
            pelicula_id: 1,
            usuario_id: 1,
            autor: 'Evelyn Barrios',
            titulo: 'Ciencia ficción con corazón humano',
            comentario: 'Logra explicar conceptos complejos de relatividad sin perder nunca el hilo emocional entre padre e hija.',
            calificacion: 9,
            likes: 5,
            dislikes: 0,
            created_at: '2026-10-22'
        },
        {
            id: 3,
            pelicula_id: 2,
            usuario_id: 2,
            autor: 'Wilder Katu',
            titulo: 'Guion brillante de principio a fin',
            comentario: 'Cada nivel del sueño aumenta la tensión. El final con el trompo girando sigue generando debate.',
            calificacion: 9,
            likes: 4,
            dislikes: 1,
            created_at: '2026-10-25'
        }
    ],
    misReacciones: {}
});

const cargarDB = () => {
    try {
        const guardado = JSON.parse(localStorage.getItem(DB_KEY));
        if (guardado && Array.isArray(guardado.usuarios) && Array.isArray(guardado.peliculas)) {
            return guardado;
        }
    } catch {
        // Fallback al estado inicial
    }
    const inicial = estadoInicial();
    localStorage.setItem(DB_KEY, JSON.stringify(inicial));
    return inicial;
};

const guardarDB = (db) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const aprobada = (p) => (p.estado ?? 'aprobada') === 'aprobada';
const normalizar = (t) =>
    String(t || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

const recalcularPelicula = (db, peliculaId) => {
    const p = db.peliculas.find((x) => x.id === Number(peliculaId));
    if (!p) return;
    const lista = db.resenas.filter((r) => r.pelicula_id === p.id);
    p.total_resenas = lista.length;
    p.rating_promedio = lista.length
        ? Number((lista.reduce((acc, r) => acc + Number(r.calificacion), 0) / lista.length).toFixed(1))
        : 0;
};

const ordenes = {
    ranking: (a, b) => b.rating_promedio - a.rating_promedio || b.total_resenas - a.total_resenas,
    popularidad: (a, b) => b.total_resenas - a.total_resenas || b.rating_promedio - a.rating_promedio,
    recientes: (a, b) => b.anio - a.anio || b.id - a.id
};

const listarPeliculas = (db, params) => {
    const q = (params.get('q') || '').toLowerCase();
    const catParam = params.get('categoria') || params.get('categoria_id') || '';
    const filtradas = db.peliculas
        .filter(aprobada)
        .filter((p) => {
            if (!catParam) return true;
            return p.categoria === catParam || String(p.categoria_id) === String(catParam);
        })
        .filter((p) => !params.get('tipo') || p.tipo === params.get('tipo'))
        .filter((p) => !params.get('anio') || p.anio === Number(params.get('anio')))
        .filter(
            (p) =>
                p.titulo.toLowerCase().includes(q) ||
                (p.director && p.director.toLowerCase().includes(q))
        )
        .sort(ordenes[params.get('orden')] || ordenes.ranking);

    const limit = Number(params.get('limit')) || 8;
    const page = Number(params.get('page')) || 1;
    return {
        datos: filtradas.slice((page - 1) * limit, page * limit),
        total: filtradas.length
    };
};

const buscar = (lista, id) => {
    const item = lista.find((x) => x.id === Number(id));
    if (!item) throw new Error('Registro no encontrado.');
    return item;
};

const rutasCategorias = (db, metodo, id, cuerpo) => {
    if (metodo === 'GET') {
        const conTotales = db.categorias.map((c) => ({
            ...c,
            total_peliculas: db.peliculas.filter((p) => p.categoria_id === c.id || p.categoria === c.nombre).length
        }));
        return { datos: conTotales };
    }
    if (metodo === 'POST') {
        if (!cuerpo?.nombre || cuerpo.nombre.trim().length < 2) {
            throw new Error('El nombre de la categoría debe tener al menos 2 caracteres.');
        }
        if (db.categorias.some((c) => normalizar(c.nombre) === normalizar(cuerpo.nombre))) {
            throw new Error('Ya existe una categoría con ese nombre.');
        }
        const nueva = {
            id: Math.max(0, ...db.categorias.map((c) => c.id)) + 1,
            nombre: cuerpo.nombre.trim(),
            descripcion: cuerpo.descripcion?.trim() || ''
        };
        db.categorias.push(nueva);
        guardarDB(db);
        return { datos: nueva };
    }
    const categoria = buscar(db.categorias, id);
    if (metodo === 'PUT') {
        const nombreAnterior = categoria.nombre;
        Object.assign(categoria, {
            nombre: cuerpo.nombre.trim(),
            descripcion: cuerpo.descripcion?.trim() || ''
        });
        db.peliculas
            .filter((p) => p.categoria === nombreAnterior || p.categoria_id === categoria.id)
            .forEach((p) => (p.categoria = categoria.nombre));
        guardarDB(db);
        return { datos: categoria };
    }
    if (
        db.peliculas.some(
            (p) => p.categoria === categoria.nombre || p.categoria_id === categoria.id
        )
    ) {
        throw new Error('No se puede eliminar una categoría que tiene películas asociadas.');
    }
    db.categorias.splice(db.categorias.indexOf(categoria), 1);
    guardarDB(db);
    return { datos: null };
};

const rutasPeliculas = (db, metodo, partes, cuerpo) => {
    const [, sub1, sub2, sub3] = partes; // ['peliculas', id/'admin', 'estado'/'pendientes', ...]

    // GET /peliculas/pendientes o /peliculas/admin/pendientes
    if (metodo === 'GET' && (sub1 === 'pendientes' || (sub1 === 'admin' && sub2 === 'pendientes'))) {
        return { datos: db.peliculas.filter((p) => p.estado === 'pendiente') };
    }

    // PATCH /peliculas/admin/:id/estado o /peliculas/:id/estado
    if (metodo === 'PATCH') {
        const targetId = sub1 === 'admin' ? sub2 : sub1;
        const pelicula = buscar(db.peliculas, targetId);
        pelicula.estado = cuerpo.estado;
        guardarDB(db);
        agregarNotificacion({
            titulo: cuerpo.estado === 'aprobada' ? '🎬 Película aprobada y en cartelera' : 'Propuesta rechazada',
            mensaje: `"${pelicula.titulo}" cambió su estado a ${cuerpo.estado}.`,
            paraRol: 'todos',
            enlace: cuerpo.estado === 'aprobada' ? `pages/detalle.html?id=${pelicula.id}` : ''
        });
        return { datos: pelicula };
    }

    // POST /peliculas (Crear o proponer película)
    if (metodo === 'POST' && !sub1) {
        if (!cuerpo?.titulo || cuerpo.titulo.trim().length < 2) {
            throw new Error('El título de la película es obligatorio.');
        }
        if (db.peliculas.some((p) => normalizar(p.titulo) === normalizar(cuerpo.titulo))) {
            throw new Error('Ya existe una película o serie registrada con ese título.');
        }
        const catObj = db.categorias.find((c) => c.id === Number(cuerpo.categoria_id)) || db.categorias[0];
        const usuarioActual = getUsuario();
        const estadoInicialPeli = usuarioActual?.rol === 'admin' && cuerpo.aprobarDirecto !== false ? 'aprobada' : 'pendiente';

        const nueva = {
            id: Math.max(0, ...db.peliculas.map((p) => p.id)) + 1,
            titulo: cuerpo.titulo.trim(),
            descripcion: cuerpo.descripcion?.trim() || '',
            tipo: cuerpo.tipo || 'pelicula',
            anio: Number(cuerpo.anio) || 2025,
            duracion_minutos: cuerpo.duracion_minutos ? Number(cuerpo.duracion_minutos) : 120,
            categoria_id: catObj.id,
            categoria: catObj.nombre,
            director: cuerpo.director || 'Director Invitado',
            actores: Array.isArray(cuerpo.actores) ? cuerpo.actores : [],
            trailer_url: cuerpo.trailer_url || '',
            imagen_url:
                cuerpo.imagen_url ||
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
            rating_promedio: 0,
            total_resenas: 0,
            estado: estadoInicialPeli,
            creado_por_nombre: usuarioActual?.nombre || 'Comunidad'
        };
        db.peliculas.push(nueva);
        guardarDB(db);

        if (estadoInicialPeli === 'pendiente') {
            agregarNotificacion({
                titulo: '📥 Nueva propuesta de película recibida',
                mensaje: `${nueva.creado_por_nombre} propuso "${nueva.titulo}" para moderación.`,
                paraRol: 'admin',
                enlace: 'pages/admin.html'
            });
        } else {
            agregarNotificacion({
                titulo: '✨ Nuevo estreno en KAREN-FLIX',
                mensaje: `"${nueva.titulo}" (${nueva.anio}) ya está disponible en el catálogo.`,
                paraRol: 'todos',
                enlace: `pages/detalle.html?id=${nueva.id}`
            });
        }
        return { datos: nueva };
    }

    // PUT /peliculas/:id
    if (metodo === 'PUT' && sub1 && !sub2) {
        const pelicula = buscar(db.peliculas, sub1);
        const catObj = db.categorias.find((c) => c.id === Number(cuerpo.categoria_id)) || {
            id: pelicula.categoria_id,
            nombre: pelicula.categoria
        };
        Object.assign(pelicula, cuerpo, {
            categoria_id: catObj.id,
            categoria: catObj.nombre
        });
        guardarDB(db);
        return { datos: pelicula };
    }

    // DELETE /peliculas/:id
    if (metodo === 'DELETE' && sub1 && !sub2) {
        const pelicula = buscar(db.peliculas, sub1);
        db.peliculas.splice(db.peliculas.indexOf(pelicula), 1);
        db.resenas = db.resenas.filter((r) => r.pelicula_id !== pelicula.id);
        guardarDB(db);
        return { datos: null };
    }

    return undefined;
};

export const demo = async (metodo, ruta, cuerpo) => {
    await new Promise((ok) => setTimeout(ok, 220));
    const db = cargarDB();
    const [camino, consulta = ''] = ruta.split('?');
    const params = new URLSearchParams(consulta);
    const partes = camino.split('/').filter(Boolean);

    // 1. Autenticación estricta y gestión de perfil
    if (metodo === 'POST' && camino === '/auth/login') {
        const email = String(cuerpo?.email || '').trim().toLowerCase();
        const password = String(cuerpo?.password || '');

        if (!email || !password) {
            throw new Error('Debes ingresar tu correo electrónico y contraseña.');
        }

        const usuario = db.usuarios.find((u) => u.email.toLowerCase() === email);
        if (!usuario) {
            throw new Error('No existe ninguna cuenta registrada con ese correo electrónico. Verifica el correo o crea una cuenta.');
        }
        if (usuario.password !== password) {
            throw new Error('Contraseña incorrecta. Verifica tus credenciales e inténtalo nuevamente.');
        }

        const { password: _, ...usuarioSeguro } = usuario;
        return {
            datos: {
                token: `jwt-karenflix-${usuario.id}-${Date.now()}`,
                usuario: usuarioSeguro
            }
        };
    }

    if (metodo === 'POST' && camino === '/auth/register') {
        const nombre = String(cuerpo?.nombre || '').trim();
        const email = String(cuerpo?.email || '').trim().toLowerCase();
        const password = String(cuerpo?.password || '');

        if (nombre.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres.');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Ingresa un correo electrónico con formato válido.');
        }
        if (password.length < 8) {
            throw new Error('La contraseña debe tener como mínimo 8 caracteres.');
        }
        if (db.usuarios.some((u) => u.email.toLowerCase() === email)) {
            throw new Error('Este correo electrónico ya está registrado en la base de datos. Por favor, inicia sesión.');
        }
        if (db.usuarios.some((u) => normalizar(u.nombre) === normalizar(nombre))) {
            throw new Error(`El usuario "${nombre}" ya se encuentra registrado en KAREN-FLIX. Inicia sesión con tu cuenta.`);
        }

        const nuevoUsuario = {
            id: Math.max(0, ...db.usuarios.map((u) => u.id)) + 1,
            nombre,
            email,
            password,
            rol: email.startsWith('admin') ? 'admin' : 'usuario',
            bio: 'Nuevo miembro de la comunidad KAREN-FLIX.',
            genero_favorito: 'Ciencia ficción'
        };
        db.usuarios.push(nuevoUsuario);
        guardarDB(db);

        agregarNotificacion({
            titulo: '🎉 ¡Cuenta creada con éxito!',
            mensaje: `Hola ${nombre}, ya puedes calificar películas, publicar reseñas y proponer nuevos títulos.`,
            paraRol: 'todos',
            enlace: 'pages/catalogo.html'
        });

        const { password: _, ...usuarioSeguro } = nuevoUsuario;
        return {
            datos: {
                token: `jwt-karenflix-${nuevoUsuario.id}-${Date.now()}`,
                usuario: usuarioSeguro
            }
        };
    }

    if (metodo === 'PUT' && camino === '/auth/perfil') {
        const sesion = getUsuario();
        if (!sesion) throw new Error('Sesión no válida.');
        const usuario = db.usuarios.find((u) => u.id === sesion.id || u.email === sesion.email);
        if (!usuario) throw new Error('Usuario no encontrado en la base de datos.');

        const nuevoNombre = String(cuerpo?.nombre || '').trim();
        const nuevoEmail = String(cuerpo?.email || '').trim().toLowerCase();
        if (nuevoNombre.length < 2) throw new Error('El nombre debe tener al menos 2 caracteres.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoEmail)) throw new Error('El formato del correo no es válido.');

        if (
            nuevoEmail !== usuario.email.toLowerCase() &&
            db.usuarios.some((u) => u.id !== usuario.id && u.email.toLowerCase() === nuevoEmail)
        ) {
            throw new Error('Ese correo ya está en uso por otra cuenta.');
        }

        const nombreAnterior = usuario.nombre;
        usuario.nombre = nuevoNombre;
        usuario.email = nuevoEmail;
        if (cuerpo.bio !== undefined) usuario.bio = cuerpo.bio.trim();
        if (cuerpo.genero_favorito !== undefined) usuario.genero_favorito = cuerpo.genero_favorito;
        if (cuerpo.nuevaPassword && cuerpo.nuevaPassword.length >= 8) {
            usuario.password = cuerpo.nuevaPassword;
        }

        // Actualizar nombre en reseñas del usuario
        db.resenas
            .filter((r) => r.usuario_id === usuario.id || r.autor === nombreAnterior)
            .forEach((r) => (r.autor = usuario.nombre));

        guardarDB(db);
        const { password: _, ...usuarioSeguro } = usuario;
        return { datos: usuarioSeguro };
    }

    // 2. Categorías
    if (partes[0] === 'categorias') {
        return rutasCategorias(db, metodo, partes[1], cuerpo);
    }

    // 3. Administración y mutación de películas
    if (partes[0] === 'peliculas') {
        const respPeli = rutasPeliculas(db, metodo, partes, cuerpo);
        if (respPeli !== undefined) return respPeli;
    }

    // 4. Listado público de películas
    if (metodo === 'GET' && camino === '/peliculas') {
        return listarPeliculas(db, params);
    }

    // 5. Detalle de una película con sus reseñas
    if (metodo === 'GET' && partes[0] === 'peliculas' && partes.length === 2) {
        const pelicula = db.peliculas.find((p) => p.id === Number(partes[1]));
        if (!pelicula) throw new Error('Película no encontrada');
        const lista = db.resenas
            .filter((r) => r.pelicula_id === pelicula.id)
            .sort((a, b) => b.id - a.id)
            .map((r) => ({ ...r, miReaccion: db.misReacciones[r.id] || null }));
        return { datos: { ...pelicula, resenas: lista } };
    }

    // 6. Crear reseña (POST /peliculas/:id/resenas)
    if (metodo === 'POST' && partes[0] === 'peliculas' && partes[2] === 'resenas') {
        const usuario = getUsuario();
        if (!usuario) throw new Error('Debes iniciar sesión para publicar una reseña.');
        const peliculaId = Number(partes[1]);
        if (
            db.resenas.some(
                (r) =>
                    r.pelicula_id === peliculaId &&
                    (r.usuario_id === usuario.id || r.autor === usuario.nombre)
            )
        ) {
            throw new Error('Ya publicaste una reseña en esta película. Puedes editar tu reseña existente abajo.');
        }

        const nueva = {
            id: Math.max(0, ...db.resenas.map((r) => r.id)) + 1,
            pelicula_id: peliculaId,
            usuario_id: usuario.id,
            autor: usuario.nombre,
            titulo: cuerpo.titulo.trim(),
            comentario: cuerpo.comentario.trim(),
            calificacion: Number(cuerpo.calificacion),
            likes: 0,
            dislikes: 0,
            created_at: new Date().toISOString().slice(0, 10)
        };
        db.resenas.push(nueva);
        recalcularPelicula(db, peliculaId);
        guardarDB(db);
        return { datos: nueva };
    }

    // 7. Editar reseña (PUT /resenas/:id)
    if (metodo === 'PUT' && partes[0] === 'resenas' && partes.length === 2) {
        const usuario = getUsuario();
        if (!usuario) throw new Error('Inicia sesión para editar tu reseña.');
        const resena = buscar(db.resenas, partes[1]);
        if (resena.usuario_id !== usuario.id && resena.autor !== usuario.nombre && usuario.rol !== 'admin') {
            throw new Error('Solo puedes editar tus propias reseñas.');
        }
        resena.titulo = cuerpo.titulo.trim();
        resena.comentario = cuerpo.comentario.trim();
        resena.calificacion = Number(cuerpo.calificacion);
        recalcularPelicula(db, resena.pelicula_id);
        guardarDB(db);
        return { datos: resena };
    }

    // 8. Eliminar reseña (DELETE /resenas/:id)
    if (metodo === 'DELETE' && partes[0] === 'resenas' && partes.length === 2) {
        const usuario = getUsuario();
        if (!usuario) throw new Error('Inicia sesión para eliminar tu reseña.');
        const resena = buscar(db.resenas, partes[1]);
        if (resena.usuario_id !== usuario.id && resena.autor !== usuario.nombre && usuario.rol !== 'admin') {
            throw new Error('No tienes permiso para eliminar esta reseña.');
        }
        const peliculaId = resena.pelicula_id;
        db.resenas.splice(db.resenas.indexOf(resena), 1);
        recalcularPelicula(db, peliculaId);
        guardarDB(db);
        return { datos: null };
    }

    // 9. Reaccionar a reseña (POST /resenas/:id/reaccion)
    if (metodo === 'POST' && partes[0] === 'resenas' && partes[2] === 'reaccion') {
        const id = Number(partes[1]);
        const tipo = cuerpo.tipo;
        const resena = buscar(db.resenas, id);
        const previa = db.misReacciones[id];
        if (previa === tipo) {
            resena[`${tipo}s`] = Math.max(0, resena[`${tipo}s`] - 1);
            delete db.misReacciones[id];
            guardarDB(db);
            return { datos: { ...resena, miReaccion: null } };
        }
        if (previa) resena[`${previa}s`] = Math.max(0, resena[`${previa}s`] - 1);
        resena[`${tipo}s`]++;
        db.misReacciones[id] = tipo;
        guardarDB(db);
        return { datos: { ...resena, miReaccion: tipo } };
    }

    throw new Error('Ruta no disponible');
};
