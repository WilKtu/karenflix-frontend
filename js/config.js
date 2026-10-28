/**
 * Configuración central de la aplicación.
 * En producción, ajusta API_BASE_URL al entorno real.
 */
export const APP_CONFIG = Object.freeze({
  APP_NAME: "Nébula",
  API_BASE_URL: "http://localhost:3000/api",
  REQUEST_TIMEOUT_MS: 10000,
  USE_MOCK_DATA: true,
  DEFAULT_LANGUAGE: "es"
});
