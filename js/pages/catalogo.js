import { api } from '../api.js';
import { toast, loader, estadoVacio } from '../ui.js';
import { tarjetaPelicula } from '../components/tarjetaPelicula.js';
import { montarNavbar } from '../components/navbar.js';

montarNavbar('catalogo');

const LIMITE = 8;
const filtros = { q: new URLSearchParams(location.search).get('q') || '', categoria: '', tipo: '', anio: '', orden: 'ranking' };
let pagina = 1;

const lista = document.getElementById('lista');
const botonMas = document.getElementById('mas');

const cargar = async (reiniciar) => {
    if (reiniciar) pagina = 1;
    const params = new URLSearchParams({ ...filtros, page: pagina, limit: LIMITE });
    [...params].forEach(([clave, valor]) => !valor && params.delete(clave));
    loader(true);
    try {
        const { datos, total } = await api.get(`/peliculas?${params}`);
        const html = datos.map(tarjetaPelicula).join('');
        lista.innerHTML = reiniciar ? html || estadoVacio('No se encontraron resultados') : lista.innerHTML + html;
        botonMas.hidden = pagina * LIMITE >= total;
    } catch (error) {
        toast(error.message, 'error');
    } finally {
        loader(false);
    }
};

const pintarCategorias = async () => {
    const { datos } = await api.get('/categorias');
    const chips = document.getElementById('chips');
    chips.innerHTML = [{ nombre: '' }, ...datos].map((c) =>
        `<button type="button" class="btn chip" data-cat="${c.nombre}" aria-pressed="${c.nombre === ''}">${c.nombre || 'Todas'}</button>`).join('');
    chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        filtros.categoria = chip.dataset.cat;
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

pintarCategorias().catch((e) => toast(e.message, 'error'));
cargar(true);
