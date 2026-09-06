import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || '/uploads';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      removeUser();
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export function getToken(): string | null {
  return localStorage.getItem('fdh_token');
}

export function setToken(token: string): void {
  localStorage.setItem('fdh_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('fdh_token');
}

export function getUser(): any | null {
  const user = localStorage.getItem('fdh_user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user: any): void {
  localStorage.setItem('fdh_user', JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem('fdh_user');
}

export function getImageUrl(path: string | any): string {
  if (!path) return '';
  const urlPath = typeof path === 'object' ? (path.image_url || path.url || '') : String(path);
  if (!urlPath) return '';
  if (urlPath.startsWith('http') || urlPath.startsWith('blob:')) return urlPath;
  return `${UPLOADS_BASE_URL}/${urlPath}`;
}

export default api;
