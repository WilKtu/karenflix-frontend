import { api } from '../api.js';
import { requireAdmin, getUsuario, agregarNotificacion } from '../auth.js';
import { toast, loader, escapar, estadoVacio, confirmar } from '../ui.js';
import { montarNavbar } from '../components/navbar.js';

montarNavbar('');

const $ = (id) => document.getElementById(id);
const datos = { categorias: [], peliculas: [], pendientes: [] };
let propuestaSeleccionada = null;

// ---------- Funciones de Utilidad y Búsqueda ----------
const buscar = (lista, id) => lista.find((x) => x.id === Number(id));

const idCategoria = (p) =>
    p.categoria_id ?? datos.categorias.find((c) => c.nombre === p.categoria)?.id ?? '';

// ---------- Plantillas HTML ----------
const boton = (accion, id, texto, clase = '') =>
    `<button class="btn btn-sm ${clase}" type="button" data-accion="${accion}" data-id="${id}">${texto}</button>`;  const fila = (celdas, botones) => `<tr>${celdas.map((c) => `<td>${c}</td>`).join('')}<td class="acciones-fila">${botones}</td></tr>`;  const tabla = (cabeceras, filas, textoVacio) => { if (!filas.length) return estadoVacio(textoVacio); const encabezado = [...cabeceras, 'Acciones'].map((h) => `<th>${h}</th>`).join('');
    return `<div class="tabla-wrap"><table><thead><tr>${encabezado}</tr></thead><tbody>${filas.join('')}</tbody></table></div>`;
};

const celdaTituloConPoster = (p) => {
    const thumb =
        p.imagen_url && String(p.imagen_url).startsWith('http')
            ? `<img src="${escapar(p.imagen_url)}" alt="" class="admin-thumb">`
            : `<span class="admin-thumb-placeholder">KF</span>`;
    return `<div class="celda-pelicula-info">
                ${thumb}
                <div>
                    <strong>${escapar(p.titulo)}</strong>${p.director ? `<div class="muted" style="font-size:0.78rem;">Dir. ${escapar(p.director)}</div>` : ''}
                </div>
            </div>`;
};

const celdasPelicula = (p) => [
    celdaTituloConPoster(p),
    `<span class="badge-tabla">${escapar(p.tipo)}</span>`,
    p.anio,
    escapar(p.categoria)
];

// ---------- Renderizado ----------
const pintar = () => {
    $('stat-pendientes').textContent = datos.pendientes.length;
    $('stat-peliculas').textContent = datos.peliculas.length;
    $('stat-categorias').textContent = datos.categorias.length;

    // Tabla de propuestas pendientes
    $('tabla-pendientes').innerHTML = tabla(
        ['Película propuesta', 'Tipo', 'Año', 'Categoría'],
        datos.pendientes.map((p) =>
            fila(
                celdasPelicula(p),
                boton('abrir-aprobar', p.id, 'Aprobar', 'btn-ok') +
                    boton('rechazar', p.id, 'Rechazar', 'btn-peligro')
            )
        ),
        'No hay propuestas pendientes de moderación en este momento.'
    );

    // Tabla del catálogo principal
    $('tabla-peliculas').innerHTML = tabla(
        ['Título en cartelera', 'Tipo', 'Año', 'Categoría', 'Calificación'],
        datos.peliculas.map((p) =>
            fila(
                [...celdasPelicula(p), `<span class="score">★ ${Number(p.rating_promedio \vert{}\vert{} 0).toFixed(1)}</span>`], boton('editar-pelicula', p.id, 'Editar') + boton('eliminar-pelicula', p.id, 'Eliminar', 'btn-peligro') ) ), 'Aún no hay películas aprobadas en el catálogo.' );  // Tabla de categorías $('tabla-categorias').innerHTML = tabla( ['Nombre de categoría', 'Descripción', 'Títulos'], datos.categorias.map((c) => fila( [ `<strong>${escapar(c.nombre)}</strong>`,
                    escapar(c.descripcion || '—'),
                    `<span class="badge-tabla">${c.total_peliculas ?? 0}</span>`
                ],
                boton('editar-categoria', c.id, 'Editar') +
                    boton('eliminar-categoria', c.id, 'Eliminar', 'btn-peligro')
            )
        ),
        'Aún no hay categorías registradas.'
    );

    // Selector de categorías en formulario de película
    const selectCat = $('p-categoria');
    if (selectCat) {
        selectCat.innerHTML = `
            <option value="" disabled selected>Selecciona una categoría</option>
            ${datos.categorias.map((c) => `<option value="${c.id}">${escapar(c.nombre)}</option>`).join('')}
        `;
    }
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

const mostrarVista = (vista) => {
    document
        .querySelectorAll('[data-vista]')
        .forEach((b) => b.setAttribute('aria-selected', String(b.dataset.vista === vista)));
    document.querySelectorAll('.vista').forEach((s) => (s.hidden = s.id !== `vista-${vista}`));
};

// ---------- HU-17: Previsualización de Póster ----------
const actualizarPreviewPoster = (url) => {
    const img = $('p-poster-preview');
    const ph = $('p-poster-placeholder');
    if (!img || !ph) return;

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

// ---------- Modales ----------
const abrirCategoria = (categoria) => {
    const form = $('form-categoria');
    form.reset();
    form.dataset.id = categoria?.id ?? '';
    $('titulo-dlg-categoria').textContent = categoria ? 'Editar categoría' : 'Nueva categoría';
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
    $('titulo-dlg-pelicula').textContent = pelicula ? 'Editar película' : 'Nueva película en cartelera';
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
        if (form.cuevana_url) form.cuevana_url.value = pelicula.cuevana_url || '';
        form.imagen_url.value = pelicula.imagen_url || '';
        actualizarPreviewPoster(pelicula.imagen_url);
    } else {
        actualizarPreviewPoster('');
    }
    $('dlg-pelicula').showModal();
};

const abrirModalAprobar = (id) => {
    propuestaSeleccionada = buscar(datos.pendientes, id);
    if (!propuestaSeleccionada) return;

    const dlgAprobar = $('dlg-aprobar');
    if (!dlgAprobar) {
        // Fallback en caso de que la vista no tenga el modal implementado en el DOM
        cambiarEstado(id, 'aprobada', 'Película aprobada y publicada en el catálogo');
        return;
    }

    const form = $('form-aprobar');
    form.reset();
    $('error-aprobar').textContent = '';
    $('subtitulo-dlg-aprobar').textContent = `Película: "${propuestaSeleccionada.titulo}"`; if ($('ap-cuevana')) { $('ap-cuevana').value = propuestaSeleccionada.cuevana_url \vert{}\vert{} ''; } dlgAprobar.showModal(); };  const guardar = async (form, ruta, cuerpo, idError, idDialogo) => { const id = form.dataset.id; try { const res = await (id ? api.put(`${ruta}/${id}`, cuerpo) : api.post(ruta, cuerpo)); if (!id && ruta === '/peliculas' && res?.datos?.id && res?.datos?.estado === 'pendiente') { await api.patch(`/peliculas/admin/${res.datos.id}/estado`, { estado: 'aprobada' }).catch(() => {});
        }
        $(idDialogo).close();
        toast(id ? 'Cambios guardados correctamente' : 'Registro creado con éxito');
        await cargarTodo();
    } catch (error) {
        $(idError).textContent = error.message;
    }
};

// ---------- Controladores de Formularios ----------
$('form-categoria')?.addEventListener('submit', (e) => {
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

$('form-pelicula')?.addEventListener('submit', (e) => {
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
            cuevana_url: form.cuevana_url?.value.trim() || null,
            imagen_url: form.imagen_url.value.trim() || null,
            aprobarDirecto: true
        },
        'error-pelicula',
        'dlg-pelicula'
    );
});

$('form-aprobar')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!propuestaSeleccionada) return;

    const cuevanaUrl = $('ap-cuevana')?.value.trim();

    try {
        if (cuevanaUrl) {
            await api.patch(`/peliculas/${propuestaSeleccionada.id}`, { cuevana_url: cuevanaUrl }).catch(() => {}); }  await api.patch(`/peliculas/admin/${propuestaSeleccionada.id}/estado`, { estado: 'aprobada' });

        const usuarioCreadorId = propuestaSeleccionada.creado_por || propuestaSeleccionada.usuario_id;
        if (typeof agregarNotificacion === 'function') {
            agregarNotificacion({
                titulo: '¡Tu propuesta ha sido aprobada!',
                mensaje: `La película "${propuestaSeleccionada.titulo}" ya está publicada en el catálogo.`,
                paraRol: 'usuario',
                paraUsuarioId: usuarioCreadorId || null,
                enlace: `pages/detalle.html?id=${