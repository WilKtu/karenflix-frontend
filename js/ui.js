export const raiz = location.pathname.includes('/pages/') ? '../' : '';

export const escapar = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const toast = (mensaje, tipo = 'ok') => {
    let caja = document.getElementById('toasts');
    if (!caja) {
        caja = document.createElement('div');
        caja.id = 'toasts';
        caja.className = 'toasts';
        caja.setAttribute('aria-live', 'polite');
        document.body.append(caja);
    }
    const aviso = document.createElement('div');
    aviso.className = `toast ${tipo === 'error' ? 'error' : ''}`;
    aviso.textContent = mensaje;
    caja.append(aviso);
    requestAnimationFrame(() => aviso.classList.add('visible'));
    setTimeout(() => {
        aviso.classList.remove('visible');
        setTimeout(() => aviso.remove(), 400);
    }, 3500);
};

export const loader = (activo) => document.body.classList.toggle('cargando', activo);
export const estadoVacio = (texto) => `<p class="vacio">${escapar(texto)}</p>`;
export const confirmar = (texto) => window.confirm(texto);

// ---- Tema claro / oscuro (se recuerda la preferencia del navegador) ----
export const aplicarTema = () => {
    const guardado = localStorage.getItem('karenflix_tema');
    const preferido = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.dataset.theme = guardado || preferido;
};

export const alternarTema = () => {
    const nuevo = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = nuevo;
    localStorage.setItem('karenflix_tema', nuevo);
    return nuevo;
};
