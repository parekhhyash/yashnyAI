// Backend base URL. Set VITE_API_BASE_URL at build time (e.g. on Vercel);
// falls back to the local dev server.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
