import {
    getUsuario,
    getToken,
    cerrarSesion,
    esAdmin,
    actualizarUsuarioSesion,
    getNotificaciones,
    marcarNotificacionesLeidas,
    toggleFavorito
} from '../auth.js';
import { api } from '../api.js';
import { raiz, aplicarTema, alternarTema, escapar, toast } from '../ui.js';

const enlaces = (activa) =>
    [
        ['inicio', 'Inicio', `${raiz}index.html`],
        ['populares', 'Populares', `${raiz}index.html#populares`],
        ['catalogo', 'Catálogo', `${raiz}pages/catalogo.html`],
        ['favoritos', 'Favoritos', `${raiz}pages/catalogo.html?favoritos=1`]
    ]
        .map(
            ([id, texto, href]) =>
                `<a href="${href}" class="${id === activa ? 'activo' : ''}" ${
                    id === activa ? 'aria-current="page"' : ''
                }>${texto}</a>`
        )
        .join('');

const renderizarNotificaciones = () => {
    const lista = getNotificaciones();
    if (!lista.length) {
        return `<p class="muted notif-vacio">No tienes notificaciones nuevas.</p>`;
    }
    return lista
        .map(
            (n) => `
        <div class="notif-item ${n.leida ? 'leida' : 'no-leida'}" data-enlace="${
                n.enlace ? raiz + n.enlace : ''
            }">
            <div class="notif-punto"></div>
            <div class="notif-texto">
                <strong>${escapar(n.titulo)}</strong>
                <p>${escapar(n.mensaje)}</p>
                <span class="notif-fecha">${escapar(n.fecha)}</span>
            </div>
        </div>`
        )
        .join('');
};

const iconoCampanaSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;

const botonesSesion = () => {
    const usuario = getUsuario();
    if (!usuario) {
        return `<a class="btn btn-texto" href="${raiz}pages/login.html">Iniciar sesión</a>
                <a class="btn btn-primario" href="${raiz}pages/login.html?modo=registro">Registrarse</a>`;
    }

    const notifs = getNotificaciones();
    const sinLeer = notifs.filter((n) => !n.leida).length;

    const btnAccion = esAdmin()
        ? `<a class="btn btn-sm btn-admin-nav" href="${raiz}pages/admin.html">Administración</a>`
        : `<button class="btn btn-sm btn-proponer-nav" id="btn-proponer-global" type="button" title="Sugerir una película o serie">+ Proponer título</button>`;

    return `
        ${btnAccion}
        <div class="notif-contenedor">
            <button class="btn btn-icono notif-btn" id="btn-notificaciones" type="button" aria-label="Notificaciones" title="Notificaciones">
                ${iconoCampanaSvg}
                ${sinLeer > 0 ? `<span class="notif-contador" id="notif-contador">${sinLeer}</span>` : ''}
            </button>
            <div class="notif-dropdown" id="notif-dropdown" hidden>
                <div class="notif-cabecera">
                    <strong>Notificaciones</strong>
                    <button class="btn-link" id="btn-leer-notifs" type="button">Marcar leídas</button>
                </div>
                <div class="notif-lista" id="notif-lista">
                    ${renderizarNotificaciones()}
                </div>
            </div>
        </div>
        <button class="btn btn-perfil" id="btn-abrir-perfil" type="button" title="Editar mi perfil">
            <span class="avatar-mini">${escapar(usuario.nombre.charAt(0).toUpperCase())}</span>
            <span class="perfil-nombre">${escapar(usuario.nombre.split(' ')[0])}</span>
        </button>
        <button class="btn btn-sm btn-salir-icono" id="btn-salir" type="button" title="Cerrar sesión">Salir</button>
    `;
};

const inyectarModalesGlobales = () => {
    const usuario = getUsuario();
    if (!usuario || document.getElementById('dlg-perfil-global')) return;

    const contenedor = document.createElement('div');
    contenedor.innerHTML = `
        <!-- Modal de Editar Perfil de Usuario -->
        <dialog id="dlg-perfil-global" class="modal-cine" aria-labelledby="titulo-dlg-perfil">
            <form id="form-perfil-global" novalidate>
                <div class="modal-cabecera-cine">
                    <div>
                        <p class="eyebrow">Mi cuenta</p>
                        <h2 id="titulo-dlg-perfil">Editar perfil</h2>
                    </div>
                </div>

                <div class="campo">
                    <label for="perf-nombre">Nombre completo *</label>
                    <input id="perf-nombre" name="nombre" value="${escapar(usuario.nombre || '')}" maxlength="80" required>
                </div>

                <div class="campo">
                    <label for="perf-email">Correo electrónico *</label>
                    <input id="perf-email" name="email" type="email" value="${escapar(usuario.email || '')}" required>
                </div>

                <div class="grid-form-2">
                    <div class="campo">
                        <label for="perf-genero">Género favorito</label>
                        <select id="perf-genero" name="genero_favorito">
                            <option value="Ciencia ficción" ${usuario.genero_favorito === 'Ciencia ficción' ? 'selected' : ''}>Ciencia ficción</option>
                            <option value="Acción" ${usuario.genero_favorito === 'Acción' ? 'selected' : ''}>Acción</option>
                            <option value="Drama" ${usuario.genero_favorito === 'Drama' ? 'selected' : ''}>Drama</option>
                            <option value="Anime" ${usuario.genero_favorito === 'Anime' ? 'selected' : ''}>Anime</option>
                            <option value="Suspenso" ${usuario.genero_favorito === 'Suspenso' ? 'selected' : ''}>Suspenso</option>
                            <option value="Documental" ${usuario.genero_favorito === 'Documental' ? 'selected' : ''}>Documental</option>
                        </select>
                    </div>
                    <div class="campo">
                        <label for="perf-pass">Nueva contraseña (opcional)</label>
                        <input id="perf-pass" name="nuevaPassword" type="password" placeholder="Mínimo 8 caracteres">
                    </div>
                </div>

                <div class="campo">
                    <label for="perf-bio">Biografía corta</label>
                    <textarea id="perf-bio" name="bio" rows="2" maxlength="180" placeholder="Cuéntanos qué tipo de películas te gustan...">${escapar(usuario.bio || '')}</textarea>
                </div>

                <p class="error-campo" id="error-perfil-global" role="alert"></p>
                <div class="acciones">
                    <button class="btn btn-primario" type="submit">Guardar cambios</button>
                    <button class="btn" type="button" id="btn-cerrar-perfil">Cancelar</button>
                </div>
            </form>
        </dialog>

        <!-- Modal Global para Proponer Película (Usuario Estándar) -->
        <dialog id="dlg-proponer-global" class="modal-cine" aria-labelledby="titulo-dlg-proponer">
            <form id="form-proponer-global" novalidate>
                <div class="modal-cabecera-cine">
                    <div>
                        <p class="eyebrow">Catálogo colaborativo</p>
                        <h2 id="titulo-dlg-proponer">Proponer película o serie</h2>
                    </div>
                </div>
                <p class="muted" style="margin-bottom:1rem;font-size:0.85rem;">
                    Tu propuesta será enviada con estado "Pendiente" para revisión del administrador.
                </p>

                <div class="campo">
                    <label for="prop-titulo">Título de la producción *</label>
                    <input id="prop-titulo" name="titulo" maxlength="120" placeholder="Ej: Dune: Parte Dos" required>
                </div>

                <div class="campo">
                    <label for="prop-desc">Sinopsis / Descripción *</label>
                    <textarea id="prop-desc" name="descripcion" rows="2" placeholder="Describe brevemente la trama..." required></textarea>
                </div>

                <div class="grid-form-2">
                    <div class="campo">
                        <label for="prop-tipo">Tipo</label>
                        <select id="prop-tipo" name="tipo">
                            <option value="pelicula">Película</option>
                            <option value="serie">Serie</option>
                            <option value="anime">Anime</option>
                            <option value="documental">Documental</option>
                        </select>
                    </div>
                    <div class="campo">
                        <label for="prop-anio">Año de estreno *</label>
                        <input id="prop-anio" name="anio" type="number" min="1900" max="2100" value="2025" required>
                    </div>
                </div>

                <div class="grid-form-2">
                    <div class="campo">
                        <label for="prop-duracion">Duración (min)</label>
                        <input id="prop-duracion" name="duracion_minutos" type="number" min="1" max="600" placeholder="120">
                    </div>
                    <div class="campo">
                        <label for="prop-categoria">Categoría *</label>
                        <select id="prop-categoria" name="categoria_id" required></select>
                    </div>
                </div>

                <div class="grid-form-2">
                    <div class="campo">
                        <label for="prop-director">Director</label>
                        <input id="prop-director" name="director" placeholder="Ej: Denis Villeneuve">
                    </div>
                    <div class="campo">
                        <label for="prop-actores">Reparto (separado por comas)</label>
                        <input id="prop-actores" name="actores" placeholder="Actor 1, Actor 2">
                    </div>
                </div>

                <div class="campo">
                    <label for="prop-trailer">URL del Tráiler (YouTube)</label>
                    <input id="prop-trailer" name="trailer_url" type="url" placeholder="https://www.youtube.com/watch?v=...">
                </div>

                <div class="campo">
                    <label for="prop-imagen">URL del Póster (Imagen) *</label>
                    <input id="prop-imagen" name="imagen_url" type="url" placeholder="https://images.unsplash.com/..." required>
                </div>

                <div class="poster-preview-wrap">
                    <span class="preview-label">Previsualización del póster:</span>
                    <div class="poster-preview-box">
                        <img id="prop-poster-preview" src="" alt="Vista previa" class="poster-preview-img" hidden>
                        <p id="prop-poster-placeholder" class="poster-placeholder">Pega un enlace de imagen para previsualizar</p>
                    </div>
                </div>

                <p class="error-campo" id="error-proponer-global" role="alert"></p>
                <div class="acciones">
                    <button class="btn btn-primario" type="submit">Enviar propuesta</button>
                    <button class="btn" type="button" id="btn-cerrar-proponer">Cancelar</button>
                </div>
            </form>
        </dialog>
    `;
    document.body.appendChild(contenedor);

    // Eventos del modal de Perfil
    const dlgPerfil = document.getElementById('dlg-perfil-global');
    document.getElementById('btn-cerrar-perfil').addEventListener('click', () => dlgPerfil.close());
    document.getElementById('form-perfil-global').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const errEl = document.getElementById('error-perfil-global');
        errEl.textContent = '';

        const nombre = form.nombre.value.trim();
        const email = form.email.value.trim();
        const nuevaPassword = form.nuevaPassword.value;

        if (nombre.length < 2) return (errEl.textContent = 'El nombre debe tener mínimo 2 caracteres.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return (errEl.textContent = 'Ingresa un correo válido.');
        if (nuevaPassword && nuevaPassword.length < 8) {
            return (errEl.textContent = 'La nueva contraseña debe tener al menos 8 caracteres.');
        }

        try {
            const { datos } = await api.put('/auth/perfil', {
                nombre,
                email,
                bio: form.bio.value.trim(),
                genero_favorito: form.genero_favorito.value,
                nuevaPassword: nuevaPassword || undefined
            });
            actualizarUsuarioSesion(datos);
            dlgPerfil.close();
            toast('Perfil actualizado correctamente');
            montarNavbar('');
        } catch (err) {
            errEl.textContent = err.message;
        }
    });

    // Eventos del modal de Proponer Película
    const dlgProp = document.getElementById('dlg-proponer-global');
    const imgPrev = document.getElementById('prop-poster-preview');
    const phPrev = document.getElementById('prop-poster-placeholder');

    document.getElementById('prop-imagen').addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (!url.startsWith('http')) {
            imgPrev.hidden = true;
            phPrev.hidden = false;
            phPrev.textContent = 'Pega un enlace de imagen válido (http/https)';
            return;
        }
        imgPrev.src = url;
        imgPrev.onload = () => {
            imgPrev.hidden = false;
            phPrev.hidden = true;
        };
        imgPrev.onerror = () => {
            imgPrev.hidden = true;
            phPrev.hidden = false;
            phPrev.textContent = 'No se pudo cargar la imagen. Verifica la URL.';
        };
    });

    document.getElementById('btn-cerrar-proponer').addEventListener('click', () => dlgProp.close());
    document.getElementById('form-proponer-global').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const errEl = document.getElementById('error-proponer-global');
        errEl.textContent = '';

        const titulo = form.titulo.value.trim();
        const descripcion = form.descripcion.value.trim();
        const anio = Number(form.anio.value);

        if (titulo.length < 2) return (errEl.textContent = 'Escribe un título válido.');
        if (descripcion.length < 10) return (errEl.textContent = 'Escribe una sinopsis de al menos 10 caracteres.');
        if (!anio || anio < 1900 || anio > 2100) return (errEl.textContent = 'Ingresa un año válido (1900-2100).');

        const actores = form.actores.value
            .split(',')
            .map((a) => a.trim())
            .filter(Boolean);

        try {
            await api.post('/peliculas', {
                titulo,
                descripcion,
                tipo: form.tipo.value,
                anio,
                duracion_minutos: form.duracion_minutos.value ? Number(form.duracion_minutos.value) : 120,
                categoria_id: Number(form.categoria_id.value),
                director: form.director.value.trim() || 'Director Invitado',
                actores,
                trailer_url: form.trailer_url.value.trim() || null,
                imagen_url: form.imagen_url.value.trim() || null
            });
            dlgProp.close();
            form.reset();
            imgPrev.hidden = true;
            phPrev.hidden = false;
            toast('Propuesta enviada para revisión del administrador');
            setTimeout(() => location.reload(), 900);
        } catch (err) {
            errEl.textContent = err.message;
        }
    });
};

// Delegación global para botones de Favoritos (♥ / ♡)
if (!window.__karenflixFavListener) {
    window.__karenflixFavListener = true;
    document.addEventListener('click', (e) => {
        const btnFav = e.target.closest('[data-fav-id]');
        if (!btnFav) return;
        e.preventDefault();
        if (!getToken()) {
            toast('Inicia sesión para guardar películas en tus Favoritos', 'error');
            setTimeout(() => (location.href = `${raiz}pages/login.html`), 700);
            return;
        }
        const idPeli = Number(btnFav.dataset.favId);
        const agregado = toggleFavorito(idPeli);
        document.querySelectorAll(`[data-fav-id="${idPeli}"]`).forEach((b) => {
            b.classList.toggle('fav-activo', agregado);
            b.setAttribute('aria-pressed', String(agregado));
            if (b.dataset.favTexto === 'completo') {
                b.textContent = agregado ? '♥ En mis favoritos' : '♡ Agregar a favoritos';
            } else {
                b.textContent = agregado ? '♥' : '♡';
            }
        });
        toast(agregado ? 'Agregada a tus Favoritos' : 'Quitada de tus Favoritos');
        window.dispatchEvent(new CustomEvent('favoritos-actualizados'));
    });
}

export const montarNavbar = (activa) => {
    aplicarTema();
    const navEl = document.getElementById('navbar');
    if (!navEl) return;

    navEl.innerHTML = `
        <div class="cinta-cine" aria-hidden="true"></div>
        <div class="navbar"><div class="contenedor navbar-fila">
            <button class="btn btn-icono" id="btn-menu" type="button" aria-label="Abrir menú" aria-expanded="false">☰</button>
            <a class="logo" href="${raiz}index.html">KAREN<span>-FLIX</span></a>
            <nav class="nav-links" aria-label="Principal">${enlaces(activa)}</nav>
            <form class="buscador" id="form-buscar" role="search">
                <input type="search" id="buscar" placeholder="Buscar títulos..." aria-label="Buscar títulos">
                <button class="btn" type="submit">Buscar</button>
            </form>
            <div class="nav-acciones">
                <button class="btn btn-icono" id="btn-tema" type="button" title="Cambiar tema claro/oscuro" aria-label="Cambiar entre tema claro y oscuro">◐</button>
                ${botonesSesion()}
            </div>
        </div></div>
        <aside class="panel" aria-label="Menú lateral">${enlaces(activa)}</aside>
        <div class="fondo-panel" id="fondo-panel"></div>`;

    inyectarModalesGlobales();

    const cuerpo = document.body;
    const boton = document.getElementById('btn-menu');
    const alternar = (abierto) => {
        cuerpo.classList.toggle('menu-abierto', abierto);
        boton.setAttribute('aria-expanded', String(abierto));
    };

    boton.addEventListener('click', () => alternar(!cuerpo.classList.contains('menu-abierto')));
    document.getElementById('fondo-panel').addEventListener('click', () => alternar(false));
    document.querySelectorAll('.panel a').forEach((a) => a.addEventListener('click', () => alternar(false)));
    document.addEventListener('keydown', (e) => e.key === 'Escape' && alternar(false));
    document.getElementById('btn-tema').addEventListener('click', alternarTema);

    document.getElementById('form-buscar').addEventListener('submit', (e) => {
        e.preventDefault();
        const q = document.getElementById('buscar').value.trim();
        location.href = `${raiz}pages/catalogo.html${q ? `?q=${encodeURIComponent(q)}` : ''}`;
    });

    // Evento de Notificaciones
    const btnNotif = document.getElementById('btn-notificaciones');
    const dropNotif = document.getElementById('notif-dropdown');
    if (btnNotif && dropNotif) {
        btnNotif.addEventListener('click', (e) => {
            e.stopPropagation();
            dropNotif.hidden = !dropNotif.hidden;
        });
        document.getElementById('btn-leer-notifs')?.addEventListener('click', (e) => {
            e.stopPropagation();
            marcarNotificacionesLeidas();
            document.getElementById('notif-contador')?.remove();
            document.getElementById('notif-lista').innerHTML = renderizarNotificaciones();
            toast('Notificaciones marcadas como leídas');
        });
        document.getElementById('notif-lista')?.addEventListener('click', (e) => {
            const item = e.target.closest('.notif-item');
            if (item?.dataset.enlace) {
                marcarNotificacionesLeidas();
                location.href = item.dataset.enlace;
            }
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notif-contenedor')) dropNotif.hidden = true;
        });
    }

    // Evento de Abrir Perfil
    document.getElementById('btn-abrir-perfil')?.addEventListener('click', () => {
        document.getElementById('dlg-perfil-global')?.showModal();
    });

    // Evento de Abrir Modal de Proponer Película
    document.getElementById('btn-proponer-global')?.addEventListener('click', async () => {
        const selectCat = document.getElementById('prop-categoria');
        if (selectCat && !selectCat.options.length) {
            try {
                const { datos: cats } = await api.get('/categorias');
                selectCat.innerHTML = cats
                    .map((c) => `<option value="${c.id}">${escapar(c.nombre)}</option>`)
                    .join('');
            } catch {
                selectCat.innerHTML = '<option value="1">Ciencia ficción</option>';
            }
        }
        document.getElementById('dlg-proponer-global')?.showModal();
    });

    // Evento de Cerrar Sesión
    document.getElementById('btn-salir')?.addEventListener('click', () => {
        cerrarSesion();
        toast('Sesión cerrada correctamente');
        setTimeout(() => (location.href = `${raiz}index.html`), 500);
    });
};
