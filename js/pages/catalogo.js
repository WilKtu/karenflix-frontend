import { api } from '../api.js';
import { getFavoritosIds } from '../auth.js';
import { toast, loader, estadoVacio, escapar } from '../ui.js';
import { tarjetaPelicula } from '../components/tarjetaPelicula.js';
import { montarNavbar } from '../components/navbar.js';

const urlParams = new URLSearchParams(location.search);
const modoFavoritosInicial = urlParams.get('favoritos') === '1';

montarNavbar(modoFavoritosInicial ? 'favoritos' : 'catalogo');

const LIMITE = 8;
const filtros = {
    q: urlParams.get('q') || '',
    categoria: urlParams.get('categoria') || '',
    tipo: '',
    orden: 'ranking',
    soloFavoritos: modoFavoritosInicial
};
let pagina = 1;

const lista = document.getElementById('lista');
const botonMas = document.getElementById('mas');
const btnLimpiar = document.getElementById('btn-limpiar-filtros');
const selectCategoria = document.getElementById('categoria-select');

const actualizarCabecera = () => {
    const tituloEl = document.getElementById('catalogo-titulo');
    const eyebrowEl = document.getElementById('catalogo-eyebrow');
    if (filtros.soloFavoritos) {
        eyebrowEl.textContent = 'Mi lista personal';
        tituloEl.textContent = 'Mis Favoritos ♥';
    } else if (filtros.categoria) {
        eyebrowEl.textContent = 'Categoría seleccionada';
        tituloEl.textContent = filtros.categoria;
    } else if (filtros.q) {
        eyebrowEl.textContent = 'Resultados de búsqueda';
        tituloEl.textContent = `"${filtros.q}"`;
    } else {
        eyebrowEl.textContent = 'Explora';
        tituloEl.textContent = 'Catálogo';
    }

    const hayFiltros = Boolean(filtros.q || filtros.categoria || filtros.tipo || filtros.soloFavoritos);
    if (btnLimpiar) btnLimpiar.hidden = !hayFiltros;
};

const cargar = async (reiniciar) => {
    if (reiniciar) pagina = 1;
    actualizarCabecera();

    const params = new URLSearchParams({
        q: filtros.q,
        categoria: filtros.categoria,
        tipo: filtros.tipo,
        orden: filtros.orden,
        page: filtros.soloFavoritos ? 1 : pagina,
        limit: filtros.soloFavoritos ? 50 : LIMITE
    });
    [...params].forEach(([clave, valor]) => !valor && params.delete(clave));
    loader(true);
    try {
        let { datos, total } = await api.get(`/peliculas?${params}`);
        if (filtros.soloFavoritos) {
            const idsFav = getFavoritosIds();
            datos = (datos || []).filter((p) => idsFav.includes(Number(p.id)));
            total = datos.length;
        }
        const html = datos.map(tarjetaPelicula).join('');
        lista.innerHTML = reiniciar
            ? html ||
              estadoVacio(
                  filtros.soloFavoritos
                      ? 'Aún no tienes películas guardadas en tus Favoritos. Haz clic en el ícono ♡ de cualquier película para agregarla.'
                      : 'No se encontraron títulos con esa búsqueda. Prueba con otro nombre o selecciona "Todas las categorías".'
              )
            : lista.innerHTML + html;
        botonMas.hidden = filtros.soloFavoritos || pagina * LIMITE >= total;
    } catch (error) {
        toast(error.message, 'error');
    } finally {
        loader(false);
    }
};

const cargarSelectorCategorias = async () => {
    const { datos } = await api.get('/categorias');
    selectCategoria.innerHTML = [
        `<option value="">Categorías: Todas</option>`,
        `<option value="__favoritos__" ${filtros.soloFavoritos ? 'selected' : ''}>♥ Mis Favoritos</option>`,
        ...datos.map(
            (c) =>
                `<option value="${escapar(c.nombre)}" ${
                    !filtros.soloFavoritos && filtros.categoria === c.nombre ? 'selected' : ''
                }>Categoría: ${escapar(c.nombre)}</option>`
        )
    ].join('');

    selectCategoria.addEventListener('change', () => {
        const val = selectCategoria.value;
        if (val === '__favoritos__') {
            filtros.soloFavoritos = true;
            filtros.categoria = '';
        } else {
            filtros.soloFavoritos = false;
            filtros.categoria = val;
        }
        cargar(true);
    });
};

['q', 'tipo', 'orden'].forEach((campo) => {
    const el = document.getElementById(campo);
    if (!el) return;
    el.value = filtros[campo];
    el.addEventListener('input', () => {
        filtros[campo] = el.value.trim();
        cargar(true);
    });
});

btnLimpiar?.addEventListener('click', () => {
    filtros.q = '';
    filtros.categoria = '';
    filtros.tipo = '';
    filtros.soloFavoritos = false;
    document.getElementById('q').value = '';
    document.getElementById('tipo').value = '';
    selectCategoria.value = '';
    history.replaceState(null, '', 'catalogo.html');
    cargar(true);
});

botonMas.addEventListener('click', () => {
    pagina++;
    cargar(false);
});

window.addEventListener('favoritos-actualizados', () => {
    if (filtros.soloFavoritos) cargar(true);
});

cargarSelectorCategorias().catch((e) => toast(e.message, 'error'));
cargar(true);
