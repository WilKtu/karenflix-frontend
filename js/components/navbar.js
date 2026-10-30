import { getUsuario, cerrarSesion, esAdmin } from '../auth.js';
import { raiz, aplicarTema, alternarTema } from '../ui.js';

const enlaces = (activa) => [
    ['inicio', 'Inicio', `${raiz}index.html`],
    ['populares', 'Populares', `${raiz}index.html#populares`],
    ['catalogo', 'Catálogo', `${raiz}pages/catalogo.html`]
].map(([id, texto, href]) => `<a href="${href}" class="${id === activa ? 'activo' : ''}" ${id === activa ? 'aria-current="page"' : ''}>${texto}</a>`).join('');

const botonesSesion = () => {
    const usuario = getUsuario();
    if (!usuario) {
        return `<a class="btn btn-texto" href="${raiz}pages/login.html">Iniciar sesión</a>
                <a class="btn btn-primario" href="${raiz}pages/login.html?modo=registro">Registrarse</a>`;
    }
    const admin = esAdmin() ? `<a class="btn" href="${raiz}pages/admin.html">Admin</a>` : '';
    return `${admin}<button class="btn" id="btn-salir" type="button">Salir (${usuario.nombre})</button>`;
};

export const montarNavbar = (activa) => {
    aplicarTema();
    document.getElementById('navbar').innerHTML = `
        <div class="navbar"><div class="contenedor navbar-fila">
            <button class="btn btn-icono" id="btn-menu" type="button" aria-label="Abrir menú" aria-expanded="false">☰</button>
            <a class="logo" href="${raiz}index.html">KAREN<span>-FLIX</span></a>
            <nav class="nav-links" aria-label="Principal">${enlaces(activa)}</nav>
            <form class="buscador" id="form-buscar" role="search">
                <input type="search" id="buscar" placeholder="Buscar títulos..." aria-label="Buscar títulos">
                <button class="btn" type="submit">Buscar</button>
            </form>
            <div class="nav-acciones">
                <button class="btn btn-icono" id="btn-tema" type="button" aria-label="Cambiar entre tema claro y oscuro">◐</button>
                ${botonesSesion()}
            </div>
        </div></div>
        <aside class="panel" aria-label="Menú lateral">${enlaces(activa)}</aside>
        <div class="fondo-panel" id="fondo-panel"></div>`;

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
    document.getElementById('btn-salir')?.addEventListener('click', () => {
        cerrarSesion();
        location.reload();
    });
    document.getElementById('form-buscar').addEventListener('submit', (e) => {
        e.preventDefault();
        const q = encodeURIComponent(document.getElementById('buscar').value.trim());
        location.href = `${raiz}pages/catalogo.html?q=${q}`;
    });
};
