import { api } from '../api.js';
import { toast, loader, escapar, raiz, estadoVacio } from '../ui.js';
import { tarjetaPelicula } from '../components/tarjetaPelicula.js';
import { montarNavbar } from '../components/navbar.js';

montarNavbar('inicio');

const pintarHero = (p) => {
    document.getElementById('hero-contenido').innerHTML = `
        <p class="eyebrow">Recomendación de la semana</p>
        <h1>${escapar(p.titulo)}</h1>
        <p class="muted">${escapar(p.descripcion)}</p>
        <div class="acciones">
            <a class="btn btn-primario" href="${raiz}pages/detalle.html?id=${p.id}">Ver detalle</a>
            <a class="btn" href="${raiz}pages/catalogo.html">Explorar catálogo</a>
        </div>`;
    const poster = document.getElementById('hero-poster');
    poster.style.setProperty('--h', (p.id * 47) % 360);
    poster.textContent = p.titulo;
};

const pintarCarruseles = (lista) => {
    const grupos = Object.groupBy(lista, (p) => p.categoria);
    document.getElementById('categorias').innerHTML = Object.entries(grupos).map(([nombre, items]) => `
        <section class="seccion">
            <h2 class="titulo-seccion">${escapar(nombre)}</h2>
            <div class="carrusel">${items.map(tarjetaPelicula).join('')}</div>
        </section>`).join('');
};

const cargar = async () => {
    loader(true);
    try {
        const { datos: ranking } = await api.get('/peliculas?orden=ranking&limit=10');
        const { datos: populares } = await api.get('/peliculas?orden=popularidad&limit=4');
        if (!ranking.length) return;
        pintarHero(ranking[0]);
        document.getElementById('populares-lista').innerHTML = populares.map(tarjetaPelicula).join('');
        document.getElementById('top10').innerHTML = ranking.map((p, i) =>
            `<div><span class="top-numero">#${i + 1}</span>${tarjetaPelicula(p)}</div>`).join('') || estadoVacio('Sin datos');
        pintarCarruseles(ranking);
    } catch (error) {
        toast(error.message, 'error');
    } finally {
        loader(false);
    }
};

document.querySelectorAll('[data-scroll]').forEach((b) => b.addEventListener('click', () =>
    document.getElementById('top10').scrollBy({ left: Number(b.dataset.scroll) * 460, behavior: 'smooth' })));

cargar();
