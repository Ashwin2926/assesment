import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const BASE_URL = `${API_URL}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, user_type) =>
    api.post('/auth/register', { name, email, password, user_type }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const requestService = {
  getRequests: () => api.get('/requests'),
  createRequest: (data) => api.post('/requests', data),
  getRequest: (id) => api.get(`/requests/${id}`),
  acceptRequest: (id) => api.put(`/requests/${id}/accept`),
  updateRequestStatus: (id, status) => api.put(`/requests/${id}/status`, { status }),
};

export default api;
