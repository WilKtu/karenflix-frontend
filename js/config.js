// En la compu usa el backend local; en internet usa el backend desplegado.
const enLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

export const CONFIG = {
  API_URL: enLocal
    ? 'http://localhost:3000/api/v1'
    : 'https://karenflix-backend.vercel.app/api/v1'
};
