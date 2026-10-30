import { api } from '../api.js';
import { getToken, getUsuario, esAdmin } from '../auth.js';
import { toast, loader, escapar, estadoVacio, confirmar } from '../ui.js';
import { montarNavbar } from '../components/navbar.js';
import { montarSelectorNota } from '../components/selectorNota.js';

montarNavbar('catalogo');

const id = new URLSearchParams(location.search).get('id');
const contenedorNota = document.getElementById('selector-nota');
let obtenerNota = montarSelectorNota(contenedorNota);
let pelicula = null;

const extraerYoutubeEmbed = (url) => {
    if (!url) return null;
    const match = String(url).match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : null;
};

const seleccionarNotaManual = (valor) => {
    contenedorNota.querySelectorAll('button[data-nota]').forEach((b) => {
        b.setAttribute('aria-pressed', String(Number(b.dataset.nota) === Number(valor)));
    });
};

const puedeModificarResena = (r) => {
    const u = getUsuario();
    if (!u) return false;
    return u.rol === 'admin' || r.usuario_id === u.id || r.autor === u.nombre;
};

const htmlResena = (r) => {
    const esMia = puedeModificarResena(r);
    const controlesCrud = esMia
        ? `<div class="resena-crud">
               <button class="btn btn-sm btn-editar-resena" type="button" data-editar="${r.id}">✏️ Editar</button>
               <button class="btn btn-sm btn-peligro btn-eliminar-resena" type="button" data-eliminar="${r.id}">🗑️ Eliminar</button>
           </div>`
        : '';

    return `
    <article class="resena ${esMia ? 'resena-propia' : ''}">
        <div class="resena-cabecera">
            <div>
                <strong>${escapar(r.titulo)}</strong>
                ${esMia ? `<span class="badge-propia">Tu reseña</span>` : ''}
            </div>
            <span class="score">★ ${r.calificacion}/10</span>
        </div>
        <p class="resena-texto">${escapar(r.comentario)}</p>
        <div class="resena-pie">
            <p class="muted">Por <strong>${escapar(r.autor)}</strong> · ${escapar(r.created_at)}</p>
            <div class="acciones-resena">
                <button class="btn btn-sm reaccion" data-id="${r.id}" data-tipo="like" aria-pressed="${r.miReaccion === 'like'}">👍 ${r.likes}</button>
                <button class="btn btn-sm reaccion" data-id="${r.id}" data-tipo="dislike" aria-pressed="${r.miReaccion === 'dislike'}">👎 ${r.dislikes}</button>
                ${controlesCrud}
            </div>
        </div>
    </article>`;
};

const configurarEstadoFormularioResena = () => {
    const token = getToken();
    const usuario = getUsuario();
    const bloqueLogin = document.getElementById('bloque-login-resena');
    const formResena = document.getElementById('form-resena');

    const retorno = encodeURIComponent(`pages/detalle.html?id=${id}`);
    document.getElementById('link-login-retorno').href = `login.html?redirect=${retorno}`;
    document.getElementById('link-registro-retorno').href = `login.html?modo=registro&redirect=${retorno}`;

    if (!token || !usuario) {
        bloqueLogin.hidden = false;
        formResena.hidden = true;
    } else {
        bloqueLogin.hidden = true;
        formResena.hidden = false;
        document.getElementById('autor-form-resena').textContent = `Publicando como ${usuario.nombre} (${
            esAdmin() ? 'Administrador' : 'Miembro'
        })`;
    }
};

const pintar = () => {
    document.title = `${pelicula.titulo} · KAREN-FLIX`;
    const tienePoster = pelicula.imagen_url && String(pelicula.imagen_url).startsWith('http');
    const posterStyle = tienePoster
        ? `background-image: url('${escapar(pelicula.imagen_url)}'); background-size: cover; background-position: center;`
        : `--h:${(pelicula.id * 47) % 360}`;

    const actoresLista = Array.isArray(pelicula.actores)
        ? pelicula.actores.map((a) => (typeof a === 'object' ? a.nombre : a))
        : [];

    const embedUrl = extraerYoutubeEmbed(pelicula.trailer_url);
    const bloqueTrailer = embedUrl
        ? `<div class="trailer-seccion" id="contenedor-trailer">
               <div class="trailer-cabecera">
                   <h3>🎞️ Tráiler Oficial</h3>
                   <button class="btn btn-sm" id="btn-modo-cine" type="button">💡 Modo Sala de Cine (Apagar luces)</button>
               </div>
               <div class="trailer-marco">
                   <iframe src="${embedUrl}" title="Tráiler de ${escapar(pelicula.titulo)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
               </div>
           </div>`
        : '';

    document.getElementById('info').innerHTML = `
        <div class="detalle-grid">
            <div class="poster hero-poster ${tienePoster ? 'poster-real-detalle' : ''}" style="${posterStyle}" role="img" aria-label="Póster de ${escapar(pelicula.titulo)}">
                ${!tienePoster ? escapar(pelicula.titulo) : ''}
            </div>
            <div class="detalle-info-col">
                <div class="hero-badges">
                    <span class="eyebrow badge-estreno">${escapar(pelicula.tipo)} · ${escapar(pelicula.categoria)}</span>
                    <span class="score-pill">★ ${Number(pelicula.rating_promedio || 0).toFixed(1)} / 10 (${pelicula.resenas.length} reseñas)</span>
                </div>
                <h1 class="titulo-cine-detalle">${escapar(pelicula.titulo)}</h1>
                <p class="hero-meta">
                    📅 Año: <strong>${pelicula.anio}</strong>
                    ${pelicula.duracion_minutos ? ` · ⏱️ Duración: <strong>${pelicula.duracion_minutos} min</strong>` : ''}
                    ${pelicula.director ? ` · 🎥 Director: <strong>${escapar(pelicula.director)}</strong>` : ''}
                </p>
                <p class="detalle-sinopsis">${escapar(pelicula.descripcion)}</p>
                ${
                    actoresLista.length
                        ? `<div class="reparto-box">
                               <span class="muted">🎭 Reparto principal:</span>
                               <div class="hero-chips">${actoresLista
                                   .map((a) => `<span class="actor-chip">${escapar(a)}</span>`)
                                   .join('')}</div>
                           </div>`
                        : ''
                }
                ${bloqueTrailer}
            </div>
        </div>`;

    document.getElementById('btn-modo-cine')?.addEventListener('click', () => {
        const cortina = document.getElementById('cortina-cine');
        const activo = !cortina.hidden;
        cortina.hidden = activo;
        document.body.classList.toggle('sala-cine-activa', !activo);
        document.getElementById('btn-modo-cine').textContent = !activo
            ? '☀️ Encender luces de sala'
            : '💡 Modo Sala de Cine (Apagar luces)';
    });

    document.getElementById('cortina-cine')?.addEventListener('click', () => {
        document.getElementById('cortina-cine').hidden = true;
        document.body.classList.remove('sala-cine-activa');
        const btn = document.getElementById('btn-modo-cine');
        if (btn) btn.textContent = '💡 Modo Sala de Cine (Apagar luces)';
    });

    configurarEstadoFormularioResena();

    document.getElementById('resenas').innerHTML =
        pelicula.resenas.map(htmlResena).join('') ||
        estadoVacio('Aún no hay reseñas para esta producción. ¡Sé la primera persona en compartir tu crítica!');
};

const cargar = async () => {
    loader(true);
    try {
        pelicula = (await api.get(`/peliculas/${id}`)).datos;
        pintar();
    } catch (error) {
        document.getElementById('info').innerHTML = estadoVacio(error.message);
        toast(error.message, 'error');
    } finally {
        loader(false);
    }
};

const cancelarEdicion = () => {
    const form = document.getElementById('form-resena');
    form.reset();
    document.getElementById('resena-edit-id').value = '';
    document.getElementById('titulo-form-resena').textContent = '✍️ Escribe tu reseña';
    document.getElementById('btn-submit-resena').textContent = 'Publicar reseña';
    document.getElementById('btn-cancelar-edicion').hidden = true;
    document.getElementById('contador').textContent = '0/500';
    document.getElementById('error-resena').textContent = '';
    obtenerNota = montarSelectorNota(contenedorNota);
};

document.getElementById('btn-cancelar-edicion')?.addEventListener('click', cancelarEdicion);

document.getElementById('resenas').addEventListener('click', async (e) => {
    // 1. Reacción Like / Dislike
    const botonReaccion = e.target.closest('.reaccion');
    if (botonReaccion) {
        if (!getToken()) {
            toast('Para votar una reseña, inicia sesión primero', 'error');
            document.getElementById('bloque-login-resena')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        try {
            await api.post(`/resenas/${botonReaccion.dataset.id}/reaccion`, {
                tipo: botonReaccion.dataset.tipo
            });
            await cargar();
        } catch (error) {
            toast(error.message, 'error');
        }
        return;
    }

    // 2. Editar propia reseña
    const botonEditar = e.target.closest('[data-editar]');
    if (botonEditar) {
        const resenaId = Number(botonEditar.dataset.editar);
        const r = pelicula.resenas.find((x) => x.id === resenaId);
        if (!r) return;

        document.getElementById('resena-edit-id').value = r.id;
        document.getElementById('titulo').value = r.titulo;
        document.getElementById('comentario').value = r.comentario;
        document.getElementById('contador').textContent = `${r.comentario.length}/500`;
        seleccionarNotaManual(r.calificacion);
        obtenerNota = () => {
            const btnActivo = contenedorNota.querySelector('button[aria-pressed="true"]');
            return btnActivo ? Number(btnActivo.dataset.nota) : r.calificacion;
        };

        document.getElementById('titulo-form-resena').textContent = '✏️ Editando tu reseña';
        document.getElementById('btn-submit-resena').textContent = 'Guardar cambios en reseña';
        document.getElementById('btn-cancelar-edicion').hidden = false;
        document.getElementById('form-resena').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // 3. Eliminar propia reseña
    const botonEliminar = e.target.closest('[data-eliminar]');
    if (botonEliminar) {
        const resenaId = Number(botonEliminar.dataset.eliminar);
        if (!confirmar('¿Deseas eliminar tu reseña de forma permanente?')) return;
        try {
            await api.delete(`/resenas/${resenaId}`);
            toast('Reseña eliminada correctamente');
            cancelarEdicion();
            await cargar();
        } catch (error) {
            toast(error.message, 'error');
        }
    }
});

const comentario = document.getElementById('comentario');
comentario.addEventListener('input', () => {
    document.getElementById('contador').textContent = `${comentario.value.length}/500`;
});

document.getElementById('form-resena').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('resena-edit-id').value;
    const titulo = document.getElementById('titulo').value.trim();
    const texto = comentario.value.trim();
    const error = document.getElementById('error-resena');
    error.textContent = '';

    if (!getToken()) {
        toast('Inicia sesión para publicar una reseña', 'error');
        return;
    }
    if (titulo.length < 3) {
        return (error.textContent = 'El título de la reseña debe tener al menos 3 caracteres.');
    }
    if (texto.length < 5) {
        return (error.textContent = 'Escribe una opinión de al menos 5 caracteres.');
    }

    const btnActivo = contenedorNota.querySelector('button[aria-pressed="true"]');
    const calificacion = btnActivo ? Number(btnActivo.dataset.nota) : obtenerNota();
    if (!calificacion) {
        return (error.textContent = 'Selecciona una calificación del 1 al 10.');
    }

    try {
        if (editId) {
            await api.put(`/resenas/${editId}`, { titulo, comentario: texto, calificacion });
            toast('✨ ¡Tu reseña fue actualizada!');
        } else {
            await api.post(`/peliculas/${id}/resenas`, { titulo, comentario: texto, calificacion });
            toast('🍿 ¡Reseña publicada con éxito!');
        }
        cancelarEdicion();
        await cargar();
    } catch (err) {
        error.textContent = err.message;
        toast(err.message, 'error');
    }
});

if (!id) document.getElementById('info').innerHTML = estadoVacio('Falta el id de la película');
else cargar();
