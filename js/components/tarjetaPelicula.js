import { escapar, raiz } from '../ui.js';

const etiquetaTipo = (tipo) =>
    ({ pelicula: 'Película', serie: 'Serie', anime: 'Anime', documental: 'Documental' }[tipo] ||
    escapar(tipo));

export const tarjetaPelicula = (p) => {
    const tienePoster = p.imagen_url && String(p.imagen_url).startsWith('http');
    const bgStyle = tienePoster
        ? `background-image: linear-gradient(to top, rgba(7,13,25,0.92) 0%, rgba(7,13,25,0.12) 55%, rgba(7,13,25,0.32) 100%), url('${escapar(p.imagen_url)}'); background-size: cover; background-position: center;`
        : `--h:${(p.id * 47) % 360}`;

    return `
    <article class="tarjeta tarjeta-cine">
        <a href="${raiz}pages/detalle.html?id=${p.id}" class="poster-link" aria-label="Ver ficha de ${escapar(p.titulo)}">
            <div class="poster ${tienePoster ? 'poster-real' : ''}" style="${bgStyle}" role="img" aria-label="Póster de ${escapar(p.titulo)}">
                <span class="badge badge-cine">${etiquetaTipo(p.tipo)}</span>
                <span class="badge-score">★ ${Number(p.rating_promedio || 0).toFixed(1)}</span>
                <div class="poster-overlay">
                    <span class="play-icon">▶ Ver ficha</span>
                </div>
            </div>
        </a>
        <div class="tarjeta-cuerpo">
            <h3><a href="${raiz}pages/detalle.html?id=${p.id}">${escapar(p.titulo)}</a></h3>
            <p class="muted meta-linea">${p.anio} · ${escapar(p.categoria)}${p.duracion_minutos ? ` · ${p.duracion_minutos}m` : ''}</p>
            ${p.director ? `<p class="director-linea">Dir. ${escapar(p.director)}</p>` : ''}
            <p class="muted desc-corta">${escapar(p.descripcion)}</p>
            <div class="tarjeta-pie">
                <a class="btn btn-sm btn-cine-card" href="${raiz}pages/detalle.html?id=${p.id}">Ver detalle</a>
            </div>
        </div>
    </article>`;
};
