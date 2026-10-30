import { api } from '../api.js';
import { getToken } from '../auth.js';
import { toast, loader, escapar, estadoVacio } from '../ui.js';
import { montarNavbar } from '../components/navbar.js';
import { montarSelectorNota } from '../components/selectorNota.js';

montarNavbar('catalogo');

const id = new URLSearchParams(location.search).get('id');
const obtenerNota = montarSelectorNota(document.getElementById('selector-nota'));
let pelicula = null;

const htmlResena = (r) => `
    <article class="resena">
        <div class="resena-cabecera">
            <strong>${escapar(r.titulo)}</strong>
            <span class="score">★ ${r.calificacion}/10</span>
        </div>
        <p>${escapar(r.comentario)}</p>
        <p class="muted">Por ${escapar(r.autor)} · ${r.created_at}</p>
        <div class="acciones">
            <button class="btn reaccion" data-id="${r.id}" data-tipo="like" aria-pressed="${r.miReaccion === 'like'}">👍 ${r.likes}</button>
            <button class="btn reaccion" data-id="${r.id}" data-tipo="dislike" aria-pressed="${r.miReaccion === 'dislike'}">👎 ${r.dislikes}</button>
        </div>
    </article>`;

const pintar = () => {
    document.title = `${pelicula.titulo} · KAREN-FLIX`;
    document.getElementById('info').innerHTML = `
        <div class="detalle-grid">
            <div class="poster hero-poster" style="--h:${(pelicula.id * 47) % 360}" role="img" aria-label="Póster de ${escapar(pelicula.titulo)}">${escapar(pelicula.titulo)}</div>
            <div>
                <p class="eyebrow">${escapar(pelicula.tipo)} · ${escapar(pelicula.categoria)}</p>
                <h1>${escapar(pelicula.titulo)}</h1>
                <p class="muted">${pelicula.anio} · <span class="score">★ ${pelicula.rating_promedio}</span> · ${pelicula.resenas.length} reseñas</p>
                <p>${escapar(pelicula.descripcion)}</p>
            </div>
        </div>`;
    document.getElementById('resenas').innerHTML =
        pelicula.resenas.map(htmlResena).join('') || estadoVacio('Aún no hay reseñas, ¡sé la primera!');
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

document.getElementById('resenas').addEventListener('click', async (e) => {
    const boton = e.target.closest('.reaccion');
    if (!boton) return;
    if (!getToken()) return toast('Inicia sesión para votar', 'error');
    try {
        await api.post(`/resenas/${boton.dataset.id}/reaccion`, { tipo: boton.dataset.tipo });
        await cargar();
    } catch (error) {
        toast(error.message, 'error');
    }
});

const comentario = document.getElementById('comentario');
comentario.addEventListener('input', () => {
    document.getElementById('contador').textContent = `${comentario.value.length}/500`;
});

document.getElementById('form-resena').addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('titulo').value.trim();
    const error = document.getElementById('error-resena');
    error.textContent = '';
    if (!getToken()) return toast('Inicia sesión para publicar una reseña', 'error');
    if (!titulo || !comentario.value.trim()) return (error.textContent = 'Escribe un título y tu opinión.');
    if (!obtenerNota()) return (error.textContent = 'Elige una calificación del 1 al 10.');
    try {
        await api.post(`/peliculas/${id}/resenas`, { titulo, comentario: comentario.value.trim(), calificacion: obtenerNota() });
        toast('¡Reseña publicada!');
        e.target.reset();
        await cargar();
    } catch (err) {
        error.textContent = err.message;
        toast(err.message, 'error');
    }
});

if (!id) document.getElementById('info').innerHTML = estadoVacio('Falta el id de la película');
else cargar();
