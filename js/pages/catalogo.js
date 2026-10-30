import { api } from '../api.js';
import { getFavoritosIds } from '../auth.js';
import { toast, loader, estadoVacio } from '../ui.js';
import { tarjetaPelicula } from '../components/tarjetaPelicula.js';
import { montarNavbar } from '../components/navbar.js';

const urlParams = new URLSearchParams(location.search);
const modoFavoritosInicial = urlParams.get('favoritos') === '1';

montarNavbar(modoFavoritosInicial ? 'favoritos' : 'catalogo');

const LIMITE = 8;
const filtros = {
    q: urlParams.get('q') || '',
    categoria: urlParams.get('categoria') || '',
    categoria_id: '',
    tipo: '',
    anio: '',
    orden: 'ranking',
    soloFavoritos: modoFavoritosInicial
};
let pagina = 1;

const lista = document.getElementById('lista');
const botonMas = document.getElementById('mas');

const cargar = async (reiniciar) => {
    if (reiniciar) pagina = 1;
    const params = new URLSearchParams({
        q: filtros.q,
        categoria: filtros.categoria,
        categoria_id: filtros.categoria_id,
        tipo: filtros.tipo,
        anio: filtros.anio,
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
                      : 'No se encontraron producciones con esos filtros.'
              )
            : lista.innerHTML + html;
        botonMas.hidden = filtros.soloFavoritos || pagina * LIMITE >= total;
    } catch (error) {
        toast(error.message, 'error');
    } finally {
        loader(false);
    }
};

const pintarCategorias = async () => {
    const { datos } = await api.get('/categorias');
    const chips = document.getElementById('chips');
    const opciones = [
        { id: '', nombre: '', etiqueta: 'Todas', esFav: false },
        { id: '__fav__', nombre: '', etiqueta: '♥ Mis Favoritos', esFav: true },
        ...datos.map((c) => ({ id: c.id, nombre: c.nombre, etiqueta: c.nombre, esFav: false }))
    ];
    chips.innerHTML = opciones
        .map((c) => {
            const activo = c.esFav
                ? filtros.soloFavoritos
                : !filtros.soloFavoritos && c.nombre === filtros.categoria;
            return `<button type="button" class="btn chip" data-cat="${c.nombre}" data-cat-id="${
                c.esFav ? '' : c.id || ''
            }" data-fav-chip="${c.esFav ? '1' : '0'}" aria-pressed="${activo}">${c.etiqueta}</button>`;
        })
        .join('');

    chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        filtros.soloFavoritos = chip.dataset.favChip === '1';
        filtros.categoria = chip.dataset.cat;
        filtros.categoria_id = chip.dataset.catId;
        chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        cargar(true);
    });
};

['q', 'tipo', 'anio', 'orden'].forEach((campo) => {
    const el = document.getElementById(campo);
    el.value = filtros[campo];
    el.addEventListener('input', () => {
        filtros[campo] = el.value.trim();
        cargar(true);
    });
});

botonMas.addEventListener('click', () => {
    pagina++;
    cargar(false);
});

window.addEventListener('favoritos-actualizados', () => {
    if (filtros.soloFavoritos) cargar(true);
});

pintarCategorias().catch((e) => toast(e.message, 'error'));
cargar(true);
