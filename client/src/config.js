// ── Auto-switches between dev and production ──────────
const isProd = import.meta.env.PROD;

const config = {
  API_URL: isProd
    ? import.meta.env.VITE_API_URL_PROD
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),

  SOCKET_URL: isProd
    ? import.meta.env.VITE_SOCKET_URL_PROD
    : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'),

  APP_URL: isProd
    ? import.meta.env.VITE_APP_URL_PROD
    : 'http://localhost:5173',

  ZEGO_APP_ID: parseInt(import.meta.env.VITE_ZEGO_APP_ID || '0'),
  ZEGO_SERVER_SECRET: import.meta.env.VITE_ZEGO_SERVER_SECRET || '',

  IS_PROD: isProd,
};

export default config;