import { APP_CONFIG } from "./config.js";

export async function apiRequest(path, options = {}) {
  if (APP_CONFIG.USE_MOCK_DATA) {
    throw new Error("El modo de prueba está activo. Conecta el backend y cambia USE_MOCK_DATA a false.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
