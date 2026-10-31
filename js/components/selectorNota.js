// Selector visual del 1 al 10. Devuelve una función para leer la nota elegida.
export const montarSelectorNota = (contenedor) => {
  let nota = 0;
  contenedor.innerHTML = ''; 
  contenedor.className = 'selector-nota';
  contenedor.setAttribute('role', 'group');
  contenedor.setAttribute('aria-label', 'Calificación del 1 al 10');

  for (let i = 1; i <= 10; i++) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'btn';
    boton.textContent = i;
    boton.dataset.nota = i;
    boton.setAttribute('aria-pressed', 'false');

    boton.addEventListener('click', () => {
      nota = i;
      contenedor.querySelectorAll('button').forEach((b) =>
        b.setAttribute('aria-pressed', String(b === boton))
      );
    });

    contenedor.append(boton);
  }

  return () => nota;
};
