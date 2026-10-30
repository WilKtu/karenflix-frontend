import { api } from '../api.js';
import { requireAdmin, getUsuario } from '../auth.js';
import { toast, loader, escapar, estadoVacio, confirmar } from '../ui.js';
import { montarNavbar } from '../components/navbar.js';

montarNavbar('');

const $ = (id) => document.getElementById(id);
const datos = { categorias: [], peliculas: [], pendientes: [] };

// ---------- Plantillas de tabla ----------
const boton = (accion, id, texto, clase = '') =>
    `<button class="btn btn-sm ${clase}" type="button" data-accion="${accion}" data-id="${id}">${texto}</button>`;

const fila = (celdas, botones) =>
    `<tr>${celdas.map((c) => `<td>${c}</td>`).join('')}<td class="acciones-fila">${botones}</td></tr>`;

const tabla = (cabeceras, filas, textoVacio) => {
    if (!filas.length) return estadoVacio(textoVacio);
    const encabezado = [...cabeceras, 'Acciones'].map((h) => `<th>${h}</th>`).join('');
    return `<div class="tabla-wrap"><table><thead><tr>${encabezado}</tr></thead><tbody>${filas.join('')}</tbody></table></div>`;
};

const celdaTituloConPoster = (p) => {
    const thumb =
        p.imagen_url && String(p.imagen_url).startsWith('http')
            ? `<img src="${escapar(p.imagen_url)}" alt="" class="admin-thumb">`
            : `<span class="admin-thumb-placeholder">🎬</span>`;
    return `<div class="celda-pelicula-info">
                ${thumb}
                <div>
                    <strong>${escapar(p.titulo)}</strong>
                    ${p.director ? `<div class="muted" style="font-size:0.78rem;">🎥 ${escapar(p.director)}</div>` : ''}
                </div>
            </div>`;
};

const celdasPelicula = (p) => [
    celdaTituloConPoster(p),
    `<span class="badge-tabla">${escapar(p.tipo)}</span>`,
    p.anio,
    escapar(p.categoria)
];

// ---------- Pintado ----------
const pintar = () => {
    $('stat-pendientes').textContent = datos.pendientes.length;
    $('stat-peliculas').textContent = datos.peliculas.length;
    $('stat-categorias').textContent = datos.categorias.length;

    $('tabla-pendientes').innerHTML = tabla(
        ['Película Propuesta', 'Tipo', 'Año', 'Categoría'],
        datos.pendientes.map((p) =>
            fila(
                celdasPelicula(p),
                boton('aprobar', p.id, '✓ Aprobar', 'btn-ok') +
                    boton('rechazar', p.id, '✕ Rechazar', 'btn-peligro')
            )
        ),
        '🎉 No hay propuestas pendientes de moderación en este momento.'
    );

    $('tabla-peliculas').innerHTML = tabla(
        ['Título en Cartelera', 'Tipo', 'Año', 'Categoría', 'Calificación'],
        datos.peliculas.map((p) =>
            fila(
                [...celdasPelicula(p), `<span class="score">★ ${Number(p.rating_promedio || 0).toFixed(1)}</span>`],
                boton('editar-pelicula', p.id, '✏️ Editar') +
                    boton('eliminar-pelicula', p.id, '🗑️ Eliminar', 'btn-peligro')
            )
        ),
        'Aún no hay películas aprobadas en el catálogo.'
    );

    $('tabla-categorias').innerHTML = tabla(
        ['Nombre de Categoría', 'Descripción', 'Títulos'],
        datos.categorias.map((c) =>
            fila(
                [
                    `<strong>${escapar(c.nombre)}</strong>`,
                    escapar(c.descripcion || '—'),
                    `<span class="badge-tabla">${c.total_peliculas ?? 0}</span>`
                ],
                boton('editar-categoria', c.id, '✏️ Editar') +
                    boton('eliminar-categoria', c.id, '🗑️ Eliminar', 'btn-peligro')
            )
        ),
        'Aún no hay categorías registradas.'
    );

    $('p-categoria').innerHTML = datos.categorias
        .map((c) => `<option value="${c.id}">${escapar(c.nombre)}</option>`)
        .join('');
};

const cargarTodo = async () => {
    loader(true);
    try {
        const [categorias, peliculas, pendientes] = await Promise.all([
            api.get('/categorias'),
            api.get('/peliculas?orden=recientes&limit=50'),
            api.get('/peliculas/admin/pendientes')
        ]);
        datos.categorias = categorias.datos || [];
        datos.peliculas = peliculas.datos || [];
        datos.pendientes = pendientes.datos || [];
        pintar();
    } catch (error) {
        toast(error.message, 'error');
    } finally {
        loader(false);
    }
};

// ---------- Vistas ----------
const mostrarVista = (vista) => {
    document
        .querySelectorAll('[data-vista]')
        .forEach((b) => b.setAttribute('aria-selected', String(b.dataset.vista === vista)));
    document.querySelectorAll('.vista').forEach((s) => (s.hidden = s.id !== `vista-${vista}`));
};

// ---------- Diálogos ----------

// HU-17: Previsualización de póster en vivo
const actualizarPreviewPoster = (url) => {
    const img = $('p-poster-preview');
    const ph = $('p-poster-placeholder');
    if (!url || !url.trim().startsWith('http')) {
        img.hidden = true;
        img.src = '';
        ph.hidden = false;
        ph.textContent = 'Ingresa una URL de imagen válida para previsualizar';
        return;
    }
    img.src = url.trim();
    img.onload = () => {
        img.hidden = false;
        ph.hidden = true;
    };
    img.onerror = () => {
        img.hidden = true;
        ph.hidden = false;
        ph.textContent = 'No se pudo cargar la imagen. Verifica el enlace.';
    };
};

const idCategoria = (p) =>
    p.categoria_id ?? datos.categorias.find((c) => c.nombre === p.categoria)?.id ?? '';

const abrirCategoria = (categoria) => {
    const form = $('form-categoria');
    form.reset();
    form.dataset.id = categoria?.id ?? '';
    $('titulo-dlg-categoria').textContent = categoria ? '✏️ Editar categoría' : '➕ Nueva categoría';
    $('error-categoria').textContent = '';
    if (categoria) {
        form.nombre.value = categoria.nombre;
        form.descripcion.value = categoria.descripcion || '';
    }
    $('dlg-categoria').showModal();
};

const abrirPelicula = (pelicula) => {
    const form = $('form-pelicula');
    form.reset();
    form.dataset.id = pelicula?.id ?? '';
    $('titulo-dlg-pelicula').textContent = pelicula ? '✏️ Editar película' : '🎬 Nueva película en cartelera';
    $('error-pelicula').textContent = '';
    if (pelicula) {
        form.titulo.value = pelicula.titulo || '';
        form.descripcion.value = pelicula.descripcion || '';
        form.tipo.value = pelicula.tipo || 'pelicula';
        form.anio.value = pelicula.anio || '';
        form.categoria_id.value = idCategoria(pelicula);
        form.duracion_minutos.value = pelicula.duracion_minutos || '';
        form.director.value = pelicula.director || '';
        form.actores.value = Array.isArray(pelicula.actores)
            ? pelicula.actores.map((a) => (typeof a === 'object' ? a.nombre : a)).join(', ')
            : pelicula.actores || '';
        form.trailer_url.value = pelicula.trailer_url || '';
        form.imagen_url.value = pelicula.imagen_url || '';
        actualizarPreviewPoster(pelicula.imagen_url);
    } else {
        actualizarPreviewPoster('');
    }
    $('dlg-pelicula').showModal();
};

// Crea (POST) o edita (PUT) según el id guardado en el formulario
const guardar = async (form, ruta, cuerpo, idError, idDialogo) => {
    const id = form.dataset.id;
    try {
        const res = await (id ? api.put(`${ruta}/${id}`, cuerpo) : api.post(ruta, cuerpo));
        // Si el admin creó una película nueva en el backend real (que inicia en 'pendiente'), aprobarla automáticamente
        if (!id && ruta === '/peliculas' && res?.datos?.id && res?.datos?.estado === 'pendiente') {
            await api.patch(`/peliculas/admin/${res.datos.id}/estado`, { estado: 'aprobada' }).catch(() => {});
        }
        $(idDialogo).close();
        toast(id ? '✨ Cambios guardados correctamente' : '🎬 Registro creado con éxito');
        await cargarTodo();
    } catch (error) {
        $(idError).textContent = error.message;
    }
};

$('form-categoria').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const nombre = form.nombre.value.trim();
    if (nombre.length < 2) {
        return ($('error-categoria').textContent = 'El nombre debe tener mínimo 2 caracteres.');
    }
    guardar(
        form,
        '/categorias',
        { nombre, descripcion: form.descripcion.value.trim() },
        'error-categoria',
        'dlg-categoria'
    );
});

$('form-pelicula').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const anio = Number(form.anio.value);
    if (form.titulo.value.trim().length < 2) {
        return ($('error-pelicula').textContent = 'Escribe un título válido (mínimo 2 caracteres).');
    }
    if (form.descripcion.value.trim().length < 5) {
        return ($('error-pelicula').textContent = 'Escribe una descripción válida.');
    }
    if (!Number.isInteger(anio) || anio < 1900 || anio > 2100) {
        return ($('error-pelicula').textContent = 'El año debe estar entre 1900 y 2100.');
    }
    if (!form.categoria_id.value) {
        return ($('error-pelicula').textContent = 'Crea y elige una categoría.');
    }

    const actores = form.actores.value
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

    guardar(
        form,
        '/peliculas',
        {
            titulo: form.titulo.value.trim(),
            descripcion: form.descripcion.value.trim(),
            tipo: form.tipo.value,
            anio,
            categoria_id: Number(form.categoria_id.value),
            duracion_minutos: form.duracion_minutos.value ? Number(form.duracion_minutos.value) : null,
            director: form.director.value.trim() || null,
            actores: actores.length ? actores : [],
            trailer_url: form.trailer_url.value.trim() || null,
            imagen_url: form.imagen_url.value.trim() || null,
            aprobarDirecto: true
        },
        'error-pelicula',
        'dlg-pelicula'
    );
});

// ---------- Acciones de las tablas ----------
const ejecutar = async (peticion, mensaje) => {
    try {
        await peticion();
        toast(mensaje);
        await cargarTodo();
    } catch (error) {
        toast(error.message, 'error');
    }
};

const buscar = (lista, id) => lista.find((x) => x.id === Number(id));
const cambiarEstado = (id, estado, mensaje) =>
    ejecutar(() => api.patch(`/peliculas/admin/${id}/estado`, { estado }), mensaje);

const acciones = {
    aprobar: (id) => cambiarEstado(id, 'aprobada', '🎬 ¡Película aprobada y publicada en el catálogo!'),
    rechazar: (id) =>
        confirmar('¿Rechazar esta propuesta?') && cambiarEstado(id, 'rechazada', 'Propuesta rechazada'),
    'nueva-pelicula': () => abrirPelicula(),
    'editar-pelicula': (id) => abrirPelicula(buscar(datos.peliculas, id)),
    'eliminar-pelicula': (id) =>
        confirmar('¿Eliminar esta película del catálogo? No se puede deshacer.') &&
        ejecutar(() => api.delete(`/peliculas/${id}`), 'Película eliminada'),
    'nueva-categoria': () => abrirCategoria(),
    'editar-categoria': (id) => abrirCategoria(buscar(datos.categorias, id)),
    'eliminar-categoria': (id) =>
        confirmar('¿Eliminar esta categoría?') &&
        ejecutar(() => api.delete(`/categorias/${id}`), 'Categoría eliminada')
};

const iniciar = () => {
    if (!requireAdmin()) {
        $('contenido-admin').innerHTML = estadoVacio(
            '🔒 Acceso restringido: Esta sección es exclusiva para cuentas con rol Administrador. Redirigiendo...'
        );
        setTimeout(() => (location.href = '../index.html'), 1600);
        return;
    }

    const adminUser = getUsuario();
    const banner = document.querySelector('.admin-banner');
    if (banner && adminUser) {
        banner.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                <div>
                    <p class="eyebrow">👑 Centro de Control y Moderación</p>
                    <h2 style="margin:0.2rem 0;">Panel de Administración · Bienvenida, ${escapar(adminUser.nombre)}</h2>
                    <p class="muted">Aprueba propuestas de la comunidad, publica estrenos con póster en vivo y administra categorías.</p>
                </div>
                <span class="rol-badge rol-admin" style="font-size:0.85rem;padding:0.4rem 0.8rem;">🔐 Rol Verificado: ADMIN</span>
            </div>
        `;
    }

    document
        .querySelectorAll('[data-vista]')
        .forEach((b) => b.addEventListener('click', () => mostrarVista(b.dataset.vista)));
    document.addEventListener('click', (e) => {
        const cerrar = e.target.closest('[data-cerrar]');
        if (cerrar) return $(cerrar.dataset.cerrar).close();
        const accion = e.target.closest('[data-accion]');
        if (accion) acciones[accion.dataset.accion]?.(accion.dataset.id);
    });
    $('p-imagen').addEventListener('input', (e) => actualizarPreviewPoster(e.target.value));
    cargarTodo();
};

iniciar();
