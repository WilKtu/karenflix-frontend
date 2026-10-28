import { APP_CONFIG } from "./config.js";

const mockTitles = [
  { id: 1, title: "Odisea estelar", genre: "Ciencia ficción", year: 2025, rating: 8.7, type: "Serie", symbol: "✦", featured: true, description: "Una tripulación descubre señales en los límites de una galaxia desconocida.", color: "linear-gradient(135deg,#312e81,#0e7490)" },
  { id: 2, title: "Planeta azul", genre: "Documental", year: 2024, rating: 9.1, type: "Documental", symbol: "◉", featured: true, description: "Un viaje por ecosistemas extraordinarios y las especies que los habitan.", color: "linear-gradient(135deg,#065f46,#0e7490)" },
  { id: 3, title: "La última estación", genre: "Drama", year: 2023, rating: 8.2, type: "Película", symbol: "◈", featured: true, description: "Dos desconocidos coinciden en una estación y cambian sus destinos.", color: "linear-gradient(135deg,#7f1d1d,#9a3412)" },
  { id: 4, title: "Código salvaje", genre: "Aventura", year: 2025, rating: 8.5, type: "Serie", symbol: "⌘", featured: true, description: "Un equipo debe resolver un misterio oculto en una reserva natural.", color: "linear-gradient(135deg,#365314,#854d0e)" },
  { id: 5, title: "Pequeños gigantes", genre: "Animación", year: 2024, rating: 7.9, type: "Película", symbol: "✧", featured: false, description: "Una pandilla diminuta demuestra que el valor no depende del tamaño.", color: "linear-gradient(135deg,#6b21a8,#be185d)" },
  { id: 6, title: "Frecuencia cero", genre: "Ciencia ficción", year: 2022, rating: 8.0, type: "Serie", symbol: "⌁", featured: false, description: "Una señal de radio empieza a transmitir mensajes del futuro.", color: "linear-gradient(135deg,#1e3a8a,#6d28d9)" },
  { id: 7, title: "Sabores del mundo", genre: "Documental", year: 2025, rating: 8.8, type: "Documental", symbol: "✺", featured: false, description: "Tradiciones culinarias y las historias detrás de cada receta.", color: "linear-gradient(135deg,#9a3412,#a16207)" },
  { id: 8, title: "Ruta al horizonte", genre: "Aventura", year: 2021, rating: 7.7, type: "Película", symbol: "➤", featured: false, description: "Una expedición recorre caminos que no aparecen en los mapas.", color: "linear-gradient(135deg,#155e75,#166534)" }
];

const $ = (selector) => document.querySelector(selector);

function createCard(item) {
  const article = document.createElement("article");
  article.className = "content-card";
  article.innerHTML = `
    <div class="content-card__poster" style="--poster-bg: ${item.color}">
      <span class="content-card__tag">${item.type}</span>
      <span class="content-card__symbol" aria-hidden="true">${item.symbol}</span>
    </div>
    <div class="content-card__body">
      <h3 class="content-card__title"></h3>
      <div class="content-card__meta">
        <span>${item.year}</span><span>${item.genre}</span><span>★ ${item.rating.toFixed(1)}</span>
      </div>
      <p class="content-card__description"></p>
    </div>`;
  // textContent evita interpretar títulos/descripciones como HTML.
  article.querySelector(".content-card__title").textContent = item.title;
  article.querySelector(".content-card__description").textContent = item.description;
  return article;
}

function renderCards(container, items) {
  container.replaceChildren(...items.map(createCard));
}

function applyFilters() {
  const query = $("#search-input").value.trim().toLocaleLowerCase("es");
  const genre = $("#genre-filter").value;
  const filtered = mockTitles.filter((item) => {
    const matchesQuery = `${item.title} ${item.genre} ${item.description}`.toLocaleLowerCase("es").includes(query);
    const matchesGenre = genre === "todos" || item.genre === genre;
    return matchesQuery && matchesGenre;
  });
  renderCards($("#catalog-list"), filtered);
  $("#empty-state").hidden = filtered.length > 0;
}

function initUI() {
  document.title = `${APP_CONFIG.APP_NAME} — Explora contenido`;
  renderCards($("#popular-list"), mockTitles.filter((item) => item.featured));
  renderCards($("#catalog-list"), mockTitles);
  $("#search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
  $("#search-input").addEventListener("input", applyFilters);
  $("#genre-filter").addEventListener("change", applyFilters);
}

document.addEventListener("DOMContentLoaded", initUI);
