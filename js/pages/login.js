import { api } from '../api.js';
import { guardarSesion } from '../auth.js';
import { toast, raiz } from '../ui.js';
import { montarNavbar } from '../components/navbar.js';

montarNavbar('');

const pestanas = document.querySelectorAll('[data-modo]');
const formularios = {
    login: document.getElementById('form-login'),
    registro: document.getElementById('form-registro')
};
const cajaAuth = document.getElementById('caja-auth');

const limpiarAlertas = () => {
    document.getElementById('alerta-login').hidden = true;
    document.getElementById('alerta-registro').hidden = true;
    document.getElementById('error-login-txt').textContent = '';
    document.getElementById('error-registro-txt').textContent = '';
    document.querySelectorAll('.input-invalido').forEach((el) => el.classList.remove('input-invalido'));
};

const mostrar = (modo) => {
    limpiarAlertas();
    pestanas.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.modo === modo)));
    Object.entries(formularios).forEach(([clave, f]) => (f.hidden = clave !== modo));
};

pestanas.forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.modo)));
mostrar(new URLSearchParams(location.search).get('modo') === 'registro' ? 'registro' : 'login');

// Mostrar / ocultar contraseña
document.querySelectorAll('[data-toggle-pass]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.togglePass);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? 'Ver' : 'Ocultar';
    });
});

const correoValido = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(c || '').trim());

// Validación en tiempo real del formato de correo
const inputLoginEmail = document.getElementById('l-email');
const hintLoginEmail = document.getElementById('hint-l-email');
inputLoginEmail.addEventListener('input', () => {
    const val = inputLoginEmail.value.trim();
    if (!val) {
        hintLoginEmail.textContent = '';
        inputLoginEmail.classList.remove('input-invalido');
        return;
    }
    if (!correoValido(val)) {
        hintLoginEmail.textContent = 'Formato esperado: usuario@dominio.com';
        hintLoginEmail.style.color = 'var(--danger)';
        inputLoginEmail.classList.add('input-invalido');
    } else {
        hintLoginEmail.textContent = '✓ Formato de correo válido';
        hintLoginEmail.style.color = 'var(--ok)';
        inputLoginEmail.classList.remove('input-invalido');
    }
});

const dispararShake = () => {
    cajaAuth.classList.remove('shake-error');
    void cajaAuth.offsetWidth;
    cajaAuth.classList.add('shake-error');
};

const mostrarError = (modo, mensaje, campoId) => {
    const alertaBox = document.getElementById(modo === 'registro' ? 'alerta-registro' : 'alerta-login');
    const alertaTxt = document.getElementById(modo === 'registro' ? 'error-registro-txt' : 'error-login-txt');
    alertaTxt.textContent = mensaje;
    alertaBox.hidden = false;
    if (campoId) document.getElementById(campoId)?.classList.add('input-invalido');
    dispararShake();
};

const validar = (datos, esRegistro) => {
    if (esRegistro && (!datos.nombre || datos.nombre.trim().length < 2)) {
        return { msg: 'El nombre completo es obligatorio (mínimo 2 caracteres).', campo: 'r-nombre' };
    }
    if (!datos.email || !datos.email.trim()) {
        return { msg: 'Debes ingresar tu dirección de correo electrónico.', campo: esRegistro ? 'r-email' : 'l-email' };
    }
    if (!correoValido(datos.email)) {
        return {
            msg: 'El formato del correo es incorrecto. Incluye "@" y un dominio válido (ej: nombre@correo.com).',
            campo: esRegistro ? 'r-email' : 'l-email'
        };
    }
    if (!datos.password) {
        return { msg: 'Debes ingresar tu contraseña.', campo: esRegistro ? 'r-pass' : 'l-pass' };
    }
    if (datos.password.length < 8) {
        return { msg: 'La contraseña debe tener como mínimo 8 caracteres.', campo: esRegistro ? 'r-pass' : 'l-pass' };
    }
    if (esRegistro && datos.password !== datos.confirmar) {
        return { msg: 'Las contraseñas ingresadas no coinciden. Verifícalas.', campo: 'r-conf' };
    }
    return null;
};

const enviar = (modo) => async (e) => {
    e.preventDefault();
    limpiarAlertas();
    const form = e.target;
    const datos = Object.fromEntries(new FormData(form));
    const boton = form.querySelector('button[type="submit"]');

    const errorValidacion = validar(datos, modo === 'registro');
    if (errorValidacion) {
        mostrarError(modo, errorValidacion.msg, errorValidacion.campo);
        return;
    }

    boton.disabled = true;
    boton.textContent = 'Verificando...';
    try {
        const cuerpo =
            modo === 'registro'
                ? { nombre: datos.nombre.trim(), email: datos.email.trim(), password: datos.password }
                : { email: datos.email.trim(), password: datos.password };

        const { datos: sesion } = await api.post(`/auth/${modo === 'registro' ? 'register' : 'login'}`, cuerpo);
        guardarSesion(sesion.token, sesion.usuario);

        toast(`Bienvenida(o), ${sesion.usuario.nombre}`);

        const redirectParam = new URLSearchParams(location.search).get('redirect');
        setTimeout(() => {
            if (redirectParam) {
                location.href = `${raiz}${redirectParam.replace(/^\.\.\//, '')}`;
            } else if (sesion.usuario.rol === 'admin') {
                location.href = `${raiz}pages/admin.html`;
            } else {
                location.href = `${raiz}index.html`;
            }
        }, 600);
    } catch (error) {
        mostrarError(modo, error.message);
        toast(error.message, 'error');
        boton.disabled = false;
        boton.textContent = modo === 'registro' ? 'Crear cuenta' : 'Iniciar sesión';
    }
};

formularios.login.addEventListener('submit', enviar('login'));
formularios.registro.addEventListener('submit', enviar('registro'));
