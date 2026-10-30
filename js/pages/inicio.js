import { api } from '../api.js';
import { getUsuario, esAdmin } from '../auth.js';
import { toast, loader, escapar, raiz, estadoVacio } from '../ui.js';
import { tarjetaPelicula } from '../components/tarjetaPelicula.js';
import { montarNavbar } from '../components/navbar.js';

montarNavbar('inicio');

const pintarHero = (p) => {
    const actoresHtml =
        Array.isArray(p.actores) && p.actores.length
            ? `<div class="hero-chips">${p.actores
                  .slice(0, 4)
                  .map((a) => `<span class="actor-chip">${escapar(typeof a === 'object' ? a.nombre : a)}</span>`)
                  .join('')}</div>`
            : '';

    document.getElementById('hero-contenido').innerHTML = `
        <div class="hero-badges">
            <span class="eyebrow badge-estreno">Recomendación de la semana</span>
            <span class="score-pill">★ ${Number(p.rating_promedio || 0).toFixed(1)} / 10</span>
        </div>
        <h1 class="titulo-cine-hero">${escapar(p.titulo)}</h1>
        <p class="hero-meta">${p.anio} · ${escapar(p.categoria)}${p.duracion_minutos ? ` · ${p.duracion_minutos} min` : ''}${p.director ? ` · Dir. ${escapar(p.director)}` : ''}</p>
        <p class="muted hero-sinopsis">${escapar(p.descripcion)}</p>
        ${actoresHtml}
        <div class="acciones">
            <a class="btn btn-primario" href="${raiz}pages/detalle.html?id=${p.id}">Ver detalle y tráiler</a>
            <a class="btn" href="${raiz}pages/catalogo.html">Explorar catálogo</a>
        </div>`;

    const poster = document.getElementById('hero-poster');
    if (p.imagen_url && String(p.imagen_url).startsWith('http')) {
        poster.style.backgroundImage = `linear-gradient(to top, rgba(7,13,25,0.88) 0%, transparent 45%), url('${p.imagen_url}')`;
        poster.style.backgroundSize = 'cover';
        poster.style.backgroundPosition = 'center';
        poster.innerHTML = `<span class="hero-poster-caption">${escapar(p.titulo)} (${p.anio})</span>`;
    } else {
        poster.style.setProperty('--h', (p.id * 47) % 360);
        poster.textContent = p.titulo;
    }
};

const pintarCarruseles = (lista) => {
    const grupos = {};
    lista.forEach((p) => {
        const cat = p.categoria || 'General';
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(p);
    });
    document.getElementById('categorias').innerHTML = Object.entries(grupos)
        .map(
            ([nombre, items]) => `
        <section class="seccion">
            <div class="cabecera-fila">
                <h2 class="titulo-seccion">${escapar(nombre)}</h2>
                <a class="btn-link" href="${raiz}pages/catalogo.html?categoria=${encodeURIComponent(nombre)}">Ver todo →</a>
            </div>
            <div class="carrusel">${items.map(tarjetaPelicula).join('')}</div>
        </section>`
        )
        .join('');
};

const actualizarBannerComunidad = () => {
    const usuario = getUsuario();
    const secciones = document.querySelectorAll('main > section.seccion.contenedor');
    const ultimaSeccion = secciones[secciones.length - 1];
    if (!ultimaSeccion || !usuario) return;

    const caja = ultimaSeccion.querySelector('.caja');
    if (!caja) return;

    caja.innerHTML = `
        <p class="eyebrow">${esAdmin() ? 'Modo Administrador' : 'Sesión activa'}</p>
        <h2 class="titulo-seccion">Hola, ${escapar(usuario.nombre)}</h2>
        <p class="muted">${
            esAdmin()
                ? 'Puedes moderar propuestas pendientes, publicar títulos en cartelera y gestionar las categorías.'
                : '¿Conoces una película o serie que falte en KAREN-FLIX? Propón nuevos títulos o reseña tus favoritos.'
        }</p>
        <div class="acciones">
            ${
                esAdmin()
                    ? `<a class="btn btn-primario" href="${raiz}pages/admin.html">Ir al Panel de Administración</a>
                       <button class="btn" type="button" onclick="document.getElementById('btn-abrir-perfil')?.click()">Editar mi perfil</button>`
                    : `<button class="btn btn-primario" type="button" onclick="document.getElementById('btn-proponer-global')?.click()">+ Proponer título</button>
                       <button class="btn" type="button" onclick="document.getElementById('btn-abrir-perfil')?.click()">Editar mi perfil</button>`
            }
        </div>
    `;
};

const cargar = async () => {
    loader(true);
    actualizarBannerComunidad();
    try {
        const { datos: ranking } = await api.get('/peliculas?orden=ranking&limit=10');
        const { datos: populares } = await api.get('/peliculas?orden=popularidad&limit=4');
        if (!ranking.length) return;
        pintarHero(ranking[0]);
        document.getElementById('populares-lista').innerHTML = populares.map(tarjetaPelicula).join('');
        document.getElementById('top10').innerHTML =
            ranking
                .map(
                    (p, i) =>
                        `<div class="top-card-wrap"><span class="top-numero">#${i + 1}</span>${tarjetaPelicula(p)}</div>`
                )
                .join('') || estadoVacio('Sin datos');
        pintarCarruseles(ranking);
    } catch (error) {
        toast(error.message, 'error');
    } finally {
        loader(false);
    }
};

document.querySelectorAll('[data-scroll]').forEach((b) =>
    b.addEventListener('click', () =>
        document.getElementById('top10').scrollBy({ left: Number(b.dataset.scroll) * 460, behavior: 'smooth' })
    )
);

cargar();
