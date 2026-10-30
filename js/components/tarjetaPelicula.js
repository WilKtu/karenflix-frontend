import { escapar, raiz } from '../ui.js';

export const tarjetaPelicula = (p) => `
    <article class="tarjeta">
        <div class="poster" style="--h:${(p.id * 47) % 360}" role="img" aria-label="Póster de ${escapar(p.titulo)}">
            <span class="badge">${escapar(p.tipo)}</span>
        </div>
        <div class="tarjeta-cuerpo">
            <h3>${escapar(p.titulo)}</h3>
            <p class="muted">${p.anio} · ${escapar(p.categoria)} · <span class="score">★ ${p.rating_promedio}</span></p>
            <p class="muted">${escapar(p.descripcion)}</p>
            <a class="btn" href="${raiz}pages/detalle.html?id=${p.id}">Ver detalle</a>
        </div>
    </article>`;
