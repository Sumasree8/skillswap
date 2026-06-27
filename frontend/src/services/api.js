/**
 * services/api.js
 * Axios instance with:
 *  - automatic JWT injection
 *  - 401 → redirect to /login
 *  - consistent error shape
 *
 * In dev, Vite proxies /api → http://localhost:5000 (vite.config.js).
 * In prod, set VITE_API_URL to your backend origin.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';                              // works with Vite proxy in dev

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ── Request: attach token ─────────────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ss_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

/* ── Response: handle auth errors ─────────────────────────────────── */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ss_token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;

/* ── Typed API helpers ─────────────────────────────────────────────── */
export const authApi = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  me:       ()      => api.get('/auth/me'),
  logout:   ()      => api.post('/auth/logout'),
};

export const usersApi = {
  getMatches:  ()       => api.get('/users/match'),
  getById:     (id)     => api.get(`/users/${id}`),
  updateProfile:(data)  => api.put('/users/profile', data),
  verifySkill: (data)   => api.post('/users/verify-skill', data),
  search:      (params) => api.get('/users/search', { params }),
};

export const swipesApi = {
  getFeed:    ()                  => api.get('/swipes/feed'),
  swipe:      (targetId, action)  => api.post('/swipes', { targetId, action }),
  getMatches: ()                  => api.get('/swipes/matches'),
  reset:      ()                  => api.post('/swipes/reset'),
};

export const swapsApi = {
  request:  (data) => api.post('/swaps/request', data),
  accept:   (id)   => api.put(`/swaps/${id}/accept`),
  reject:   (id)   => api.put(`/swaps/${id}/reject`),
  complete: (id)   => api.put(`/swaps/${id}/complete`),
  cancel:   (id)   => api.put(`/swaps/${id}/cancel`),
  getMy:    ()     => api.get('/swaps/my'),
  getById:  (id)   => api.get(`/swaps/${id}`),
};

export const creditsApi = {
  getBalance: ()       => api.get('/credits/balance'),
  getHistory: (params) => api.get('/credits/history', { params }),
};

export const sessionsApi = {
  create:   (data)     => api.post('/sessions/create', data),
  join:     (sessionId)=> api.post('/sessions/join', { sessionId }),
  complete: (id)       => api.put(`/sessions/${id}/complete`),
  getOpen:  (params)   => api.get('/sessions/open', { params }),
  getMy:    ()         => api.get('/sessions/my'),
  getById:  (id)       => api.get(`/sessions/${id}`),
};

export const reviewsApi = {
  create:    (data)   => api.post('/reviews', data),
  getByUser: (userId) => api.get(`/reviews/${userId}`),
};

export const circlesApi = {
  create:  (data) => api.post('/circles/create', data),
  join:    (id)   => api.post(`/circles/${id}/join`),
  complete:(id)   => api.put(`/circles/${id}/complete`),
  getAll:  (p)    => api.get('/circles', { params: p }),
  getMy:   ()     => api.get('/circles/my'),
};
