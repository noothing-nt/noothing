import axios from 'axios';

const api = axios.create({
  // It MUST look for the VITE variable first, and fallback to localhost second
  baseURL: import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api` 
    : 'http://localhost:5000/api',
  withCredentials: true,
});

// Public routes that should NEVER trigger an auth redirect
const PUBLIC_PATHS = ['/auth', '/terms', '/privacy'];

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const currentPath = window.location.pathname;

      // ✅ Only redirect if we are NOT already on a public page
      const isPublicPage = PUBLIC_PATHS.some((p) => currentPath.startsWith(p));

      if (!isPublicPage) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(err);
  }
);

export default api; // <-- Only exported once at the very end!