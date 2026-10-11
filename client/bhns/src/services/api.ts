import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite will proxy this to Django
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach auth token if you are using token-based auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authService = {
  login: (data: any) => api.post('/login/', data),
  register: (data: any) => api.post('/register/', data),
};

export const roomService = {
  getAll: () => api.get('/rooms/'),
  create: (data: any) => api.post('/rooms/create/', data),
  update: (id: number, data: any) => api.put(`/rooms/${id}/update/`, data),
  delete: (id: number) => api.delete(`/rooms/${id}/delete/`),
};

export const bedService = {
  getAll: () => api.get('/beds/'),
  create: (data: any) => api.post('/beds/create/', data),
  update: (id: number, data: any) => api.put(`/beds/${id}/update/`, data),
  delete: (id: number) => api.delete(`/beds/${id}/delete/`),
};

// You can easily add tenancyService, invoiceService, etc., following this pattern.
export default api;