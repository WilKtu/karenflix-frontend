import { api } from '../api.js';
import { guardarSesion } from '../auth.js';
import { toast, raiz } from '../ui.js';
import { montarNavbar } from '../components/navbar.js';

montarNavbar('');

const pestanas = document.querySelectorAll('[data-modo]');
const formularios = { login: document.getElementById('form-login'), registro: document.getElementById('form-registro') };

const mostrar = (modo) => {
    pestanas.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.modo === modo)));
    Object.entries(formularios).forEach(([clave, f]) => (f.hidden = clave !== modo));
};
pestanas.forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.modo)));
mostrar(new URLSearchParams(location.search).get('modo') === 'registro' ? 'registro' : 'login');

const correoValido = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);

const validar = (datos, esRegistro) => {
    if (esRegistro && !datos.nombre) return 'El nombre es obligatorio.';
    if (!correoValido(datos.email)) return 'Escribe un correo válido.';
    if (datos.password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
    if (esRegistro && datos.password !== datos.confirmar) return 'Las contraseñas no coinciden.';
    return '';
};

const enviar = (modo) => async (e) => {
    e.preventDefault();
    const form = e.target;
    const datos = Object.fromEntries(new FormData(form));
    const aviso = form.querySelector('.error-campo');
    const boton = form.querySelector('button[type="submit"]');
    aviso.textContent = validar(datos, modo === 'registro');
    if (aviso.textContent) return;

    boton.disabled = true;
    boton.textContent = 'Enviando...';
    try {
        const cuerpo = modo === 'registro' ? { nombre: datos.nombre, email: datos.email, password: datos.password } : { email: datos.email, password: datos.password };
        const { datos: sesion } = await api.post(`/auth/${modo === 'registro' ? 'register' : 'login'}`, cuerpo);
        guardarSesion(sesion.token, sesion.usuario);
        toast('¡Bienvenido a KAREN-FLIX!');
        setTimeout(() => (location.href = `${raiz}index.html`), 700);
    } catch (error) {
        aviso.textContent = error.message;
        toast(error.message, 'error');
        boton.disabled = false;
        boton.textContent = modo === 'registro' ? 'Crear cuenta' : 'Entrar';
    }
};

formularios.login.addEventListener('submit', enviar('login'));
formularios.registro.addEventListener('submit', enviar('registro'));
